const express = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const listingRoutes = require('./listingRoutes');
const uploadRoutes = require('./uploadRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const earningsRoutes = require('./earningsRoutes');
const payoutRoutes = require('./payoutRoutes');
const payoutAccountRoutes = require('./payoutAccountRoutes');
const reviewRoutes = require('./reviewRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const notificationRoutes = require('./notificationRoutes');
const disputeRoutes = require('./disputeRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/listings', listingRoutes);
router.use('/uploads', uploadRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/earnings', earningsRoutes);
router.use('/payouts', payoutRoutes);
router.use('/payout-accounts', payoutAccountRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/notifications', notificationRoutes);
router.use('/disputes', disputeRoutes);

module.exports = router;
