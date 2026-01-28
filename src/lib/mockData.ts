interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  brand?: string;
  stock: number;
  rating: number;
  numReviews: number;
  colors?: string[];
  sizes?: string[];
  createdAt: string;
  updatedAt: string;
}

export const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Premium Cotton T-Shirt',
    description: 'High-quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
    price: 29.99,
    discountPrice: 24.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop'],
    category: 'Clothing',
    stock: 50,
    rating: 4.5,
    numReviews: 12,
    colors: ['White', 'Black', 'Navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Slim Fit Denim Jeans',
    description: 'Classic denim jeans with a modern slim fit. Durable and stylish.',
    price: 59.99,
    images: ['https://images.unsplash.com/photo-1542272617-08f086302542?q=80&w=1779&auto=format&fit=crop'],
    category: 'Clothing',
    stock: 30,
    rating: 4.8,
    numReviews: 8,
    colors: ['Blue', 'Black'],
    sizes: ['30', '32', '34', '36'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Immerse yourself in music with these premium noise-canceling headphones.',
    price: 199.99,
    discountPrice: 179.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop'],
    category: 'Electronics',
    stock: 15,
    rating: 4.9,
    numReviews: 25,
    colors: ['Black', 'Silver'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Minimalist Wrist Watch',
    description: 'Elegant and minimalist wrist watch for any occasion.',
    price: 129.99,
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1999&auto=format&fit=crop'],
    category: 'Accessories',
    stock: 20,
    rating: 4.6,
    numReviews: 5,
    colors: ['Gold', 'Silver', 'Black'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Running Shoes',
    description: 'Lightweight and comfortable running shoes for your daily jog.',
    price: 89.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop'],
    category: 'Footwear',
    stock: 40,
    rating: 4.7,
    numReviews: 18,
    colors: ['Red', 'Blue', 'Green'],
    sizes: ['8', '9', '10', '11'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'Leather Crossbody Bag',
    description: 'Stylish leather crossbody bag with multiple compartments.',
    price: 79.99,
    discountPrice: 69.99,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1769&auto=format&fit=crop'],
    category: 'Accessories',
    stock: 25,
    rating: 4.4,
    numReviews: 10,
    colors: ['Brown', 'Black'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCategories = [
  { id: 'clothing', name: 'Clothing', image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=2011&auto=format&fit=crop' },
  { id: 'electronics', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?q=80&w=2070&auto=format&fit=crop' },
  { id: 'footwear', name: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop' },
  { id: 'accessories', name: 'Accessories', image: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=1887&auto=format&fit=crop' },
];
