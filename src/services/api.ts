/**
 * REST API client service for NovaCart MERN store.
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  wishlist?: string[];
  token?: string;
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  reviews?: Review[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
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

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrdersCount: number;
  lowStockProductsCount: number;
  recentOrders: Order[];
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('novacart_token');
  if (token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<User> {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<User>(res);
  },

  async login(email: string, password: string): Promise<User> {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<User>(res);
  },

  async getProfile(): Promise<User> {
    const res = await fetch('/api/users/profile', {
      headers: getAuthHeader(),
    });
    return handleResponse<User>(res);
  },

  // Products
  async getProducts(params?: {
    keyword?: string;
    category?: string;
    sort?: string;
    featured?: boolean;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.category) query.set('category', params.category);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.featured) query.set('featured', 'true');

    const res = await fetch(`/api/products?${query.toString()}`);
    return handleResponse<Product[]>(res);
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    return handleResponse<Product>(res);
  },

  async getCategories(): Promise<string[]> {
    const res = await fetch('/api/products/categories');
    return handleResponse<string[]>(res);
  },

  // Orders
  async createOrder(data: {
    orderItems: Array<{ productId: string; quantity: number }>;
    shippingAddress: ShippingAddress;
    promoCode?: string;
    paymentMethod?: string;
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<Order>(res);
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders/myorders', {
      headers: getAuthHeader(),
    });
    return handleResponse<Order[]>(res);
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<Order>(res);
  },

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeader(),
    });
    return handleResponse<AdminStats>(res);
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders', {
      headers: getAuthHeader(),
    });
    return handleResponse<Order[]>(res);
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Order>(res);
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(productData),
    });
    return handleResponse<Product>(res);
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(productData),
    });
    return handleResponse<Product>(res);
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async toggleWishlist(productId: string): Promise<{ wishlist: string[]; isAdded: boolean; productId: string }> {
    const res = await fetch('/api/users/wishlist/toggle', {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ productId }),
    });
    return handleResponse<{ wishlist: string[]; isAdded: boolean; productId: string }>(res);
  },

  async getWishlist(): Promise<{ wishlist: string[] }> {
    const res = await fetch('/api/users/wishlist', {
      headers: getAuthHeader(),
    });
    return handleResponse<{ wishlist: string[] }>(res);
  },

  async createProductReview(
    productId: string,
    data: { rating: number; title: string; comment: string }
  ): Promise<{ message: string; review: Review; product: Product }> {
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; review: Review; product: Product }>(res);
  },
};
