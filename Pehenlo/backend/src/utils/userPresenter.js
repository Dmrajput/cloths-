function phoneMasked(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const local = digits.slice(-10);
  if (local.length !== 10) return '';
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

function toPublicUser(user) {
  if (!user) return null;

  return {
    id: String(user._id),
    phone: user.phone,
    phoneMasked: phoneMasked(user.phone),
    name: user.name || '',
    email: user.email || '',
    profileImage: user.profileImage || '',
    gender: user.gender || '',
    dateOfBirth: user.dateOfBirth || null,
    city: user.city || '',
    state: user.state || '',
    country: user.country || 'India',
    bio: user.bio || '',
    isPhoneVerified: Boolean(user.isPhoneVerified),
    isProfileCompleted: Boolean(user.isProfileCompleted),
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

module.exports = { toPublicUser };
