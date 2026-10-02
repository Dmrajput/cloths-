import { api } from './api';

function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

export const earningsService = {
  getSummary() {
    return api.get('/earnings/summary');
  },

  getEarnings(params) {
    return api.get(`/earnings${query(params)}`);
  },

  getEarning(earningId) {
    return api.get(`/earnings/${earningId}`);
  },

  getPayoutAccount() {
    return api.get('/payout-accounts');
  },

  savePayoutAccount(body) {
    return api.post('/payout-accounts', body);
  },

  updatePayoutAccount(accountId, body) {
    return api.put(`/payout-accounts/${accountId}`, body);
  },

  requestPayout(amount) {
    return api.post('/payouts', { amount });
  },

  getPayouts(params) {
    return api.get(`/payouts${query(params)}`);
  },

  getPayout(payoutId) {
    return api.get(`/payouts/${payoutId}`);
  },
};
