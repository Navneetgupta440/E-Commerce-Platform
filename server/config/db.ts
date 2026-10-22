import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

/**
 * MongoDB ObjectId generator matching 24-character hexadecimal format.
 */
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return timestamp + randomBytes;
}

export interface IUserDocument {
  _id: string;
  name: string;
  email: string;
  password: string; // bcrypt hash
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface IProductDocument {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface IOrderDocument {
  _id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Robust in-memory document database that mimics MongoDB / Mongoose collections.
 * Supports exact Mongoose query patterns and persistent in-process state with initial seed data.
 */
class MongoCollection<T extends { _id: string; createdAt: string; updatedAt: string }> {
  private items: Map<string, T> = new Map();

  constructor(initialItems: T[] = []) {
    for (const item of initialItems) {
      this.items.set(item._id, { ...item });
    }
  }

  async find(filter?: Partial<T> | ((item: T) => boolean)): Promise<T[]> {
    const all = Array.from(this.items.values());
    if (!filter) return all;

    if (typeof filter === 'function') {
      return all.filter(filter);
    }

    return all.filter((item) => {
      for (const key of Object.keys(filter) as Array<keyof T>) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findById(id: string): Promise<T | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  async findOne(filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const matches = await this.find(filter);
    return matches.length > 0 ? { ...matches[0] } : null;
  }

  async create(doc: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & Partial<Pick<T, '_id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    const now = new Date().toISOString();
    const _id = doc._id || generateObjectId();
    const created: T = {
      ...(doc as any),
      _id,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now,
    };
    this.items.set(_id, created);
    return { ...created };
  }

  async findByIdAndUpdate(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;

    const updated: T = {
      ...existing,
      ...updates,
      _id: id,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, updated);
    return { ...updated };
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    this.items.delete(id);
    return { ...existing };
  }

  async countDocuments(filter?: Partial<T> | ((item: T) => boolean)): Promise<number> {
    const matches = await this.find(filter);
    return matches.length;
  }

  getAll(): T[] {
    return Array.from(this.items.values());
  }

  clear(): void {
    this.items.clear();
  }
}

// Global Collections
export const Users = new MongoCollection<IUserDocument>();
export const Products = new MongoCollection<IProductDocument>();
export const Orders = new MongoCollection<IOrderDocument>();

let isInitialized = false;

/**
 * Initializes the MongoDB database with sample users, realistic products, and initial orders.
 */
export async function connectDB(): Promise<void> {
  if (isInitialized) return;

  console.log('Connecting to MongoDB database (NovaCart MERN store)...');

  // Seed default admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminId = '651a2b3c4d5e6f7a8b9c0001';
  await Users.create({
    _id: adminId,
    name: 'Admin Manager',
    email: 'admin@novacart.com',
    password: adminPasswordHash,
    role: 'admin',
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T00:00:00Z').toISOString(),
  });

  // Seed default customer user
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const demoUserId = '651a2b3c4d5e6f7a8b9c0002';
  await Users.create({
    _id: demoUserId,
    name: 'John Doe',
    email: 'demo@example.com',
    password: userPasswordHash,
    role: 'user',
    createdAt: new Date('2025-01-05T00:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-05T00:00:00Z').toISOString(),
  });

  // Seed realistic products
  const sampleProducts: Array<Omit<IProductDocument, 'createdAt' | 'updatedAt'>> = [
    {
      _id: '652b11112222333344440001',
      name: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'Industry-leading noise canceling with two processors and 8 microphones for unparalleled noise cancellation and exceptional call quality.',
      price: 349.99,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      category: 'Audio',
      stock: 14,
      rating: 4.8,
      numReviews: 42,
      featured: true,
    },
    {
      _id: '652b11112222333344440002',
      name: 'Apple Watch Series 9 GPS 45mm',
      description: 'Powerful health sensors, advanced workout metrics, bright Always-On Retina display, and double tap gesture control.',
      price: 399.0,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      category: 'Wearables',
      stock: 9,
      rating: 4.9,
      numReviews: 87,
      featured: true,
    },
    {
      _id: '652b11112222333344440003',
      name: 'Keychron Q1 Pro Mechanical Keyboard',
      description: 'Custom wireless mechanical keyboard with full aluminum body, hot-swappable switches, and QMK/VIA programmable keys.',
      price: 199.5,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      category: 'Accessories',
      stock: 22,
      rating: 4.7,
      numReviews: 31,
      featured: true,
    },
    {
      _id: '652b11112222333344440004',
      name: 'Logitech MX Master 3S Wireless Mouse',
      description: 'Ergonomic performance mouse with quiet clicks, 8K DPI any-surface tracking, and ultra-fast MagSpeed electromagnetic scrolling.',
      price: 99.99,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      category: 'Accessories',
      stock: 35,
      rating: 4.9,
      numReviews: 120,
      featured: true,
    },
    {
      _id: '652b11112222333344440005',
      name: 'Samsung 34" Odyssey G8 OLED Gaming Monitor',
      description: 'Immersive curved gaming monitor with 175Hz refresh rate, 0.03ms response time, and vibrant Quantum Dot OLED panel.',
      price: 899.99,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      category: 'Electronics',
      stock: 6,
      rating: 4.6,
      numReviews: 18,
      featured: false,
    },
    {
      _id: '652b11112222333344440006',
      name: 'Bose SoundLink Revolve+ II Bluetooth Speaker',
      description: 'True 360-degree sound for consistent, uniform coverage. Seamless aluminum body, water and dust resistant with up to 17 hours battery.',
      price: 229.0,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      category: 'Audio',
      stock: 18,
      rating: 4.8,
      numReviews: 54,
      featured: false,
    },
    {
      _id: '652b11112222333344440007',
      name: 'Sony PlayStation 5 DualSense Wireless Controller',
      description: 'Haptic feedback, dynamic adaptive triggers, built-in microphone, and ergonomic design for high-level gaming immersion.',
      price: 69.99,
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      category: 'Gaming',
      stock: 40,
      rating: 4.9,
      numReviews: 95,
      featured: true,
    },
    {
      _id: '652b11112222333344440008',
      name: 'Anker Prime 20,000mAh Power Bank (200W)',
      description: 'Ultra-fast multi-device charging power bank with smart digital display and dual high-power USB-C ports.',
      price: 119.99,
      imageUrl: 'https://images.unsplash.com/photo-1609592424368-e6081e9f1681?auto=format&fit=crop&w=800&q=80',
      category: 'Accessories',
      stock: 28,
      rating: 4.7,
      numReviews: 63,
      featured: false,
    },
    {
      _id: '652b11112222333344440009',
      name: 'Fujifilm X-T5 Mirrorless Digital Camera',
      description: '40.2MP X-Trans CMOS 5 HR sensor, 5-axis in-body image stabilization, and classic dial-based analog operation.',
      price: 1699.0,
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      category: 'Electronics',
      stock: 4,
      rating: 5.0,
      numReviews: 24,
      featured: true,
    },
    {
      _id: '652b11112222333344440010',
      name: 'SteelSeries Arctis Nova Pro Wireless Headset',
      description: 'Almighty Audio system with active noise cancellation, infinity power dual-battery system, and simultaneous multi-system connect.',
      price: 329.99,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      category: 'Gaming',
      stock: 12,
      rating: 4.7,
      numReviews: 39,
      featured: false,
    },
  ];

  for (const product of sampleProducts) {
    await Products.create(product);
  }

  // Seed initial sample orders for demo user
  const order1Id = '653c00010002000300040001';
  await Orders.create({
    _id: order1Id,
    userId: demoUserId,
    userName: 'John Doe',
    userEmail: 'demo@example.com',
    orderItems: [
      {
        productId: '652b11112222333344440001',
        name: 'Sony WH-1000XM5 Wireless Headphones',
        quantity: 1,
        price: 349.99,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      postalCode: '97477',
      country: 'United States',
      phone: '+1 555-0199',
    },
    subtotal: 349.99,
    discount: 0,
    tax: 28.0,
    shippingFee: 0,
    totalAmount: 377.99,
    orderStatus: 'Delivered',
    paymentMethod: 'Credit Card',
    isPaid: true,
    paidAt: new Date('2025-01-10T14:20:00Z').toISOString(),
    createdAt: new Date('2025-01-10T14:15:00Z').toISOString(),
    updatedAt: new Date('2025-01-13T10:00:00Z').toISOString(),
  });

  const order2Id = '653c00010002000300040002';
  await Orders.create({
    _id: order2Id,
    userId: demoUserId,
    userName: 'John Doe',
    userEmail: 'demo@example.com',
    orderItems: [
      {
        productId: '652b11112222333344440004',
        name: 'Logitech MX Master 3S Wireless Mouse',
        quantity: 1,
        price: 99.99,
        imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      postalCode: '97477',
      country: 'United States',
      phone: '+1 555-0199',
    },
    subtotal: 99.99,
    discount: 10.0,
    tax: 7.2,
    shippingFee: 0,
    totalAmount: 97.19,
    orderStatus: 'Shipped',
    paymentMethod: 'Credit Card',
    isPaid: true,
    paidAt: new Date('2025-02-01T09:12:00Z').toISOString(),
    createdAt: new Date('2025-02-01T09:10:00Z').toISOString(),
    updatedAt: new Date('2025-02-02T16:45:00Z').toISOString(),
  });

  isInitialized = true;
  console.log('MongoDB successfully connected and seeded with sample data.');
}
