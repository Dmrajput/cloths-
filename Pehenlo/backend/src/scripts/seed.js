require('dotenv').config();

const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Category = require('../models/Category');
const Listing = require('../models/Listing');

const DEMO_OWNER_PHONE = '+919100000099';
const PICKUP_AREAS = {
  Ahmedabad: 'Satellite',
  Gandhinagar: 'Sector 21',
  Vadodara: 'Alkapuri',
  Surat: 'Adajan',
  Rajkot: 'Kalawad Road',
  Jaipur: 'C-Scheme',
  Mumbai: 'Bandra',
  Lucknow: 'Hazratganj',
  Chennai: 'T Nagar',
};

const CATEGORIES = [
  { name: 'Lehenga', slug: 'lehenga', icon: 'woman-outline', description: 'Bridal and festive lehengas', sortOrder: 1 },
  { name: 'Saree', slug: 'saree', icon: 'color-palette-outline', description: 'Silk, banarasi and contemporary sarees', sortOrder: 2 },
  { name: 'Chaniya Choli', slug: 'chaniya-choli', icon: 'musical-notes-outline', description: 'Navratri and garba wear', sortOrder: 3 },
  { name: 'Anarkali', slug: 'anarkali', icon: 'flower-outline', description: 'Floor-length festive suits', sortOrder: 4 },
  { name: 'Sharara', slug: 'sharara', icon: 'sparkles-outline', description: 'Sharara sets for celebrations', sortOrder: 5 },
  { name: 'Gharara', slug: 'gharara', icon: 'layers-outline', description: 'Classic gharara ensembles', sortOrder: 6 },
  { name: 'Sherwani', slug: 'sherwani', icon: 'man-outline', description: 'Wedding and reception sherwanis', sortOrder: 7 },
  { name: 'Kurta', slug: 'kurta', icon: 'shirt-outline', description: 'Kurtas for festive occasions', sortOrder: 8 },
  { name: 'Kediyu', slug: 'kediyu', icon: 'body-outline', description: 'Traditional Gujarati kediyu', sortOrder: 9 },
  { name: 'Nehru Jacket', slug: 'nehru-jacket', icon: 'glasses-outline', description: 'Nehru jackets and bandhgalas', sortOrder: 10 },
  { name: 'Indo-Western', slug: 'indo-western', icon: 'star-outline', description: 'Fusion occasion wear', sortOrder: 11 },
  { name: 'Dupatta', slug: 'dupatta', icon: 'ribbon-outline', description: 'Dupattas and stoles', sortOrder: 12 },
  { name: 'Pagdi', slug: 'pagdi', icon: 'ellipse-outline', description: 'Pagdis and safaas', sortOrder: 13 },
  { name: 'Jewellery', slug: 'jewellery', icon: 'diamond-outline', description: 'Traditional jewellery sets', sortOrder: 14 },
  { name: 'Traditional Accessories', slug: 'traditional-accessories', icon: 'sparkles-outline', description: 'Accessories for ethnic looks', sortOrder: 15 },
];

const PHOTOS = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=60',
];

