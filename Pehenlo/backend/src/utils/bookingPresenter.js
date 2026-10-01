const { utcToDateKey } = require('./dateUtils');

function publicName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Pehenlo Member';
  return trimmed.split(/\s+/)[0];
}

function person(user) {
  if (!user || !user._id) {
    return { id: user ? String(user) : '', name: 'Pehenlo Member', profileImage: '' };
  }
  return {
    id: String(user._id),
    name: publicName(user.name),
    profileImage: user.profileImage || '',
  };
}

function occurred(type, events, fallback) {
  const match = events.find((event) => event.type === type);
  return match?.timestamp || fallback || null;
}

function buildTimeline(booking, events = []) {
  const status = booking.status;
  const steps = [];
  const push = (type, label, done, timestamp) => {
    steps.push({
      type,
      label,
      done: Boolean(done),
      at: done ? (timestamp || null) : null,
    });
  };

  push('BOOKING_CREATED', 'Booking requested', true, occurred('BOOKING_CREATED', events, booking.requestedAt || booking.createdAt));

  if (status === 'REJECTED' || booking.rejectedAt) {
    push('OWNER_REJECTED', 'Owner rejected', true, occurred('OWNER_REJECTED', events, booking.rejectedAt));
    return steps;
  }

  if (status === 'CANCELLED' || booking.cancelledAt) {
    if (booking.acceptedAt) {
      push('OWNER_ACCEPTED', 'Owner accepted', true, occurred('OWNER_ACCEPTED', events, booking.acceptedAt));
    }
    push('BOOKING_CANCELLED', 'Booking cancelled', true, occurred('BOOKING_CANCELLED', events, booking.cancelledAt));
    return steps;
  }

  if (status === 'EXPIRED' || booking.expiredAt) {
    if (booking.acceptedAt) {
      push('OWNER_ACCEPTED', 'Owner accepted', true, occurred('OWNER_ACCEPTED', events, booking.acceptedAt));
    }
    push('BOOKING_EXPIRED', 'Request expired', true, occurred('BOOKING_EXPIRED', events, booking.expiredAt));
    return steps;
  }

  const accepted = Boolean(booking.acceptedAt) || ['PAYMENT_REQUIRED', 'CONFIRMED', 'ACTIVE', 'RETURN_PENDING', 'COMPLETED', 'DISPUTED'].includes(status);
  push('OWNER_ACCEPTED', 'Owner accepted', accepted, occurred('OWNER_ACCEPTED', events, booking.acceptedAt));

  const paid = booking.paymentStatus === 'PAID' || Boolean(booking.paymentCompletedAt);
  push('PAYMENT_COMPLETED', 'Payment completed', paid, occurred('PAYMENT_COMPLETED', events, booking.paymentCompletedAt));

  const confirmed = Boolean(booking.confirmedAt) || ['CONFIRMED', 'ACTIVE', 'RETURN_PENDING', 'COMPLETED', 'DISPUTED'].includes(status);
  push('BOOKING_CONFIRMED', 'Booking confirmed', confirmed, occurred('BOOKING_CONFIRMED', events, booking.confirmedAt));

  if (confirmed || ['ACTIVE', 'RETURN_PENDING', 'COMPLETED'].includes(status)) {
    const active = ['ACTIVE', 'RETURN_PENDING', 'COMPLETED'].includes(status);
    push('RENTAL_STARTED', 'Rental active', active, occurred('RENTAL_STARTED', events, null));
  }
  if (['ACTIVE', 'RETURN_PENDING', 'COMPLETED'].includes(status)) {
    const returning = ['RETURN_PENDING', 'COMPLETED'].includes(status);
    push('RETURN_PENDING', 'Return pending', returning, occurred('RETURN_PENDING', events, null));
  }
  if (['RETURN_PENDING', 'COMPLETED'].includes(status)) {
    push('BOOKING_COMPLETED', 'Completed', status === 'COMPLETED', occurred('BOOKING_COMPLETED', events, null));
  }
  if (status === 'DISPUTED') {
    push('DISPUTED', 'Under dispute', true, occurred('DISPUTED', events, null));
  }
  return steps;
}

