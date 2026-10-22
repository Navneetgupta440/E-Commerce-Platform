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
  wishlist?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
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
  reviews?: IReview[];
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
    wishlist: [],
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
    wishlist: ['652b11112222333344440001'],
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
      numReviews: 4,
      featured: true,
      reviews: [
        {
          _id: 'rev_001_1',
          userId: 'usr_seed_1',
          userName: 'Marcus Chen',
          rating: 5,
          title: 'Unbelievable noise cancellation on trans-Atlantic flights',
          comment: 'I travel frequently for work and these headphones are an absolute lifesaver. The battery lasts through full 14-hour flights with ANC continuously engaged. Voice clarity during conference calls is crisp.',
          verifiedPurchase: true,
          createdAt: new Date('2025-01-14T09:30:00Z').toISOString(),
        },
        {
          _id: 'rev_001_2',
          userId: 'usr_seed_2',
          userName: 'Elena Rostova',
          rating: 5,
          title: 'Remarkable soundstage and lightweight comfort',
          comment: 'Far lighter and softer headband padding than the XM4. The sound balance right out of the box is refined, and the custom EQ in the companion app gives deep punchy bass.',
          verifiedPurchase: true,
          createdAt: new Date('2025-01-20T14:15:00Z').toISOString(),
        },
        {
          _id: 'rev_001_3',
          userId: 'usr_seed_3',
          userName: 'Liam Gallagher',
          rating: 4,
          title: 'Great headphones, wish it folded smaller',
          comment: 'Audio performance and ambient awareness modes are class-leading. My only minor gripe is the case is slightly larger than previous generations because the cups don’t fold inward.',
          verifiedPurchase: true,
          createdAt: new Date('2025-01-28T18:45:00Z').toISOString(),
        },
        {
          _id: 'rev_001_4',
          userId: 'usr_seed_4',
          userName: 'Sophia Martinez',
          rating: 5,
          title: 'Crystal clear calls and rapid multi-point switching',
          comment: 'Connects to my MacBook Pro and iPhone simultaneously with zero latency or stutter. The auto-pause when you speak is very convenient in office environments.',
          verifiedPurchase: true,
          createdAt: new Date('2025-02-04T11:20:00Z').toISOString(),
        },
      ],
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
      numReviews: 3,
      featured: true,
      reviews: [
        {
          _id: 'rev_002_1',
          userId: 'usr_seed_5',
          userName: 'David Miller',
          rating: 5,
          title: 'Double tap gesture is magical for daily tasks',
          comment: 'The double tap feature is surprisingly useful when cooking or holding groceries. Screen brightness under direct California sunlight is outstanding at 2000 nits.',
          verifiedPurchase: true,
          createdAt: new Date('2025-01-18T10:12:00Z').toISOString(),
        },
        {
          _id: 'rev_002_2',
          userId: 'usr_seed_6',
          userName: 'Sarah Jenkins',
          rating: 5,
          title: 'Unmatched health tracking and ECG precision',
          comment: 'Tracks heart rate zones accurately during intense marathon training sessions. Battery easily lasts 24 to 30 hours with moderate workouts.',
          verifiedPurchase: true,
          createdAt: new Date('2025-01-25T16:40:00Z').toISOString(),
        },
        {
          _id: 'rev_002_3',
          userId: 'usr_seed_7',
          userName: 'Kenji Sato',
          rating: 4,
          title: 'Smooth performance and premium haptics',
          comment: 'S9 chip makes Siri processing instant without requiring internet. Solid upgrade from my Series 5.',
          verifiedPurchase: true,
          createdAt: new Date('2025-02-01T08:25:00Z').toISOString(),
        },
      ],
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
    {
      _id: '652b11112222333344440011',
      name: 'Java 21 & Spring Boot Enterprise MERN Toolkit',
      description: 'Production-ready suite for integrating Java Spring Boot 3 microservices with React.js frontends and Node.js/MongoDB REST backends. Includes Virtual Threads & JWT bridge.',
      price: 149.0,
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      category: 'Java & MERN Dev',
      stock: 50,
      rating: 4.9,
      numReviews: 88,
      featured: true,
    },
    {
      _id: '652b11112222333344440012',
      name: 'NovaCart Official Java Client SDK & Spring Starter',
      description: 'Type-safe Java 17/21 SDK for NovaCart MERN store. Features built-in HttpClient, Jackson serialization, auto-configured Spring beans, and JWT interceptors.',
      price: 49.0,
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      category: 'Java & MERN Dev',
      stock: 75,
      rating: 4.95,
      numReviews: 64,
      featured: true,
    },
    {
      _id: '652b11112222333344440013',
      name: 'JVM Concurrency & Performance Tuning Guide',
      description: 'Masterclass on Project Loom Virtual Threads, ZGC garbage collection tuning, reactive streams, and high-throughput Node.js to Java REST interoperability.',
      price: 79.5,
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      category: 'Java & MERN Dev',
      stock: 30,
      rating: 4.85,
      numReviews: 41,
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
