import React, { useState } from 'react';
import {
  X,
  Database,
  Server,
  Layout,
  Cpu,
  Key,
  ShieldCheck,
  Terminal,
  BookOpen,
  CheckCircle2,
  Coffee,
  Code2,
  Heart,
} from 'lucide-react';
import { Logo } from './Logo';

interface MernArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MernArchitectureModal: React.FC<MernArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'api' | 'security' | 'setup' | 'java-mern'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Logo size="md" variant="light" withSubtitle={false} />
            <div className="border-l border-slate-700 pl-3">
              <h2 className="text-sm font-bold text-white">MERN Stack Architecture &amp; Guide</h2>
              <p className="text-[11px] text-slate-400">
                Beginner-friendly breakdown of MongoDB, Express, React, Node.js &amp; JWT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            MERN Architecture
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            REST API Endpoints
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            JWT Auth &amp; Security
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'setup'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Local Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('java-mern')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'java-mern'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>Java &amp; MERN Interop</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <span>M - MongoDB</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Document-oriented database. Stores Users, Products, and Orders as BSON/JSON documents with 24-character ObjectIds and timestamping.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                    <Server className="w-5 h-5 text-amber-400" />
                    <span>E - Express.js</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Lightweight web framework for Node.js. Handles routing, controllers, input validation, JWT auth middleware, and error handling.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                    <Layout className="w-5 h-5 text-cyan-400" />
                    <span>R - React.js</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Client SPA with modular component hierarchy, custom hooks, Auth &amp; Cart context, responsive styling, and real-time state.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30">
                  <div className="flex items-center gap-2 text-teal-400 font-bold mb-1">
                    <Cpu className="w-5 h-5 text-teal-400" />
                    <span>N - Node.js</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Asynchronous V8 runtime executing the backend server, orchestrating bcrypt cryptography, token signing, and database queries.
                  </p>
                </div>
              </div>

              {/* Data Flow Diagram */}
              <div className="bg-slate-950 rounded-2xl p-5 text-white font-mono text-xs border border-slate-800">
                <div className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                  <span>Data Flow in NovaCart:</span>
                </div>
                <div className="space-y-2 leading-relaxed text-slate-300">
                  <div>1. <span className="text-cyan-400">User triggers action</span> (e.g. Place Order, Browse Products, Admin Updates Status).</div>
                  <div>2. <span className="text-emerald-400">React Frontend</span> calls REST API via <span className="text-amber-300">fetch('/api/...')</span> attaching <span className="text-teal-300">Authorization: Bearer &lt;jwt&gt;</span>.</div>
                  <div>3. <span className="text-amber-400">Express Middleware</span> verifies JWT token and extracts user permissions (Role: 'user' | 'admin').</div>
                  <div>4. <span className="text-blue-400">Express Controller</span> validates payload &amp; recalculates order prices on the server.</div>
                  <div>5. <span className="text-emerald-400">MongoDB Database</span> stores/queries document collections (Users, Products, Orders).</div>
                  <div>6. <span className="text-slate-300">Response</span> sent back as JSON to update React state smoothly.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">Full REST API Endpoints Specification</h3>
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Method</th>
                      <th className="p-3">Endpoint</th>
                      <th className="p-3">Access</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">POST</td>
                      <td className="p-3 text-white">/api/users/register</td>
                      <td className="p-3 font-sans text-slate-400">Public</td>
                      <td className="p-3 font-sans text-slate-300">Register user, hash password, return JWT</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">POST</td>
                      <td className="p-3 text-white">/api/users/login</td>
                      <td className="p-3 font-sans text-slate-400">Public</td>
                      <td className="p-3 font-sans text-slate-300">Authenticate user credentials &amp; issue JWT</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-400 font-bold">GET</td>
                      <td className="p-3 text-white">/api/products</td>
                      <td className="p-3 font-sans text-slate-400">Public</td>
                      <td className="p-3 font-sans text-slate-300">Fetch products with search, category &amp; sort</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-400 font-bold">GET</td>
                      <td className="p-3 text-white">/api/products/:id</td>
                      <td className="p-3 font-sans text-slate-400">Public</td>
                      <td className="p-3 font-sans text-slate-300">Get complete product details</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">POST</td>
                      <td className="p-3 text-white">/api/orders</td>
                      <td className="p-3 font-sans text-emerald-400 font-bold">User (JWT)</td>
                      <td className="p-3 font-sans text-slate-300">Place order; recalculates prices &amp; decrements stock</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-400 font-bold">GET</td>
                      <td className="p-3 text-white">/api/orders/myorders</td>
                      <td className="p-3 font-sans text-emerald-400 font-bold">User (JWT)</td>
                      <td className="p-3 font-sans text-slate-300">Get previous order history for logged-in user</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-amber-400 font-bold">GET</td>
                      <td className="p-3 text-white">/api/admin/stats</td>
                      <td className="p-3 font-sans text-amber-300 font-bold">Admin Only</td>
                      <td className="p-3 font-sans text-slate-300">Get revenue, order count, inventory stats</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">POST</td>
                      <td className="p-3 text-white">/api/products</td>
                      <td className="p-3 font-sans text-amber-300 font-bold">Admin Only</td>
                      <td className="p-3 font-sans text-slate-300">Add new product to catalog</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-purple-400 font-bold">PUT</td>
                      <td className="p-3 text-white">/api/orders/:id/status</td>
                      <td className="p-3 font-sans text-amber-300 font-bold">Admin Only</td>
                      <td className="p-3 font-sans text-slate-300">Update status (Pending, Shipped, Delivered)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300">Security Best Practices Implemented</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Passwords are never stored in plaintext—they are hashed using <strong>bcrypt</strong> with salt rounds. All protected endpoints verify a <strong>JSON Web Token (JWT)</strong> transmitted via the Authorization header. Prices and order totals are calculated strictly on the Express backend, preventing client-side price tampering.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-800 rounded-2xl bg-slate-950">
                  <div className="flex items-center gap-2 font-bold text-white mb-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300">protect</code> middleware extracts and decodes the JWT token. The <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">admin</code> middleware verifies <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">req.user.role === 'admin'</code> before allowing access to product creation, order status changes, or store metrics.
                  </p>
                </div>

                <div className="p-4 border border-slate-800 rounded-2xl bg-slate-950">
                  <div className="flex items-center gap-2 font-bold text-white mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Server-Side Order Integrity</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clients only pass item IDs and requested quantities. The Express controller retrieves authentic prices directly from the database, validates available stock, calculates taxes and discounts, and decrements stock atomically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Running This Project Locally (Beginner Instructions)</span>
              </h3>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs space-y-3 border border-slate-800">
                <div className="text-slate-500"># 1. Clone the repository and install dependencies</div>
                <div className="text-emerald-400">git clone https://github.com/your-username/aurastore-mern.git</div>
                <div className="text-emerald-400">npm install</div>

                <div className="text-slate-500 pt-2"># 2. Configure environment variables in .env</div>
                <div className="text-cyan-300">PORT=3000</div>
                <div className="text-cyan-300">JWT_SECRET=your_super_secret_jwt_key</div>

                <div className="text-slate-500 pt-2"># 3. Start development server (Node + Express + React Vite)</div>
                <div className="text-emerald-400">npm run dev</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-xs text-white mb-2">Pre-configured Demo Accounts:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-200">Customer:</span> demo@example.com / <span className="font-mono text-emerald-400">user123</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="font-bold text-amber-300">Administrator:</span> admin@novacart.com / <span className="font-mono text-amber-300">admin123</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'java-mern' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                  <Coffee className="w-5 h-5 text-amber-400" />
                  <span className="text-sm">Java &amp; MERN Stack Full Compatibility</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  NovaCart combines the agility of the <strong>MERN stack</strong> (MongoDB, Express.js, React.js, Node.js) with first-class <strong>Java 17/21 &amp; Spring Boot</strong> interoperability. Enterprise Java microservices consume the Node.js Express REST endpoints and MongoDB documents via type-safe Java records and HTTP/2 clients.
                </p>
              </div>

              {/* Architecture flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block">FRONTEND</span>
                  <p className="font-bold text-white text-xs mt-1">React.js (ES6+)</p>
                  <p className="text-[11px] text-slate-400 mt-1">Single Page App with Hooks, Tailwind CSS &amp; Wishlist Context</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">BACKEND REST API</span>
                  <p className="font-bold text-white text-xs mt-1">Node.js + Express.js</p>
                  <p className="text-[11px] text-slate-400 mt-1">JWT Auth, MongoDB Document Collections, Wishlist &amp; Order Pipeline</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 bg-amber-950/20">
                  <span className="text-[10px] font-mono text-amber-400 font-bold block">JAVA ECOSYSTEM</span>
                  <p className="font-bold text-white text-xs mt-1">Java 21 / Spring Boot 3</p>
                  <p className="text-[11px] text-slate-400 mt-1">NovaCartClient.java SDK with HttpClient, Virtual Threads &amp; Bridge Controller</p>
                </div>
              </div>

              {/* Java Client Code Sample */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <span>Java 21 Client SDK (server/java/NovaCartClient.java)</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30 font-mono">
                    Java 17+ HTTP Client
                  </span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1">
                  <span className="text-slate-500">// Initialize Java SDK connecting to Node.js backend</span><br />
                  <span className="text-amber-400">NovaCartClient</span> client = <span className="text-cyan-400">new</span> <span className="text-amber-400">NovaCartClient</span>(<span className="text-emerald-300">"http://localhost:3000"</span>);<br />
                  <br />
                  <span className="text-slate-500">// 1. Authenticate with Node.js Express JWT</span><br />
                  <span className="text-amber-400">LoginResponse</span> auth = client.<span className="text-cyan-300">login</span>(<span className="text-emerald-300">"demo@example.com"</span>, <span className="text-emerald-300">"user123"</span>);<br />
                  <br />
                  <span className="text-slate-500">// 2. Query MongoDB catalog through Express REST API</span><br />
                  <span className="text-amber-400">String</span> productsJson = client.<span className="text-cyan-300">getProducts</span>();<br />
                  <br />
                  <span className="text-slate-500">// 3. Save / Toggle item in User Wishlist array</span><br />
                  <span className="text-amber-400">String</span> wishlistResult = client.<span className="text-cyan-300">toggleWishlist</span>(<span className="text-emerald-300">"652b11112222333344440011"</span>);<br />
                </div>
              </div>

              {/* Vanilla JavaScript Client Sample */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>Pure JavaScript ES6+ Client (server/utils/novacart-client.js)</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono">
                    JavaScript / Node.js
                  </span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1">
                  <span className="text-cyan-400">import</span> &#123; NovaCartJsClient &#125; <span className="text-cyan-400">from</span> <span className="text-emerald-300">'./novacart-client.js'</span>;<br />
                  <br />
                  <span className="text-cyan-400">const</span> client = <span className="text-cyan-400">new</span> <span className="text-emerald-400">NovaCartJsClient</span>(<span className="text-emerald-300">'http://localhost:3000'</span>);<br />
                  <span className="text-cyan-400">await</span> client.<span className="text-cyan-300">login</span>(<span className="text-emerald-300">'demo@example.com'</span>, <span className="text-emerald-300">'user123'</span>);<br />
                  <span className="text-cyan-400">const</span> wishlist = <span className="text-cyan-400">await</span> client.<span className="text-cyan-300">toggleWishlist</span>(productId);<br />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
          >
            Got it, close guide
          </button>
        </div>
      </div>
    </div>
  );
};
