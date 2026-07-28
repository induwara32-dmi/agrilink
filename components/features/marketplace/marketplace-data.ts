export const categories = [
  { name: 'Vegetables', description: 'Fresh produce for daily trade', image: '🥕' },
  { name: 'Cereals', description: 'Reliable grain supply', image: '🌾' },
  { name: 'Fruits', description: 'Seasonal and premium picks', image: '🍎' },
  { name: 'Livestock', description: 'Protein and animal products', image: '🐄' },
];

export const featuredProducts = [
  {
    id: 1,
    title: 'Organic Tomatoes',
    price: '$3.20/kg',
    farmer: 'Green Valley Farms',
    location: 'Tamale',
    rating: '4.9',
    badge: 'Fresh',
  },
  {
    id: 2,
    title: 'Fresh Maize',
    price: '$1.80/kg',
    farmer: 'North Ridge Co-op',
    location: 'Kumasi',
    rating: '4.8',
    badge: 'Trending',
  },
  {
    id: 3,
    title: 'Cocoa Beans',
    price: '$5.10/kg',
    farmer: 'Riverland Collective',
    location: 'Takoradi',
    rating: '4.7',
    badge: 'Premium',
  },
];

export const products = [
  ...featuredProducts,
  {
    id: 4,
    title: 'Plantain Bunches',
    price: '$1.20/kg',
    farmer: 'Mango Grove',
    location: 'Ho',
    rating: '4.6',
    badge: 'Seasonal',
  },
  {
    id: 5,
    title: 'Groundnut Bags',
    price: '$2.60/kg',
    farmer: 'Sunrise Collective',
    location: 'Bolgatanga',
    rating: '4.5',
    badge: 'Bulk',
  },
  {
    id: 6,
    title: 'Pineapples',
    price: '$2.10/kg',
    farmer: 'Sweet Harvest',
    location: 'Cape Coast',
    rating: '4.8',
    badge: 'New',
  },
];

export const nearbyFarmers = [
  { name: 'Green Valley Farms', location: 'Tamale', rating: '4.9' },
  { name: 'North Ridge Co-op', location: 'Kumasi', rating: '4.8' },
  { name: 'Riverland Collective', location: 'Takoradi', rating: '4.7' },
];

export const trendingProducts = [
  { title: 'Cassava Flour', price: '$2.20/kg', change: '+12%' },
  { title: 'Onions', price: '$1.50/kg', change: '+8%' },
  { title: 'Fresh Eggs', price: '$0.70/unit', change: '+5%' },
];

export const seasonalProducts = [
  { title: 'Pepper Mix', price: '$2.90/kg' },
  { title: 'Yam Tubers', price: '$1.10/kg' },
  { title: 'Pawpaw', price: '$1.80/kg' },
];

export const flashDeals = [
  { title: 'Tomato Bulk Pack', price: '$14.50', note: 'Ends soon' },
  { title: 'Maize 50kg', price: '$42.00', note: 'Limited stock' },
];
