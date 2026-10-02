const mongoose = require('mongoose');
const Payout = require('../models/Payout');
const PayoutAccount = require('../models/PayoutAccount');
const PayoutAllocation = require('../models/PayoutAllocation');
const Earning = require('../models/Earning');
const SellerPayoutLock = require('../models/SellerPayoutLock');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../utils/constants');
const { minimumPayoutAmount } = require('../config/commissionConfig');
const { prepareSeller, referenceToken } = require('./earningService');

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;
const IFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACTIVE_PAYOUT = ['REQUESTED', 'PROCESSING'];
const attempts = new Map();

function clean(value, max, label) {
  if (typeof value !== 'string') throw new AppError(`${label} is invalid`, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  const text = value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001F]/g, '').trim();
  if (!text || text.length > max) throw new AppError(`${label} is invalid`, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  return text;
}

function maskAccount(number) {
  const digits = String(number || '').replace(/\D/g, '');
  const last = digits.slice(-4);
  return `XXXXXX${last}`;
}

function presentAccount(account) {
  if (!account) return null;
  return {
    id: String(account._id),
    accountHolderName: account.accountHolderName,
    bankName: account.bankName,
    maskedAccountNumber: maskAccount(account.accountNumber),
    ifsc: account.ifsc,
    status: account.status,
  };
}

function presentPayout(payout, account) {
  return {
    id: String(payout._id),
    payoutReference: payout.payoutReference,
    amount: payout.amount,
    currency: payout.currency || 'INR',
    status: payout.status,
    payoutMethod: payout.payoutMethod || 'BANK',
    requestedAt: payout.requestedAt,
    processedAt: payout.processedAt,
    paidAt: payout.paidAt,
    failureReason: payout.failureReason || '',
    automated: false,
    account: account ? presentAccount(account) : null,
  };
}

