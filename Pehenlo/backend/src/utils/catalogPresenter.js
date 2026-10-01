function toPublicCategory(category) {
  if (!category) return null;

  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image: category.image || '',
    icon: category.icon || 'shirt-outline',
  };
}

function formatDuration(days) {
  const count = Number(days) || 0;
  if (count <= 1) return '1 day';
  return `${count} days`;
}

function publicMeasurements(measurements) {
  if (!measurements) return null;
  const keys = ['bust', 'chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'length', 'blouseLength', 'skirtLength'];
  const values = { unit: measurements.unit === 'cm' ? 'cm' : 'inches' };
  keys.forEach((key) => {
    const number = Number(measurements[key]);
    if (Number.isFinite(number) && number > 0) values[key] = number;
  });
  const notes = measurements.notes || '';
  if (notes) values.notes = notes;
  const hasValue = keys.some((key) => values[key] != null) || Boolean(notes);
  return hasValue ? values : null;
}

function toPublicListing(listing, options = {}) {
  if (!listing) return null;

  const category = listing.category && listing.category._id
    ? {
      id: String(listing.category._id),
      name: listing.category.name,
      slug: listing.category.slug,
    }
    : null;

  const ownerDoc = listing.owner && listing.owner._id ? listing.owner : null;
  const owner = ownerDoc
    ? {
      id: String(ownerDoc._id),
      name: ownerDoc.name || '',
      profileImage: ownerDoc.profileImage || '',
    }
    : null;

  const payload = {
    id: String(listing._id),
    title: listing.title,
    coverImage: listing.coverImage || listing.images?.[0]?.url || '',
    price: listing.price,
    rentalDuration: formatDuration(listing.rentalDuration),
    rentalDays: listing.rentalDuration,
    rating: listing.rating || 0,
    reviewCount: listing.reviewCount || 0,
    city: listing.city || '',
    state: listing.state || '',
    category,
    owner,
  };

  if (options.detailed) {
    const measurements = publicMeasurements(listing.measurements);
    payload.description = listing.description || '';
    payload.brand = listing.brand || '';
    payload.color = listing.color || '';
    payload.occasion = listing.occasion || [];
    payload.gender = listing.gender || '';
    payload.size = listing.size || '';
    payload.measurements = measurements;
    payload.condition = listing.condition || '';
    payload.conditionNotes = listing.conditionNotes || '';
    payload.hasDamage = Boolean(listing.hasDamage);
    payload.damageDescription = listing.hasDamage ? (listing.damageDescription || '') : '';
    payload.securityDeposit = listing.securityDeposit || 0;
    payload.cleaningFee = listing.cleaningFee || 0;
    payload.deliveryFee = listing.deliveryFee || 0;
    payload.pickupAvailable = Boolean(listing.pickupAvailable);
    payload.deliveryAvailable = Boolean(listing.deliveryAvailable);
    payload.pickupArea = listing.pickupArea || '';
    payload.availabilitySummary = listing.availability?.mode === 'MANUAL'
      ? 'Owner manages availability'
      : 'Generally available';
    payload.viewCount = listing.viewCount || 0;
    payload.createdAt = listing.createdAt || null;
    payload.images = (listing.images || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((image) => ({ url: image.url }));
    if (owner && listing.owner?.createdAt) {
      payload.owner = {
        ...owner,
        memberSince: listing.owner.createdAt,
      };
    }
  }

  return payload;
}

function toOwnerListing(listing) {
  const payload = toPublicListing(listing, { detailed: true }) || {};
  payload.status = listing.status;
  payload.brand = listing.brand || '';
  payload.color = listing.color || '';
  payload.occasion = listing.occasion || [];
  payload.conditionNotes = listing.conditionNotes || '';
  payload.hasDamage = Boolean(listing.hasDamage);
  payload.damageDescription = listing.damageDescription || '';
  payload.cleaningFee = listing.cleaningFee || 0;
  payload.deliveryFee = listing.deliveryFee || 0;
  payload.pickupAvailable = Boolean(listing.pickupAvailable);
  payload.deliveryAvailable = Boolean(listing.deliveryAvailable);
  payload.pickupArea = listing.pickupArea || '';
  payload.measurements = listing.measurements
    ? {
      unit: listing.measurements.unit || 'inches',
      bust: listing.measurements.bust,
      chest: listing.measurements.chest,
      waist: listing.measurements.waist,
      hip: listing.measurements.hip,
      shoulder: listing.measurements.shoulder,
      sleeveLength: listing.measurements.sleeveLength,
      length: listing.measurements.length,
      blouseLength: listing.measurements.blouseLength,
      skirtLength: listing.measurements.skirtLength,
      notes: listing.measurements.notes || '',
    }
    : { unit: 'inches', notes: '' };
  payload.availability = {
    mode: listing.availability?.mode || 'ALWAYS',
    blockedDates: listing.availability?.blockedDates || [],
  };
  payload.images = (listing.images || []).map((image, index) => ({
    id: image._id ? String(image._id) : String(index),
    url: image.url,
    publicId: image.publicId || '',
    order: image.order ?? index,
  }));
  payload.rejectionReason = listing.status === 'REJECTED' ? (listing.rejectionReason || '') : '';
  payload.updatedAt = listing.updatedAt;
  return payload;
}

module.exports = { toPublicCategory, toPublicListing, toOwnerListing, formatDuration };
