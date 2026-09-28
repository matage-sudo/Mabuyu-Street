import { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  Activity,
  Plus,
  LogOut,
  RefreshCw,
  ShieldCheck,
  X,
  Menu,
} from 'lucide-react';

import logoImg from './assets/Gemini_Generated_Image_wt6ac1wt6ac1wt6a.jpeg';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function formatMoney(value) {
  return `KSh ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'activity', label: 'Activity Log', icon: Activity },
];

export default function AdminDashboard({ admin }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState('');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  const [categories, setCategories] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState('');

  const [activityLog, setActivityLog] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');

  const [unreadCounts, setUnreadCounts] = useState({ orders: 0, reviews: 0, customers: 0, activity: 0 });

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    badge: '',
    categoryId: '',
    stock: '',
  });
  const [productFormError, setProductFormError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/analytics');
      setAnalytics(data);
      setAnalyticsError('');
    } catch (err) {
      setAnalyticsError(err.message);
    }
  }, []);

  const loadUnreadCounts = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/unread-counts');
      setUnreadCounts(data || { orders: 0, reviews: 0, customers: 0, activity: 0 });
    } catch (err) {
      console.error('Failed to load unread counts', err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/orders');
      const fetchedOrders = data.orders || [];
      setOrders(fetchedOrders);
      setOrdersError('');
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const data = await apiFetch('/api/products');
      setProducts(data.products || []);
      setProductsError('');
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await apiFetch('/api/categories');
      setCategories(data.categories || []);
    } catch {
      // Categories are optional for the add-product form; fail quietly.
    }
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/reviews');
      const fetchedReviews = data.reviews || [];
      setReviews(fetchedReviews);
      setReviewsError('');
    } catch (err) {
      setReviewsError(err.message);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/customers');
      const fetchedCustomers = data.customers || [];
      setCustomers(fetchedCustomers);
      setCustomersError('');
    } catch (err) {
      setCustomersError(err.message);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    try {
      const data = await apiFetch('/api/admin/activity');
      const fetchedActivity = data.activity || [];
      setActivityLog(fetchedActivity);
      setActivityError('');
    } catch (err) {
      setActivityError(err.message);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  const loadAll = useCallback(() => {
    loadAnalytics();
    loadUnreadCounts();
    loadOrders();
    loadProducts();
    loadCategories();
    loadReviews();
    loadCustomers();
    loadActivity();
  }, [loadAnalytics, loadUnreadCounts, loadOrders, loadProducts, loadCategories, loadReviews, loadCustomers, loadActivity]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadAnalytics();
      loadUnreadCounts();
      loadOrders();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [loadAnalytics, loadUnreadCounts, loadOrders]);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Even if the request fails, reload so the session check runs again.
    }
    window.location.reload();
  };

  const handleTabChange = async (tabName) => {
    setActiveTab(tabName);

    const resourceMap = {
      orders: 'orders',
      reviews: 'reviews',
      customers: 'customers',
      activity: 'activity',
    };

    if (resourceMap[tabName] && unreadCounts[tabName] > 0) {
      try {
        await apiFetch(`/api/admin/mark-read/${resourceMap[tabName]}`, {
          method: 'POST',
        });
        setUnreadCounts((prev) => ({ ...prev, [tabName]: 0 }));
      } catch (err) {
        console.error('Failed to mark items as read', err);
      }
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const handleToggleReview = async (review) => {
    try {
      await apiFetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !review.is_published }),
      });
      loadReviews();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const handleRewardCustomer = async (customer) => {
    const pointsInput = window.prompt(`Points to award to ${customer.full_name || 'this customer'}:`, '50');
    if (!pointsInput) return;

    const points = Number(pointsInput);
    if (!Number.isFinite(points) || points <= 0) {
      window.alert('Enter a valid number of points.');
      return;
    }

    const reason = window.prompt('Reason for this reward:', 'Repeat customer bonus');
    if (!reason || !reason.trim()) return;

    try {
      await apiFetch(`/api/admin/customers/${customer.id}/reward`, {
        method: 'POST',
        body: JSON.stringify({ points, reason: reason.trim() }),
      });
      loadCustomers();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the storefront?`)) return;

    try {
      await apiFetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const openAddProduct = () => {
    setProductForm({ name: '', description: '', price: '', image: '', badge: '', categoryId: '', stock: '' });
    setProductFormError('');
    setShowAddProduct(true);
  };

  const handleProductFieldChange = (field, value) => {
    setProductForm((form) => ({ ...form, [field]: value }));
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setProductFormError('');

    if (!productForm.name.trim() || !productForm.price || !productForm.image.trim()) {
      setProductFormError('Name, price and image are required.');
      return;
    }

    setSavingProduct(true);

    try {
      await apiFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          name: productForm.name.trim(),
          description: productForm.description.trim() || null,
          price: Number(productForm.price),
          image: productForm.image.trim(),
          badge: productForm.badge.trim() || null,
          categoryId: productForm.categoryId || null,
          stock: productForm.stock ? Number(productForm.stock) : 0,
        }),
      });

      setShowAddProduct(false);
      loadProducts();
    } catch (err) {
      setProductFormError(err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#030712] text-slate-100">
      {mobileMenuOpen && (
        <div
          className="admin-drawer-backdrop md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`admin-sidebar flex flex-col w-64 border-r border-slate-800 bg-[#0f172a] ${mobileMenuOpen ? 'drawer-open' : 'hidden md:flex'}`}>
        <div className="px-5 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
           <img 
              src={logoImg} 
              alt="Mabuyu Street Logo" 
              style={{ width: '100px', height: '100px', objectFit: 'contain' }} 
            />
            <div>
              <p className="text-sm font-semibold text-slate-100">Mabuyu Street</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">Admin Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const unreadCount = unreadCounts[item.id] || 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`admin-nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {unreadCount > 0 && (
                  <span className="admin-unread-badge" title={`${unreadCount} unread`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="admin-nav-item w-full text-red-400 hover:bg-red-950/30 hover:text-red-300"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
              aria-label="Open Menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-sm font-semibold capitalize text-slate-100">
              {NAV_ITEMS.find((item) => item.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAll}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <div className="text-xs text-right">
              <p className="font-medium text-slate-100">{admin?.username}</p>
              <p className="text-slate-500 uppercase tracking-wide">{admin?.role}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'overview' && (
            <>
              {analyticsError && <p className="text-sm text-red-400">{analyticsError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={analytics ? formatMoney(analytics.totalRevenue) : '...'} />
                <StatCard title="Total Orders" value={analytics ? analytics.orderCount : '...'} />
                <StatCard title="Active Products" value={analytics ? analytics.productCount : '...'} />
                <StatCard title="Registered Customers" value={analytics ? analytics.customerCount : '...'} />
              </div>

              <div className="admin-card">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">Recent orders</h3>
                {ordersLoading ? (
                  <p className="text-sm text-slate-400">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-slate-400">No orders yet. New orders will appear here automatically.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Placed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td>{order.customer_profiles?.full_name || order.contact_phone || 'Guest'}</td>
                            <td>{(order.order_items || []).length} items</td>
                            <td>{formatMoney(order.total)}</td>
                            <td className="capitalize">{order.status.replace(/_/g, ' ')}</td>
                            <td>{formatDate(order.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="admin-card">
              {ordersError && <p className="text-sm text-red-400 mb-3">{ordersError}</p>}
              {ordersLoading ? (
                <p className="text-sm text-slate-400">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-slate-400">No orders have come in yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Placed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.customer_profiles?.full_name || 'Guest'}</td>
                          <td>{order.contact_phone || '-'}</td>
                          <td>
                            {(order.order_items || [])
                              .map((item) => `${item.product_name} x${item.quantity}`)
                              .join(', ')}
                          </td>
                          <td>{formatMoney(order.total)}</td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-md text-xs px-2 py-1 text-slate-100"
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Products</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Changes here appear immediately on the storefront.</p>
                </div>
                <button
                  type="button"
                  onClick={openAddProduct}
                  className="flex items-center gap-1.5 bg-[#ffb703] text-slate-900 text-xs font-semibold px-3 py-2 rounded-lg"
                >
                  <Plus size={14} />
                  Add product
                </button>
              </div>

              {productsError && <p className="text-sm text-red-400 mb-3">{productsError}</p>}
              {productsLoading ? (
                <p className="text-sm text-slate-400">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-slate-400">No products yet. Add your first one above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>{formatMoney(product.price)}</td>
                          <td>{product.stock}</td>
                          <td className="text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-400 hover:text-red-300 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="admin-card">
              {reviewsError && <p className="text-sm text-red-400 mb-3">{reviewsError}</p>}
              {reviewsLoading ? (
                <p className="text-sm text-slate-400">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-slate-400">No reviews yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Rating</th>
                        <th>Comment</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id}>
                          <td>{review.customer_profiles?.full_name || review.guest_name || 'Anonymous'}</td>
                          <td>{review.products?.name || '-'}</td>
                          <td>{review.rating} / 5</td>
                          <td className="max-w-xs truncate">{review.comment}</td>
                          <td>{review.is_published ? 'Published' : 'Hidden'}</td>
                          <td className="text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleReview(review)}
                              className="text-[#ffb703] hover:brightness-90 text-xs font-medium"
                            >
                              {review.is_published ? 'Hide' : 'Publish'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="admin-card">
              {customersError && <p className="text-sm text-red-400 mb-3">{customersError}</p>}
              {customersLoading ? (
                <p className="text-sm text-slate-400">Loading customers...</p>
              ) : customers.length === 0 ? (
                <p className="text-sm text-slate-400">No registered customers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Orders</th>
                        <th>Points</th>
                        <th>Repeat customer</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.full_name || 'Unnamed'}</td>
                          <td>{customer.phone || '-'}</td>
                          <td>{customer.total_orders}</td>
                          <td>{customer.loyalty_points}</td>
                          <td>{customer.is_repeat_customer ? 'Yes' : 'No'}</td>
                          <td className="text-right">
                            <button
                              type="button"
                              onClick={() => handleRewardCustomer(customer)}
                              className="text-[#ffb703] hover:brightness-90 text-xs font-medium"
                            >
                              Reward
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="admin-card">
              {activityError && <p className="text-sm text-red-400 mb-3">{activityError}</p>}
              {activityLoading ? (
                <p className="text-sm text-slate-400">Loading activity...</p>
              ) : activityLog.length === 0 ? (
                <p className="text-sm text-slate-400">No activity recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Actor</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.event_type.replace(/\./g, ' ')}</td>
                          <td className="capitalize">{entry.actor_type}</td>
                          <td>{formatDate(entry.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showAddProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="admin-card w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Add product</h3>
              <button type="button" onClick={() => setShowAddProduct(false)} aria-label="Close">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {productFormError && <p className="text-sm text-red-400">{productFormError}</p>}

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <FormField label="Name">
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(event) => handleProductFieldChange('name', event.target.value)}
                  className="admin-input"
                  required
                />
              </FormField>

              <FormField label="Description">
                <textarea
                  rows="2"
                  value={productForm.description}
                  onChange={(event) => handleProductFieldChange('description', event.target.value)}
                  className="admin-input"
                />
              </FormField>

              <FormField label="Price (KSh)">
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(event) => handleProductFieldChange('price', event.target.value)}
                  className="admin-input"
                  required
                />
              </FormField>

              <FormField label="Image URL">
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(event) => handleProductFieldChange('image', event.target.value)}
                  placeholder="https://..."
                  className="admin-input"
                  required
                />
              </FormField>

              <FormField label="Badge (optional)">
                <input
                  type="text"
                  value={productForm.badge}
                  onChange={(event) => handleProductFieldChange('badge', event.target.value)}
                  placeholder="e.g. Bestseller"
                  className="admin-input"
                />
              </FormField>

              <FormField label="Category">
                <select
                  value={productForm.categoryId}
                  onChange={(event) => handleProductFieldChange('categoryId', event.target.value)}
                  className="admin-input"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Stock">
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(event) => handleProductFieldChange('stock', event.target.value)}
                  className="admin-input"
                />
              </FormField>

              <button
                type="submit"
                disabled={savingProduct}
                className="w-full bg-[#ffb703] text-slate-900 font-medium py-2.5 rounded-lg disabled:opacity-60"
              >
                {savingProduct ? 'Saving...' : 'Save product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="admin-card">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <p className="text-2xl font-semibold text-slate-100 mt-1">{value}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wide text-slate-400 block mb-1">{label}</span>
      {children}
    </label>
  );
}