async function withSellerLock(sellerId, work) {
  const token = new mongoose.Types.ObjectId();
  const stale = new Date(Date.now() - 15000);
  const started = Date.now();
  let acquired = false;
  while (Date.now() - started < 4000) {
    try {
      await SellerPayoutLock.create({ seller: sellerId, lockedAt: new Date(), token });
      acquired = true;
      break;
    } catch (error) {
      if (error.code !== 11000) throw error;
      const stolen = await SellerPayoutLock.findOneAndUpdate(
        { seller: sellerId, lockedAt: { $lt: stale } },
        { $set: { lockedAt: new Date(), token } }
      );
      if (stolen) {
        acquired = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }
  if (!acquired) {
    throw new AppError('A payout request is already being processed.', HTTP_STATUS.CONFLICT, 'PAYOUT_ALREADY_PROCESSING');
  }
  try {
    return await work();
  } finally {
    await SellerPayoutLock.deleteOne({ seller: sellerId, token });
  }
}

async function openAllocations(sellerId) {
  const rows = await PayoutAllocation.aggregate([
    { $match: { seller: sellerId } },
    { $lookup: { from: 'payouts', localField: 'payout', foreignField: '_id', as: 'payout' } },
    { $unwind: '$payout' },
    { $match: { 'payout.status': { $in: ACTIVE_PAYOUT } } },
    { $group: { _id: '$earning', total: { $sum: '$amount' } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.total]));
}

async function availableBalance(sellerId) {
  await prepareSeller(sellerId);
  const earnings = await Earning.find({ seller: sellerId, status: 'AVAILABLE' }).select('netEarning');
  const allocated = await openAllocations(sellerId);
  return earnings.reduce((sum, earning) => {
    const reserved = allocated.get(String(earning._id)) || 0;
    return sum + Math.max(0, earning.netEarning - reserved);
  }, 0);
}

function assertPayoutRate(userId) {
  const now = Date.now();
  const recent = (attempts.get(String(userId)) || []).filter((stamp) => now - stamp < 15 * 60 * 1000);
  if (recent.length >= 5) {
    throw new AppError('Please wait before requesting another payout.', HTTP_STATUS.TOO_MANY_REQUESTS, 'PAYOUT_CREATION_FAILED');
  }
  recent.push(now);
  attempts.set(String(userId), recent);
}

async function getAccount(user) {
  const account = await PayoutAccount.findOne({ seller: user._id });
  return presentAccount(account);
}

async function saveAccount(user, body, accountId) {
  const accountHolderName = clean(body?.accountHolderName, 80, 'Account holder name');
  const bankName = clean(body?.bankName, 80, 'Bank name');
  const digits = String(body?.accountNumber || '').replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 18) {
    throw new AppError('Account number is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  const ifsc = clean(String(body?.ifsc || '').toUpperCase(), 11, 'IFSC');
  if (!IFSC.test(ifsc)) throw new AppError('IFSC is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');

  if (accountId) {
    if (!OBJECT_ID.test(accountId)) throw new AppError('Payout account is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    const updated = await PayoutAccount.findOneAndUpdate(
      { _id: accountId, seller: user._id },
      { $set: { accountHolderName, bankName, accountNumber: digits, ifsc, status: 'PENDING_VERIFICATION' } },
      { new: true }
    );
    if (!updated) throw new AppError('Payout account was not found', HTTP_STATUS.NOT_FOUND, 'PAYOUT_ACCOUNT_REQUIRED');
    return presentAccount(updated);
  }

  const existing = await PayoutAccount.findOne({ seller: user._id });
  if (existing) throw new AppError('A payout account already exists', HTTP_STATUS.CONFLICT, 'VALIDATION_ERROR');
  const created = await PayoutAccount.create({
    seller: user._id,
    accountHolderName,
    bankName,
    accountNumber: digits,
    ifsc,
    status: 'PENDING_VERIFICATION',
  });
  return presentAccount(created);
}

async function requestPayout(user, body) {
  assertPayoutRate(user._id);
  const amount = Number(body?.amount);
  if (!Number.isInteger(amount) || amount < 1) {
    throw new AppError('Enter a valid payout amount.', HTTP_STATUS.BAD_REQUEST, 'INVALID_PAYOUT_AMOUNT');
  }
  const minimum = minimumPayoutAmount();
  if (amount < minimum) {
    throw new AppError(`Minimum payout is ₹${minimum}.`, HTTP_STATUS.CONFLICT, 'MINIMUM_PAYOUT_NOT_REACHED');
  }
  const account = await PayoutAccount.findOne({ seller: user._id });
  if (!account || account.status === 'FAILED') {
    throw new AppError('Add a payout account before withdrawing.', HTTP_STATUS.CONFLICT, 'PAYOUT_ACCOUNT_REQUIRED');
  }

  return withSellerLock(user._id, async () => {
    const balance = await availableBalance(user._id);
    if (amount > balance) {
      throw new AppError('That amount is more than your available balance.', HTTP_STATUS.CONFLICT, 'INSUFFICIENT_AVAILABLE_BALANCE');
    }
    const earnings = await Earning.find({ seller: user._id, status: 'AVAILABLE' }).sort({ createdAt: 1 });
    const reserved = await openAllocations(user._id);
    let remaining = amount;
    const slices = [];
    earnings.forEach((earning) => {
      if (remaining <= 0) return;
      const open = reserved.get(String(earning._id)) || 0;
      const free = earning.netEarning - open;
      if (free <= 0) return;
      const take = Math.min(free, remaining);
      slices.push({ earning, amount: take, closes: open + take >= earning.netEarning });
      remaining -= take;
    });
    if (remaining > 0 || !slices.length) {
      throw new AppError('That amount is more than your available balance.', HTTP_STATUS.CONFLICT, 'INSUFFICIENT_AVAILABLE_BALANCE');
    }

    let payout;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        payout = await Payout.create({
          seller: user._id,
          payoutReference: referenceToken(),
          amount,
          currency: 'INR',
          status: 'REQUESTED',
          payoutMethod: 'BANK',
          payoutAccount: account._id,
          requestedAt: new Date(),
        });
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 2) throw error;
      }
    }

    await PayoutAllocation.insertMany(slices.map((slice) => ({
      payout: payout._id,
      earning: slice.earning._id,
      seller: user._id,
      amount: slice.amount,
    })));
    const closingIds = slices.filter((slice) => slice.closes).map((slice) => slice.earning._id);
    if (closingIds.length) {
      await Earning.updateMany(
        { _id: { $in: closingIds }, seller: user._id, status: 'AVAILABLE' },
        { $set: { status: 'PAYOUT_PENDING', payout: payout._id, payoutReference: payout.payoutReference } }
      );
    }
    logger.info('payout_requested', { payoutId: String(payout._id), sellerId: String(user._id) });
    const { notifyPayoutRequested } = require('./notificationService');
    await notifyPayoutRequested(payout);
    return presentPayout(payout, account);
  });
}

async function listPayouts(user, query) {
  const page = Number(query?.page || 1);
  const limit = Number(query?.limit || 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new AppError('Page or limit is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }
  const filter = { seller: user._id };
  if (query?.status) {
    if (!['REQUESTED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'].includes(query.status)) {
      throw new AppError('Status is invalid', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    }
    filter.status = query.status;
  }
  const total = await Payout.countDocuments(filter);
  const items = await Payout.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const totalPages = Math.ceil(total / limit) || 0;
  return {
    payouts: items.map((item) => presentPayout(item, null)),
    pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages },
  };
}

async function getPayout(user, payoutId) {
  if (typeof payoutId !== 'string' || !OBJECT_ID.test(payoutId)) {
    throw new AppError('Payout id is invalid', HTTP_STATUS.BAD_REQUEST, 'PAYOUT_NOT_FOUND');
  }
  const payout = await Payout.findById(payoutId);
  if (!payout) throw new AppError('Payout not found', HTTP_STATUS.NOT_FOUND, 'PAYOUT_NOT_FOUND');
  if (String(payout.seller) !== String(user._id)) {
    throw new AppError('You cannot view this payout.', HTTP_STATUS.FORBIDDEN, 'UNAUTHORIZED_PAYOUT_ACCESS');
  }
  const account = payout.payoutAccount ? await PayoutAccount.findById(payout.payoutAccount) : null;
  return presentPayout(payout, account);
}

async function markPayoutFailed(payoutId, reason) {
  const payout = await Payout.findOneAndUpdate(
    { _id: payoutId, status: { $in: ACTIVE_PAYOUT } },
    { $set: { status: 'FAILED', failureReason: String(reason || 'Payout failed').slice(0, 300), processedAt: new Date() } },
    { new: true }
  );
  if (!payout) return null;
  const allocations = await PayoutAllocation.find({ payout: payout._id });
  const earningIds = allocations.map((item) => item.earning);
  await Earning.updateMany(
    { _id: { $in: earningIds }, status: 'PAYOUT_PENDING' },
    { $set: { status: 'AVAILABLE', payout: null, payoutReference: '' } }
  );
  logger.info('payout_failed', { payoutId: String(payout._id) });
  const { notifyPayoutFailed } = require('./notificationService');
  await notifyPayoutFailed(payout);
  return payout;
}

async function markPayoutPaid(payoutId) {
  const payout = await Payout.findOneAndUpdate(
    { _id: payoutId, status: { $in: ACTIVE_PAYOUT } },
    { $set: { status: 'PAID', paidAt: new Date(), processedAt: new Date() } },
    { new: true }
  );
  if (!payout) return null;
  const allocations = await PayoutAllocation.find({ payout: payout._id });
  await Promise.all(allocations.map(async (allocation) => {
    const earning = await Earning.findById(allocation.earning);
    if (!earning || earning.status === 'PAID') return;
    const paid = await PayoutAllocation.aggregate([
      { $match: { earning: earning._id } },
      { $lookup: { from: 'payouts', localField: 'payout', foreignField: '_id', as: 'payout' } },
      { $unwind: '$payout' },
      { $match: { 'payout.status': 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const paidTotal = paid[0]?.total || 0;
    if (paidTotal >= earning.netEarning) {
      earning.status = 'PAID';
      earning.paidAt = new Date();
      earning.payout = payout._id;
      earning.payoutReference = payout.payoutReference;
      await earning.save();
    }
  }));
  logger.info('payout_paid', { payoutId: String(payout._id) });
  const { notifyPayoutPaid } = require('./notificationService');
  await notifyPayoutPaid(payout);
  return payout;
}

module.exports = {
  getAccount,
  saveAccount,
  requestPayout,
  listPayouts,
  getPayout,
  availableBalance,
  markPayoutFailed,
  markPayoutPaid,
  presentAccount,
};
