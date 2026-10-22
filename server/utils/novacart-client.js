/**
 * NovaCart Vanilla JavaScript (ES6+) REST Client for Node.js and Browser environments.
 * Provides clean, pure JavaScript interoperability with the MERN stack.
 */

export class NovaCartJsClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async login(email, password) {
    const res = await fetch(`${this.baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    this.token = data.token;
    return data;
  }

  async getProducts() {
    const res = await fetch(`${this.baseUrl}/api/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  }

  async getWishlist() {
    if (!this.token) throw new Error('Authentication required');
    const res = await fetch(`${this.baseUrl}/api/users/wishlist`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  }

  async toggleWishlist(productId) {
    if (!this.token) throw new Error('Authentication required');
    const res = await fetch(`${this.baseUrl}/api/users/wishlist/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ productId }),
    });
    if (!res.ok) throw new Error('Failed to toggle wishlist');
    return res.json();
  }
}