const LISTINGS = [
  ['lehenga', 'Royal Red Designer Lehenga', 'female', 1499, 2, 3000, 'Ahmedabad', 'Gujarat', 'M', 'excellent', 4.8, 18, 240, 64, true],
  ['lehenga', 'Ivory Mirror-Work Lehenga', 'female', 1899, 3, 4000, 'Ahmedabad', 'Gujarat', 'L', 'excellent', 4.9, 22, 180, 41, true],
  ['saree', 'Banarasi Silk Saree', 'female', 999, 3, 2500, 'Ahmedabad', 'Gujarat', 'Free Size', 'excellent', 4.7, 31, 310, 52, true],
  ['saree', 'Pastel Organza Saree', 'female', 799, 2, 1500, 'Surat', 'Gujarat', 'Free Size', 'good', 4.4, 9, 90, 12, false],
  ['chaniya-choli', 'Bandhani Chaniya Choli', 'female', 1299, 2, 2000, 'Ahmedabad', 'Gujarat', 'M', 'excellent', 4.6, 15, 200, 48, true],
  ['chaniya-choli', 'Mirror Navratri Chaniya', 'female', 1099, 2, 1800, 'Ahmedabad', 'Gujarat', 'S', 'good', 4.5, 11, 150, 27, false],
  ['anarkali', 'Emerald Anarkali Gown', 'female', 1199, 2, 2200, 'Jaipur', 'Rajasthan', 'M', 'excellent', 4.6, 8, 70, 10, false],
  ['sharara', 'Blush Sharara Set', 'female', 1399, 2, 2500, 'Mumbai', 'Maharashtra', 'M', 'excellent', 4.3, 6, 55, 9, false],
  ['gharara', 'Maroon Gharara Ensemble', 'female', 1599, 3, 3000, 'Ahmedabad', 'Gujarat', 'L', 'good', 4.2, 5, 40, 7, false],
  ['sherwani', 'Ivory Wedding Sherwani', 'male', 1999, 2, 4500, 'Ahmedabad', 'Gujarat', 'L', 'excellent', 4.9, 14, 160, 36, true],
  ['sherwani', 'Navy Embroidered Sherwani', 'male', 1799, 2, 4000, 'Jaipur', 'Rajasthan', 'M', 'excellent', 4.7, 10, 95, 18, false],
  ['kurta', 'Mustard Silk Kurta Set', 'male', 699, 2, 1200, 'Ahmedabad', 'Gujarat', 'M', 'good', 4.4, 19, 210, 22, false],
  ['kurta', 'White Chikankari Kurta', 'male', 599, 2, 1000, 'Lucknow', 'Uttar Pradesh', 'L', 'excellent', 4.8, 16, 130, 15, false],
  ['kediyu', 'Traditional Kediyu and Dhoti', 'male', 899, 2, 1500, 'Ahmedabad', 'Gujarat', 'L', 'excellent', 4.5, 7, 88, 20, true],
  ['nehru-jacket', 'Black Nehru Jacket Set', 'male', 799, 2, 1400, 'Mumbai', 'Maharashtra', 'M', 'good', 4.1, 4, 33, 6, false],
  ['indo-western', 'Sequin Indo-Western Gown', 'female', 1699, 2, 3200, 'Ahmedabad', 'Gujarat', 'S', 'excellent', 4.6, 13, 175, 29, true],
  ['indo-western', 'Textured Indo-Western Jacket', 'male', 999, 2, 1800, 'Surat', 'Gujarat', 'L', 'good', 4.0, 3, 28, 4, false],
  ['dupatta', 'Heavy Embroidered Dupatta', 'unisex', 399, 3, 800, 'Ahmedabad', 'Gujarat', 'Free Size', 'excellent', 4.3, 8, 60, 11, false],
  ['pagdi', 'Maroon Safa and Brooch', 'male', 349, 2, 700, 'Jaipur', 'Rajasthan', 'Free Size', 'good', 4.2, 2, 18, 3, false],
  ['jewellery', 'Kundan Necklace Set', 'female', 499, 2, 2000, 'Ahmedabad', 'Gujarat', 'Free Size', 'excellent', 4.9, 27, 260, 58, true],
  ['traditional-accessories', 'Kalgi and Mala Set', 'male', 299, 2, 600, 'Ahmedabad', 'Gujarat', 'Free Size', 'good', 4.1, 4, 22, 5, false],
  ['saree', 'Kanjeevaram Temple Saree', 'female', 1299, 3, 2800, 'Chennai', 'Tamil Nadu', 'Free Size', 'excellent', 4.8, 12, 140, 19, false],
  ['lehenga', 'XS Blush Reception Lehenga', 'female', 2200, 2, 3500, 'Gandhinagar', 'Gujarat', 'XS', 'excellent', 4.6, 9, 77, 14, false],
  ['lehenga', 'XL Maroon Bridal Lehenga', 'female', 3200, 3, 5000, 'Vadodara', 'Gujarat', 'XL', 'good', 4.2, 6, 54, 8, false],
  ['saree', 'XXL Festive Silk Saree', 'female', 1100, 2, 2000, 'Rajkot', 'Gujarat', 'XXL', 'fair', 3.4, 3, 21, 2, false],
  ['chaniya-choli', 'Garba Night Chaniya Choli', 'female', 999, 1, 1500, 'Surat', 'Gujarat', 'M', 'excellent', 4.8, 20, 400, 70, true],
  ['anarkali', 'Haldi Yellow Anarkali', 'female', 899, 2, 1600, 'Ahmedabad', 'Gujarat', 'S', 'good', 4.1, 7, 66, 9, false],
  ['sharara', 'Mehendi Green Sharara', 'female', 1499, 2, 2400, 'Gandhinagar', 'Gujarat', 'L', 'excellent', 4.7, 11, 98, 16, false],
  ['gharara', 'Custom Gold Gharara', 'female', 2100, 3, 3600, 'Vadodara', 'Gujarat', 'Custom', 'excellent', 4.5, 4, 30, 6, false],
  ['sherwani', 'Pastel Engagement Sherwani', 'male', 2499, 2, 4200, 'Surat', 'Gujarat', 'XL', 'excellent', 4.8, 13, 150, 21, false],
  ['sherwani', 'Budget Festive Sherwani', 'male', 899, 2, 1800, 'Rajkot', 'Gujarat', 'M', 'fair', 3.1, 2, 19, 1, false],
  ['kurta', 'XS Cotton Kurta', 'male', 449, 2, 800, 'Gandhinagar', 'Gujarat', 'XS', 'good', 3.8, 5, 44, 4, false],
  ['kurta', 'XXXL Wedding Kurta', 'male', 799, 2, 1200, 'Ahmedabad', 'Gujarat', 'XXXL', 'good', 4.0, 6, 51, 5, false],
  ['kediyu', 'Navratri Kediyu', 'male', 1099, 2, 1600, 'Vadodara', 'Gujarat', 'L', 'excellent', 4.6, 8, 120, 18, false],
  ['nehru-jacket', 'Wine Nehru Jacket', 'male', 649, 2, 1000, 'Rajkot', 'Gujarat', 'M', 'excellent', 4.3, 4, 36, 3, false],
  ['indo-western', 'Reception Indo-Western Set', 'female', 1899, 2, 3000, 'Surat', 'Gujarat', 'M', 'good', 4.4, 9, 80, 12, false],
  ['dupatta', 'Bandhani Dupatta', 'unisex', 249, 3, 500, 'Ahmedabad', 'Gujarat', 'Free Size', 'fair', 3.6, 2, 15, 1, false],
  ['pagdi', 'Wedding Pagdi', 'male', 399, 2, 700, 'Gandhinagar', 'Gujarat', 'Free Size', 'excellent', 4.5, 3, 27, 4, false],
  ['jewellery', 'Temple Jewellery Set', 'female', 699, 2, 1800, 'Vadodara', 'Gujarat', 'Free Size', 'good', 4.2, 8, 90, 10, false],
  ['traditional-accessories', 'Kids Festive Accessory Set', 'kids', 199, 2, 400, 'Ahmedabad', 'Gujarat', 'S', 'excellent', 4.7, 5, 40, 6, false],
  ['lehenga', 'Kids Celebration Lehenga', 'kids', 599, 2, 800, 'Surat', 'Gujarat', 'XS', 'good', 4.1, 3, 22, 2, false],
  ['kurta', 'Kids Kurta Set', 'kids', 349, 2, 500, 'Rajkot', 'Gujarat', 'S', 'good', 3.9, 2, 18, 1, false],
  ['saree', 'High View Count Saree', 'female', 1599, 3, 2600, 'Ahmedabad', 'Gujarat', 'Free Size', 'excellent', 3.2, 1, 900, 4, false],
];

