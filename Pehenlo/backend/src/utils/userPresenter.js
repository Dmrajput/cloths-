function toPublicUser(user) {
  if (!user) return null;

  return {
    id: String(user._id),
    phone: user.phone,
    name: user.name || '',
    email: user.email || '',
    profileImage: user.profileImage || '',
    gender: user.gender || '',
    dateOfBirth: user.dateOfBirth || null,
    city: user.city || '',
    state: user.state || '',
    country: user.country || 'India',
    isPhoneVerified: Boolean(user.isPhoneVerified),
    isProfileCompleted: Boolean(user.isProfileCompleted),
    role: user.role,
  };
}

module.exports = { toPublicUser };