function toBooking(booking, viewerId, options = {}) {
  const renterId = String(booking.renter?._id || booking.renter);
  const ownerId = String(booking.owner?._id || booking.owner);
  const viewer = String(viewerId);
  const isRenter = viewer === renterId;
  const listingDoc = booking.listing && booking.listing._id ? booking.listing : null;
  const snap = booking.listingSnapshot || {};
  const categoryName = snap.category || listingDoc?.category?.name || '';

  const payload = {
    id: String(booking._id),
    bookingReference: booking.bookingReference || '',
    role: isRenter ? 'renter' : 'owner',
    viewerRole: isRenter ? 'RENTER' : 'OWNER',
    outfit: {
      id: String(listingDoc?._id || booking.listing),
      title: snap.title || booking.listingTitle || listingDoc?.title || 'Outfit',
      coverImage: snap.coverImage || booking.listingCoverImage || listingDoc?.coverImage || '',
      category: categoryName,
      size: snap.size || listingDoc?.size || '',
      color: snap.color || listingDoc?.color || '',
      city: snap.city || listingDoc?.city || '',
      available: Boolean(listingDoc && listingDoc.status === 'ACTIVE' && listingDoc.isActive),
    },
    startDate: utcToDateKey(booking.startDate),
    endDate: utcToDateKey(booking.endDate),
    rentalDays: booking.rentalDays,
    rentalPeriods: booking.rentalPeriods,
    rentalPricePerPeriod: booking.rentalPricePerPeriod,
    rentalSubtotal: booking.rentalSubtotal,
    cleaningFee: booking.cleaningFee,
    deliveryFee: booking.deliveryFee,
    platformFee: booking.platformFee,
    securityDeposit: booking.securityDeposit,
    totalBeforeDeposit: booking.totalBeforeDeposit,
    totalIncludingDeposit: booking.totalIncludingDeposit,
    totalAmount: booking.totalBeforeDeposit,
    currency: booking.currency || 'INR',
    fulfillmentMethod: booking.fulfillmentMethod,
    pickupArea: booking.pickupArea || '',
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentDueAt: booking.paymentDueAt || null,
    paymentCompletedAt: booking.paymentCompletedAt || null,
    paymentFailureReason: booking.paymentFailureReason || '',
    renterNote: booking.renterNote || '',
    ownerNote: booking.ownerNote || '',
    rejectedReason: booking.rejectedReason || '',
    cancelledReason: booking.cancelledReason || '',
    bookingExpiresAt: booking.bookingExpiresAt,
    requestedAt: booking.requestedAt || booking.createdAt,
    acceptedAt: booking.acceptedAt,
    rejectedAt: booking.rejectedAt,
    paymentRequiredAt: booking.paymentRequiredAt,
    confirmedAt: booking.confirmedAt,
    cancelledAt: booking.cancelledAt,
    expiredAt: booking.expiredAt,
    createdAt: booking.createdAt,
  };

  if (options.detailed) {
    payload.timeline = buildTimeline(booking, options.events || []);
  }

  if (isRenter) {
    payload.owner = person(booking.owner);
    if (options.detailed) payload.razorpayOrderId = booking.razorpayOrderId || '';
    payload.deliveryAddress = booking.fulfillmentMethod === 'DELIVERY' ? (booking.deliveryAddress || null) : null;
    return payload;
  }

  payload.renter = person(booking.renter);
  if (booking.fulfillmentMethod === 'DELIVERY' && booking.deliveryAddress) {
    payload.deliveryArea = {
      area: booking.deliveryAddress.area || '',
      city: booking.deliveryAddress.city || '',
      state: booking.deliveryAddress.state || '',
    };
  }
  return payload;
}

module.exports = { toBooking };