function photoFor(index) {
  return PHOTOS[index % PHOTOS.length];
}

async function seed() {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to seed');
  }

  await mongoose.connect(env.MONGODB_URI);

  const owner = await User.findOneAndUpdate(
    { phone: DEMO_OWNER_PHONE },
    {
      phone: DEMO_OWNER_PHONE,
      name: 'Pehenlo Atelier',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      isPhoneVerified: true,
      isProfileCompleted: true,
      isActive: true,
      role: 'user',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const categoryIds = {};
  for (const category of CATEGORIES) {
    const saved = await Category.findOneAndUpdate(
      { slug: category.slug },
      { ...category, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categoryIds[category.slug] = saved._id;
  }

  const now = Date.now();
  for (let index = 0; index < LISTINGS.length; index += 1) {
    const [
      slug, title, gender, price, rentalDuration, securityDeposit,
      city, state, size, condition, rating, reviewCount, viewCount, favoriteCount, isFeatured,
    ] = LISTINGS[index];
    const haystack = title.toLowerCase();
    const occasionNotes = [];
    if (haystack.includes('festive') || haystack.includes('garba') || haystack.includes('navratri')) {
      occasionNotes.push('festival');
    }
    if (haystack.includes('traditional')) {
      occasionNotes.push('traditional day');
    }
    const description = `${title} available to rent for occasions in ${city}.${
      occasionNotes.length ? ` ${occasionNotes.join(' ')}.` : ''
    }`;
    const coverImage = photoFor(index);
    const seedKey = `home-${slug}-${index + 1}`;

    await Listing.findOneAndUpdate(
      { seedKey },
      {
        seedKey,
        owner: owner._id,
        title,
        description,
        category: categoryIds[slug],
        gender,
        images: [{ url: coverImage, publicId: '' }],
        coverImage,
        price,
        rentalDuration,
        securityDeposit,
        city,
        state,
        pickupAvailable: true,
        pickupArea: PICKUP_AREAS[city] || 'City centre',
        deliveryAvailable: index % 3 !== 0,
        deliveryFee: index % 3 !== 0 ? 150 : 0,
        cleaningFee: index % 2 === 0 ? 100 : 0,
        size,
        condition,
        rating,
        reviewCount,
        viewCount,
        favoriteCount,
        status: 'ACTIVE',
        isActive: true,
        isFeatured,
        sortOrder: index + 1,
        createdAt: new Date(now - index * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, timestamps: false }
    );
  }

  const categoryCount = await Category.countDocuments({ isActive: true });
  const listingCount = await Listing.countDocuments({ status: 'ACTIVE', isActive: true });
  console.log(`Seeded ${categoryCount} categories and ${listingCount} active listings.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
