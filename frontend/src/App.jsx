import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Edit3,
  Gift,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Moon,
  Package,
  Phone,
  Plus,
  Repeat,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
  Mail,
  Clock,
} from 'lucide-react';

import './App.css';
import logoImg from './assets/Gemini_Generated_Image_wt6ac1wt6ac1wt6a.jpeg';
import achariImg from './assets/achari.jpeg';
import heroImg from './assets/hero.png';
import mabuyuImg from './assets/mabuyu.jpeg';
import popcornImg from './assets/popcorn.jpeg';
import datesImg from './assets/dates.jpeg';

const API_BASE = '/api';

const WHATSAPP_NUMBER = '254793400696';
const ORDER_PHONE = '0741521578';
const BUSINESS_EMAIL = 'mabuyustreet@gmail.com';

const STORAGE_KEY = 'mabuyuStreetSession';

const HERO_SLIDES = [
  {
    image: heroImg,
    eyebrow: 'FLAVOURED MABUYU • JUJA, KENYA',
    title: 'Welcome to Mabuyu Street',
    text: 'Street-style Kenyan confectioneries, snacks and custom packages made easy to order.',
  },
  {
    image: mabuyuImg,
    eyebrow: 'SWEET • TANGY • CRUNCHY',
    title: 'Find Your Favourite Flavour',
    text: 'Choose your Mabuyu flavour, build a bundle and send your order directly to Mabuyu Street.',
  },
  {
    image: achariImg,
    eyebrow: 'FRESH SNACKS FOR EVERY MOMENT',
    title: 'From Everyday Snacking to Events',
    text: 'Shop individual treats or build a custom package for birthdays, movie nights and hangouts.',
  },
  {
    image: popcornImg,
    eyebrow: 'ORDER • PAY • ENJOY',
    title: 'Your Snacks, Your Way',
    text: 'Order online, arrange pickup or request delivery around our service areas.',
  },
];

const POINTS_PER_KSH = 20; 
const POINTS_REDEMPTION = { points: 100, value: 50 }; 

const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function formatMoney(value) {
  return `KSh ${Number(value || 0).toLocaleString()}`;
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getTier(tiers, lifetimePoints) {
  if (!tiers || tiers.length === 0) return null;
  let current = tiers[0];
  for (const tier of tiers) {
    if (lifetimePoints >= tier.threshold) current = tier;
  }
  return current;
}

function getNextTier(tiers, lifetimePoints) {
  if (!tiers || tiers.length === 0) return null;
  return tiers.find((tier) => tier.threshold > lifetimePoints) || null;
}

function loadSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(session) {
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateAuthField(field, value) {
  const trimmed = (value || '').trim();

  switch (field) {
    case 'name':
      if (!trimmed) return 'Enter your full name:';
      if (trimmed.length < 2) return 'Your name must be at least 2 characters.';
      return '';
    case 'email':
      if (!trimmed) return 'Enter your email address.';
      if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address, like you@example.com.';
      return '';
    case 'password':
      if (!value) return 'Enter a password.';
      if (value.length < 8) return 'Your password must be at least 8 characters.';
      return '';
    case 'loginPassword':
      return value ? '' : 'Enter your password.';
    case 'phone': {
      if (!trimmed) return '';
      const digits = trimmed.replace(/[\s\-()]/g, '');
      return /^\+?\d{9,15}$/.test(digits) ? '' : 'Enter a valid phone number, like 0712 345 678.';
    }
    default:
      return '';
  }
}

function getPasswordChecks(password) {
  const value = password || '';
  return [
    { id: 'length', label: 'At least 8 characters', met: value.length >= 8, required: true },
    { id: 'letter', label: 'Includes a letter', met: /[A-Za-z]/.test(value), required: false },
    { id: 'number', label: 'Includes a number', met: /\d/.test(value), required: false },
  ];
}

const AUTH_INPUT_BASE = 'admin-input auth-input';
function authInputClass(hasError) {
  return `${AUTH_INPUT_BASE}${hasError ? ' auth-input-error' : ''}`;
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState([]);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [categories, setCategories] = useState(['All Products']);
  const [eventTypes, setEventTypes] = useState([]);
  const [eventPresets, setEventPresets] = useState({});
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState([]);

  const [selectedEventType, setSelectedEventType] = useState('');
  const [packageItems, setPackageItems] = useState({});

  const [inputReferralCode, setInputReferralCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [referralSuccess, setReferralSuccess] = useState(false);

  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  const [view, setView] = useState('shop');

  const [session, setSession] = useState(() => loadSession());
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); 
  const [authStep, setAuthStep] = useState(1);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [authTouched, setAuthTouched] = useState({});
  const [authSubmitted, setAuthSubmitted] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });

  const [selectedDelivery, setSelectedDelivery] = useState('juja');
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '', location: '', notes: '' });
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);


  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/products`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load products'))))
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products || []);
          setProductsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setProductsError(err.message);
          setProductsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadResource(path, pick) {
      try {
        const res = await fetch(`${API_BASE}/${path}`);
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        const data = await res.json();
        return pick(data);
      } catch (err) {
        console.error(`Could not load ${path}:`, err.message);
        return null;
      }
    }

    (async () => {
      const [reviewsData, zonesData, categoriesData, eventTypesData, eventPresetsData, loyaltyData] =
        await Promise.all([
          loadResource('reviews', (d) => d.reviews),
          loadResource('delivery-zones', (d) => d.deliveryZones),
          loadResource('categories', (d) => d.categories),
          loadResource('event-types', (d) => d.eventTypes),
          loadResource('event-presets', (d) => d.eventPresets),
          loadResource('loyalty-tiers', (d) => d.loyaltyTiers),
        ]);

      if (cancelled) return;

      if (reviewsData) {
        setReviews(
          reviewsData.map((review) => ({
            id: review.id,
            name: review.customer_profiles?.full_name || review.guest_name || 'Mabuyu Street customer',
            rating: review.rating,
            comment: review.comment || '',
            verified: Boolean(review.customer_id),
          }))
        );
      }

      if (zonesData) setDeliveryZones(zonesData);

      if (categoriesData) {
        setCategories(['All Products', ...categoriesData.map((category) => category.name)]);
      }

      if (eventTypesData) {
        const mapped = eventTypesData.map((eventType) => ({ id: eventType.id, label: eventType.name }));
        setEventTypes(mapped);
        setSelectedEventType((current) =>
          mapped.some((eventType) => eventType.id === current) ? current : mapped[0]?.id || ''
        );
      }

      if (eventPresetsData) {
        const presetMap = {};
        eventPresetsData.forEach((preset) => {
          if (!presetMap[preset.event_type_id]) presetMap[preset.event_type_id] = {};
          presetMap[preset.event_type_id][preset.product_id] = preset.quantity;
        });
        setEventPresets(presetMap);
      }

      if (loyaltyData) setLoyaltyTiers(loyaltyData);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadProfile = useCallback(async (userId, accessToken) => {
    try {
      const res = await fetch(`${API_BASE}/customers/me?userId=${encodeURIComponent(userId)}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error('Could not load profile');
      const data = await res.json();
      return data.customer || null;
    } catch (err) {
      console.error('Could not load customer profile:', err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          try {
            const meRes = await fetch(`${API_BASE}/auth/session-user`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            const meData = await meRes.json();

            if (meRes.ok && meData.user) {
              const newSession = { access_token: accessToken, refresh_token: refreshToken, user: meData.user };
              persistSession(newSession);
              setSession(newSession);

              await fetch(`${API_BASE}/auth/ensure-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: meData.user.id }),
              }).catch(() => {});

              const profile = await loadProfile(meData.user.id, accessToken);
              if (profile) setCurrentUser(profile);
            }
          } catch (err) {
            console.error('Magic link sign-in failed:', err.message);
          }

          window.history.replaceState(null, '', window.location.pathname);
        }

        setAuthChecking(false);
        return;
      }

      const saved = loadSession();
      if (saved?.user?.id) {
        const profile = await loadProfile(saved.user.id, saved.access_token);
        if (profile) {
          setCurrentUser(profile);
        } else {
          persistSession(null);
          setSession(null);
        }
      }
      setAuthChecking(false);
    })();
  }, [loadProfile]);

  const loadMyOrders = useCallback(async () => {
    if (!currentUser?.id) return;
    setMyOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers/me/orders?customerId=${encodeURIComponent(currentUser.id)}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (!res.ok) throw new Error('Could not load orders');
      const data = await res.json();
      setMyOrders(data.orders || []);
    } catch (err) {
      console.error('Could not load orders:', err.message);
    } finally {
      setMyOrdersLoading(false);
    }
  }, [currentUser?.id, session?.access_token]);

  useEffect(() => {
    if (view === 'account' && currentUser) {
      loadMyOrders();
      const interval = window.setInterval(loadMyOrders, 15000);
      return () => window.clearInterval(interval);
    }
  }, [view, currentUser, loadMyOrders]);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.full_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
      setCheckoutForm((form) => ({
        ...form,
        name: form.name || currentUser.full_name || '',
        email: form.email || currentUser.email || '',
        phone: form.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const cartQuantity = useMemo(
    () => cart.reduce((total, item) => total + item.qty, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.qty, 0),
    [cart]
  );

  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === 'All Products' ||
        product.category === selectedCategory;

      const searchMatch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, search, products]);

  const packageItemCount = useMemo(
    () => Object.values(packageItems).reduce((sum, quantity) => sum + quantity, 0),
    [packageItems]
  );

  const rawPackagePrice = useMemo(
    () =>
      Object.entries(packageItems).reduce((total, [productId, quantity]) => {
        const product = products.find((item) => item.id === productId);
        return total + (product ? product.price * quantity : 0);
      }, 0),
    [packageItems, products]
  );

  const packageDiscountPercent = useMemo(() => {
    if (rawPackagePrice >= 700) return 10;
    if (rawPackagePrice >= 400) return 5;
    return 0;
  }, [rawPackagePrice]);

  const finalPackagePrice = Math.round(
    rawPackagePrice * (1 - packageDiscountPercent / 100)
  );

  const nextPackageThreshold =
    rawPackagePrice >= 700 ? null : rawPackagePrice >= 400 ? 700 : 400;

  const tier = getTier(loyaltyTiers, currentUser?.lifetimePoints || 0) || {
    id: 'loading',
    name: loyaltyTiers.length === 0 ? 'Loading rewards…' : 'Street Taster',
    perk: '',
    threshold: 0,
  };
  const nextTier = getNextTier(loyaltyTiers, currentUser?.lifetimePoints || 0);
  const tierProgressPercent = nextTier
    ? Math.min(100, Math.round(((currentUser?.lifetimePoints || 0) / nextTier.threshold) * 100))
    : 100;

  const deliveryOption =
    deliveryZones.find((option) => option.id === selectedDelivery) ||
    deliveryZones[0] || { id: selectedDelivery || 'pickup', label: 'Delivery', fee: 0, note: '' };
  const deliveryFee = deliveryOption.fee;
  const canRedeemPoints = !!currentUser && (currentUser.loyalty_points || 0) >= POINTS_REDEMPTION.points;
  const pointsDiscount = redeemPoints && canRedeemPoints ? POINTS_REDEMPTION.value : 0;
  const checkoutTotal = Math.max(0, subtotal - appliedDiscount - pointsDiscount + deliveryFee);
  const pointsToEarn = Math.floor(checkoutTotal / POINTS_PER_KSH);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...current, { ...product, qty: 1 }];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const handlePackageQtyChange = (productId, delta) => {
    setPackageItems((current) => {
      const nextQuantity = (current[productId] || 0) + delta;

      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[productId];
        return next;
      }

      return {
        ...current,
        [productId]: nextQuantity,
      };
    });
  };

  const addCustomPackageToCart = () => {
    if (packageItemCount === 0) {
      window.alert('Please select at least 1 item for your event package.');
      return;
    }

    Object.entries(packageItems).forEach(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);

      if (!product) return;

      for (let index = 0; index < quantity; index += 1) {
        addToCart(product);
      }
    });

    setView('cart');
  };

  const applyEventPreset = () => {
    const preset = eventPresets[selectedEventType];

    if (!preset || Object.keys(preset).length === 0) {
      window.alert('Pick a specific event type above to load a ready-made bundle, or build your own below.');
      return;
    }

    setPackageItems(preset);
  };

  const handleSaveBundle = () => {
    window.alert('Saved bundles are moving to your account on the server and will be back shortly.');
  };

  const handleApplyReferral = () => {
    const code = inputReferralCode.trim().toUpperCase();

    if (code === 'FRIEND50' || code.length >= 6) {
      setAppliedDiscount(50);
      setReferralSuccess(true);
      return;
    }

    setAppliedDiscount(0);
    setReferralSuccess(false);
    window.alert('Invalid code. Try FRIEND50 or a valid friend code.');
  };

  const copyReferralCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      window.alert('Referral code copied!');
    } catch {
      window.alert(`Your referral code is ${code}`);
    }
  };

  const handleAddReview = async (event) => {
    event.preventDefault();

    if (!newReview.name.trim() || !newReview.comment.trim()) {
      window.alert('Please fill in your name and review.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser?.id || null,
          productId: null,
          guestName: newReview.name.trim(),
          rating: Number(newReview.rating),
          comment: newReview.comment.trim(),
        }),
      });

      if (!response.ok) throw new Error('Could not submit review.');

      const data = await response.json();

      setReviews((current) => [
        {
          id: data.review?.id || `review-${Date.now()}`,
          name: newReview.name.trim(),
          rating: Number(newReview.rating),
          comment: newReview.comment.trim(),
          verified: Boolean(currentUser),
        },
        ...current,
      ]);

      setNewReview({ name: '', rating: 5, comment: '' });
      setShowReviewModal(false);
    } catch (err) {
      window.alert('Sorry, we could not submit your review right now. Please try again in a moment.');
    }
  };

  const goHome = () => {
    setView('shop');
    setShowMobileMenu(false);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const goToSection = (id) => {
    setView('shop');
    setShowMobileMenu(false);
    window.setTimeout(() => scrollToId(id), 0);
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setView('shop');
    window.setTimeout(() => scrollToId('shop'), 0);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthStep(1);
    setAuthError('');
    setAuthNotice('');
    setAuthTouched({});
    setAuthSubmitted(false);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthStep(1);
    setAuthMode('signup');
    setAuthForm({ name: '', email: '', password: '', phone: '' });
    setAuthError('');
    setAuthNotice('');
    setAuthTouched({});
    setAuthSubmitted(false);
  };

  const handleAuthFieldChange = (field, value) => {
    setAuthForm((form) => ({ ...form, [field]: value }));
  };

  useEffect(() => {
    if (!showAuthModal) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeAuthModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuthModal]);

  const handleAuthBlur = (field) => {
    setAuthTouched((touched) => ({ ...touched, [field]: true }));
  };

  const authFieldErrors = useMemo(
    () => ({
      name: validateAuthField('name', authForm.name),
      email: validateAuthField('email', authForm.email),
      password: validateAuthField(authMode === 'login' ? 'loginPassword' : 'password', authForm.password),
      phone: validateAuthField('phone', authForm.phone),
    }),
    [authForm, authMode]
  );

  const showAuthError = (field) => (authTouched[field] || authSubmitted ? authFieldErrors[field] : '');

  const focusAuthField = (id) => {
    window.setTimeout(() => document.getElementById(id)?.focus(), 0);
  };

  const signupStepNumber = authStep === 3 ? 2 : 1;

  const handleAuthContinue = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setAuthSubmitted(true);

    if (authMode === 'magic') {
      if (authFieldErrors.email) {
        focusAuthField('auth-email');
        return;
      }

      if (!authForm.email.trim()) {
        setAuthError('Enter your email address.');
        return;
      }

      setAuthLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/magic-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authForm.email.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not send magic link.');
        setAuthNotice(data.message || 'Check your email for a sign-in link.');
      } catch (err) {
        setAuthError(err.message);
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (authMode === 'login') {
      if (authFieldErrors.email || authFieldErrors.password) {
        focusAuthField(authFieldErrors.email ? 'auth-email' : 'auth-password');
        return;
      }

      if (!authForm.email.trim() || !authForm.password) {
        setAuthError('Enter your email and password.');
        return;
      }

      setAuthLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authForm.email.trim(), password: authForm.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid email or password.');

        const newSession = { access_token: data.session?.access_token, refresh_token: data.session?.refresh_token, user: data.user };
        persistSession(newSession);
        setSession(newSession);

        const profile = await loadProfile(data.user.id, newSession.access_token);
        setCurrentUser(profile);
        closeAuthModal();
      } catch (err) {
        setAuthError(err.message);
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (authStep === 1) {
      const firstInvalidField = ['name', 'email', 'password', 'phone'].find((field) => authFieldErrors[field]);
      if (firstInvalidField) {
        focusAuthField(`auth-${firstInvalidField}`);
        return;
      }

      if (!authForm.name.trim() || !authForm.email.trim() || authForm.password.length < 8) {
        setAuthError('Fill in your name, email, and a password with at least 8 characters.');
        return;
      }

      setAuthLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authForm.email.trim(),
            password: authForm.password,
            fullName: authForm.name.trim(),
            phone: authForm.phone.trim() || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not create account.');

        if (data.needsEmailConfirmation) {
          setAuthStep(3);
          setAuthNotice('Check your email to confirm your account, then sign in.');
        } else {
          setAuthStep(3);
        }
      } catch (err) {
        setAuthError(err.message);
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    closeAuthModal();
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' }).catch(() => {});
    } finally {
      persistSession(null);
      setSession(null);
      setCurrentUser(null);
      setMyOrders([]);
      setView('shop');
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    try {
      const res = await fetch(`${API_BASE}/customers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          userId: currentUser.id,
          fullName: profileForm.name.trim() || currentUser.full_name,
          phone: profileForm.phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save profile.');
      setCurrentUser(data.customer);
    } catch (err) {
      window.alert(err.message);
    }
  };

  const handleCheckoutFieldChange = (field, value) => {
    setCheckoutForm((form) => ({ ...form, [field]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      window.alert('Please sign in or create a free account to place your order.');
      openAuthModal('signup');
      return;
    }

    if (cart.length === 0) {
      window.alert('Your cart is empty.');
      return;
    }

    if (!checkoutForm.name.trim() || !checkoutForm.phone.trim()) {
      window.alert('Please fill in your name and phone number.');
      return;
    }

    if (selectedDelivery !== 'pickup' && !checkoutForm.location.trim()) {
      window.alert('Please add a delivery location, or choose Pickup instead.');
      return;
    }

    const orderId = `MB-${Date.now().toString().slice(-6)}`;

    let backendOrderId = null;
    let backendSaveFailed = false;

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          customerId: currentUser.id,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: Number(item.qty),
          })),
          deliveryAddress: selectedDelivery === 'pickup' ? 'Pickup — Juja Gate C' : checkoutForm.location,
          contactPhone: checkoutForm.phone,
          paymentMethod: 'dashboard_order',
        }),
      });

      if (!response.ok) throw new Error('Order could not be saved.');

      const data = await response.json();
      backendOrderId = data.order?.id || null;
    } catch (err) {
      backendSaveFailed = true;
      console.error('Order backend save failed:', err.message);
    }

    setLastOrder({
      id: orderId,
      backendOrderId,
      backendSaveFailed,
      total: checkoutTotal,
      pointsEarned: pointsToEarn,
    });

    setCart([]);
    setAppliedDiscount(0);
    setReferralSuccess(false);
    setRedeemPoints(false);
    setView('confirmation');

    loadProfile(currentUser.id, session?.access_token).then((profile) => {
      if (profile) setCurrentUser(profile);
    });
    loadMyOrders();
  };

  return (
    <div className="app-container">
      <header className="header-nav">
        <div className="container nav-wrapper">
          <button type="button" className="brand-logo" onClick={goHome} aria-label="Go to Mabuyu Street home">
            <img src={logoImg} alt="Mabuyu Street" className="logo-badge" />
            <span className="brand-name">MABUYU STREET</span>
          </button>

          <div className="search-box-pill">
            <Search className="search-icon" size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products and categories..."
              aria-label="Search products"
            />
          </div>

          <nav className={`nav-menu ${showMobileMenu ? 'open' : ''}`}>
            <button type="button" className="nav-link" onClick={goHome}>Home</button>
            <button type="button" className="nav-link" onClick={() => goToSection('packages')}>Event Bundles</button>
            <button type="button" className="nav-link" onClick={() => goToSection('shop')}>Shop</button>
            <button type="button" className="nav-link" onClick={() => goToSection('loyalty')}>Rewards</button>
            <button type="button" className="nav-link" onClick={() => goToSection('reviews')}>Reviews</button>
            <button type="button" className="nav-link" onClick={() => goToSection('contact')}>Contact</button>
          </nav>

          <div className="nav-icons">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setDarkMode((current) => !current)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              type="button"
              className="icon-btn cart-btn"
              onClick={() => setView(view === 'cart' ? 'shop' : 'cart')}
              title="Open cart"
              aria-label="Open cart"
            >
              <ShoppingBag size={18} />
              {cartQuantity > 0 && <span className="cart-count">{cartQuantity}</span>}
            </button>

            <button
              type="button"
              className="icon-btn account-btn"
              onClick={() => (currentUser ? setView('account') : openAuthModal('signup'))}
              title={currentUser ? 'My account' : 'Sign in'}
              aria-label={currentUser ? 'My account' : 'Sign in'}
            >
              {currentUser ? (
                <span className="avatar-initial">{(currentUser.full_name || 'U').trim().charAt(0).toUpperCase()}</span>
              ) : (
                <User size={18} />
              )}
            </button>

            <button
              type="button"
              className="icon-btn mobile-menu-toggle"
              onClick={() => setShowMobileMenu((current) => !current)}
              title="Menu"
              aria-label="Open menu"
            >
              {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container main-content-wrapper">
        {view === 'cart' && (
          <section className="cart-page-wrapper">
            <div
              className="cart-hero-banner"
              style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
            >
              <div className="cart-hero-overlay" />
              <div className="cart-hero-content">
                <div>
                  <span className="cart-tag">PREMIUM CHECKOUT</span>
                  <h1 className="cart-title">Your Cart</h1>
                  <p className="cart-subtitle">
                    Review your selected items before checkout.
                  </p>
                </div>
                <div className="items-pill">
                  {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>

            <div className="auth-notice-bar">
              {currentUser ? (
                <>Signed in as {currentUser.full_name || currentUser.email} • {currentUser.loyalty_points || 0} Mabuyu Rewards points</>
              ) : (
                <>
                  Create a free account to place your order and track it.{' '}
                  <button type="button" className="inline-link-btn" onClick={() => openAuthModal('signup')}>
                    Create an account
                  </button>
                </>
              )}
            </div>

            <div className="cart-nav-header">
              <span>{cart.length} unique products</span>
              <button type="button" className="continue-link" onClick={() => setView('shop')}>
                Continue shopping <ArrowRight size={15} />
              </button>
            </div>

            <div className="cart-grid-layout">
              <div className="cart-items-list">
                {cart.length === 0 ? (
                  <div className="empty-cart-box">
                    <ShoppingCart size={46} className="empty-cart-icon" />
                    <h3>Your cart is empty</h3>
                    <p className="empty-cart-sub">
                      Add some Mabuyu Street favourites to continue.
                    </p>
                    <button type="button" className="hero-btn" onClick={() => setView('shop')}>
                      Browse Products
                    </button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <article className="cart-item-row" key={item.id}>
                      <div className="cart-item-left">
                        <span className="item-index-badge">{index + 1}</span>
                        <img src={item.image} alt={item.name} className="cart-item-img" />
                        <div>
                          <h4 className="cart-item-title">{item.name}</h4>
                          <p className="cart-item-unit-price">
                            Each: {formatMoney(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="cart-item-controls">
                        <div className="qty-control cart-qty-box">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            aria-label={`Decrease ${item.name}`}
                          >
                            <Minus size={15} />
                          </button>
                          <span className="qty-number">{item.qty}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            aria-label={`Increase ${item.name}`}
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <strong className="cart-item-total">
                          {formatMoney(item.price * item.qty)}
                        </strong>

                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <aside className="cart-summary-card">
                <div className="summary-title">
                  <CheckCircle2 size={18} />
                  <span>Order Summary</span>
                </div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>{formatMoney(subtotal)}</strong>
                </div>

                {appliedDiscount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Referral Discount</span>
                    <strong>-{formatMoney(appliedDiscount)}</strong>
                  </div>
                )}

                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="muted-text">Calculated at checkout</span>
                </div>

                <div className="summary-row total-row">
                  <span>Estimated total</span>
                  <strong className="summary-total-price">{formatMoney(finalTotal)}</strong>
                </div>

                <button
                  type="button"
                  className="btn-black-checkout"
                  onClick={() => setView('checkout')}
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </button>

                <div className="checkout-note">
                  <CheckCircle2 size={16} />
                  <span>Delivery method and final total are confirmed on the next step.</span>
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === 'checkout' && (
          <section className="checkout-page-wrapper">
            <div className="section-title-wrap">
              <div>
                <span className="section-label">SECURE ORDER</span>
                <h1 className="main-heading">Complete Your Order</h1>
              </div>
              <button type="button" className="continue-link" onClick={() => setView('cart')}>
                <ArrowLeft size={15} /> Back to cart
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart-box">
                <ShoppingCart size={46} className="empty-cart-icon" />
                <h3>Nothing to check out yet</h3>
                <p className="empty-cart-sub">Add products or a package to your cart first.</p>
                <button type="button" className="hero-btn" onClick={() => setView('shop')}>
                  Browse Products
                </button>
              </div>
            ) : !currentUser ? (
              <div className="empty-cart-box">
                <User size={46} className="empty-cart-icon" />
                <h3>Sign in to place your order</h3>
                <p className="empty-cart-sub">
                  Creating a free account lets you track your order status and earn Mabuyu Rewards points.
                </p>
                <button type="button" className="hero-btn" onClick={() => openAuthModal('signup')}>
                  Create a free account
                </button>
                <button type="button" className="btn-outline" style={{ marginTop: '10px' }} onClick={() => openAuthModal('login')}>
                  I already have an account
                </button>
              </div>
            ) : (
              <div className="checkout-grid">
                <div className="checkout-summary-panel">
                  <div className="summary-title">
                    <CheckCircle2 size={18} />
                    <span>Order Summary</span>
                  </div>

                  <div className="checkout-items-list">
                    {cart.map((item) => (
                      <div className="checkout-line-item" key={item.id}>
                        <span>{item.name} <span className="muted-text">x{item.qty}</span></span>
                        <strong>{formatMoney(item.price * item.qty)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="summary-row">
                    <span>Subtotal</span>
                    <strong>{formatMoney(subtotal)}</strong>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="summary-row discount-row">
                      <span>Referral Discount</span>
                      <strong>-{formatMoney(appliedDiscount)}</strong>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="summary-row discount-row">
                      <span>Rewards Points Redeemed</span>
                      <strong>-{formatMoney(pointsDiscount)}</strong>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>{deliveryOption.label}</span>
                    <strong>{deliveryFee > 0 ? formatMoney(deliveryFee) : 'Free'}</strong>
                  </div>

                  <div className="summary-row total-row">
                    <span>Total due</span>
                    <strong className="summary-total-price">{formatMoney(checkoutTotal)}</strong>
                  </div>

                  <div className="points-earn-note">
                    <Sparkles size={14} />
                    <span>You will earn {pointsToEarn} Mabuyu Rewards points on this order.</span>
                  </div>
                </div>

                <form className="checkout-form-panel" onSubmit={handlePlaceOrder}>
                  <h3 className="panel-heading">YOUR DETAILS</h3>

                  <label className=" panel-heading form-group">
                    <span>Full Name : </span>
                    <input
                      type="text"
                      value={checkoutForm.name}
                      onChange={(event) => handleCheckoutFieldChange('name', event.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <div className="form-row-2">
                    <label className="panel-heading form-group">
                      <span>Phone number : </span>
                      <input
                        type="tel"
                        value={checkoutForm.phone}
                        onChange={(event) => handleCheckoutFieldChange('phone', event.target.value)}
                        placeholder="07xx xxx xxx"
                        autoComplete="tel"
                        required
                      />
                    </label>
                    <label className="panel-heading form-group">
                      <span>Email (optional)</span>
                      <input
                        type="email"
                        value={checkoutForm.email}
                        onChange={(event) => handleCheckoutFieldChange('email', event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </label>
                  </div>

                  <h3 className="panel-heading">Choose delivery</h3>
                  {deliveryZones.length === 0 && (
                    <p className="muted-text">Loading delivery options…</p>
                  )}
                  <div className="delivery-options-grid">
                    {deliveryZones.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        className={`delivery-option-card ${selectedDelivery === option.id ? 'selected' : ''}`}
                        onClick={() => setSelectedDelivery(option.id)}
                      >
                        <span className="delivery-option-icon">
                          {option.id === 'pickup' ? <ShoppingBag size={17} /> : <Truck size={17} />}
                        </span>
                        <span className="delivery-option-label">{option.label}</span>
                        <span className="delivery-option-fee">
                          {option.fee > 0 ? formatMoney(option.fee) : 'Free'}
                        </span>
                        <span className="delivery-option-note">{option.note}</span>
                      </button>
                    ))}
                  </div>

                  <label className="form-group">
                    <span>Delivery location{selectedDelivery === 'pickup' ? ' (optional)' : ''}</span>
                    <input
                      type="text"
                      value={checkoutForm.location}
                      onChange={(event) => handleCheckoutFieldChange('location', event.target.value)}
                      placeholder="Estate, landmark or building"
                      required={selectedDelivery !== 'pickup'}
                    />
                  </label>

                  <label className="form-group">
                    <span>Notes (optional)</span>
                    <textarea
                      rows="3"
                      value={checkoutForm.notes}
                      onChange={(event) => handleCheckoutFieldChange('notes', event.target.value)}
                      placeholder="Gate code, delivery window, or any special request"
                    />
                  </label>

                  {canRedeemPoints && (
                    <label className="redeem-points-row">
                      <input
                        type="checkbox"
                        checked={redeemPoints}
                        onChange={(event) => setRedeemPoints(event.target.checked)}
                      />
                      <span>
                        Redeem {POINTS_REDEMPTION.points} points for {formatMoney(POINTS_REDEMPTION.value)} off
                        (balance: {currentUser.loyalty_points || 0} points)
                      </span>
                    </label>
                  )}

                  <button type="submit" className="btn-black-checkout">
                    Place Order 
                    <CheckCircle2 size={18} />
                  </button>
                </form>
              </div>
            )}
          </section>
        )}

        {view === 'account' && currentUser && (
          <section className="account-page-wrapper">
            <div
              className="account-hero-banner"
              style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
            >
              <div className="account-hero-overlay" />
              <div className="account-hero-content">
                <span className="section-label light-label">MY ACCOUNT</span>
                <h1 className="account-title">{currentUser.full_name || 'Mabuyu Street customer'}</h1>
                <p className="account-sub">
                  Member since{' '}
                  {currentUser.created_at
                    ? new Date(currentUser.created_at).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
                    : 'recently'}
                </p>
              </div>
            </div>

            <div className="account-grid">
              <div className="account-main-col">
                <div className="account-card">
                  <h3 className="panel-heading">Profile details</h3>
                  <form className="profile-form" onSubmit={handleSaveProfile}>
                    <div className="form-row-2">
                      <label className="panel-heading form-group">
                        <span>Name : </span>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(event) => setProfileForm((form) => ({ ...form, name: event.target.value }))}
                          autoComplete="name"
                        />
                      </label>
                      <label className="panel-heading form-group">
                        <span>Email : </span>
                        <input type="email" value={profileForm.email} disabled autoComplete="email" />
                      </label>
                    </div>
                    <label className="panel-heading form-group">
                      <span>Phone : </span>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(event) => setProfileForm((form) => ({ ...form, phone: event.target.value }))}
                        placeholder="07xx xxx xxx"
                        autoComplete="tel"
                      />
                    </label>
                    <div className="profile-actions">
                      <button type="submit" className="orange-submit-btn">
                        <Edit3 size={16} />
                        Save profile
                      </button>
                      <button type="button" className="btn-outline" onClick={handleLogout}>
                        <LogOut size={16} />
                        Log out
                      </button>
                    </div>
                  </form>
                </div>

                <div className="account-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="panel-heading">Order tracking</h3>
                    {myOrdersLoading && <span className="muted-text" style={{ fontSize: '0.7rem' }}>Refreshing…</span>}
                  </div>
                  {myOrders.length === 0 ? (
                    <p className="empty-cart-sub">No orders yet. Your Mabuyu Street orders will show up here.</p>
                  ) : (
                    <div className="order-history-list">
                      {myOrders.map((order) => (
                        <div className="order-history-row" key={order.id}>
                          <div>
                            <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
                            <span className="muted-text"> • {new Date(order.created_at).toLocaleDateString()}</span>
                            <div className="order-history-items">
                              {(order.order_items || []).map((item) => `${item.product_name} x${item.quantity}`).join(', ')}
                            </div>
                          </div>
                          <div className="order-history-total">
                            <strong>{formatMoney(order.total)}</strong>
                            <span className="order-points-tag">
                              <Clock size={12} /> {ORDER_STATUS_LABELS[order.status] || order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <aside className="account-side-col">
                <div className="loyalty-tier-card">
                  <span className="feature-icon"><Award size={18} /></span>
                  <h3>{tier.name}</h3>
                  <p className="tier-perk-text">{tier.perk}</p>
                  <div className="points-balance-line">
                    <Wallet size={16} />
                    <span>{currentUser.loyalty_points || 0} points available</span>
                  </div>
                  {nextTier ? (
                    <>
                      <div className="tier-progress-track">
                        <div className="tier-progress-fill" style={{ width: `${tierProgressPercent}%` }} />
                      </div>
                      <span className="tier-progress-note">
                        {nextTier.threshold - (currentUser.lifetimePoints || 0)} points to {nextTier.name}
                      </span>
                    </>
                  ) : (
                    <span className="tier-progress-note">You have reached our top tier.</span>
                  )}
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === 'confirmation' && lastOrder && (
          <section className="confirmation-page-wrapper">
            <div className="confirmation-card">
              <span className="confirmation-icon"><CheckCircle2 size={40} /></span>
              <span className="section-label">ORDER PLACED SUCCESSFULLY</span>
              <h1 className="main-heading">
                Thanks{currentUser ? `, ${(currentUser.full_name || '').split(' ')[0]}` : ''}!
              </h1>
              <p className="confirmation-sub">
                Your order <strong>{lastOrder.id}</strong> for {formatMoney(lastOrder.total)} has been successfully submitted to the admin dashboard.
              </p>

              {lastOrder.backendOrderId && !lastOrder.backendSaveFailed && (
                <div className="points-earned-banner">
                  <CheckCircle2 size={16} />
                  <span>
                    Successfully recorded — reference #{lastOrder.backendOrderId.slice(0, 8).toUpperCase()}.
                    Track its preparation status from My Account.
                  </span>
                </div>
              )}

              {lastOrder.pointsEarned > 0 && (
                <div className="points-earned-banner">
                  <Sparkles size={16} />
                  <span>+{lastOrder.pointsEarned} points added to your account.</span>
                </div>
              )}

              <div className="confirmation-actions">
                <button type="button" className="hero-btn" onClick={() => setView('shop')}>
                  Continue Shopping
                </button>
                <button type="button" className="btn-outline" onClick={() => setView('account')}>
                  Track My Order
                </button>
              </div>
            </div>
          </section>
        )}

        {view === 'shop' && (
          <>
            <section className="hero-layout">
              <aside className="side-categories" aria-label="Product categories">
                <div className="cat-header">Categories</div>
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={`cat-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => selectCategory(category)}
                  >
                    <span>{category}</span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </aside>

              <div
                className="hero-banner"
                style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
              >
                <div className="hero-overlay" />

                <div className="hero-content">
                  <span className="hero-tag">{HERO_SLIDES[currentSlide].eyebrow}</span>
                  <h1 className="hero-title">{HERO_SLIDES[currentSlide].title}</h1>
                  <p className="hero-sub">{HERO_SLIDES[currentSlide].text}</p>

                  <div className="hero-actions">
                    <button type="button" className="hero-btn" onClick={() => scrollToId('shop')}>
                      Shop Now
                      <ArrowRight size={17} />
                    </button>
                    <button type="button" className="hero-secondary-btn" onClick={() => scrollToId('packages')}>
                      Build a Package
                    </button>
                  </div>

                  <div className="hero-dots" aria-label="Hero slides">
                    {HERO_SLIDES.map((slide, index) => (
                      <button
                        type="button"
                        key={slide.title}
                        className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Show slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="quick-service-strip">
              <div className="service-item">
                <Truck size={19} />
                <div>
                  <strong>Delivery</strong>
                  <span>Countrywide</span>
                </div>
              </div>
              <div className="service-item">
                <ShoppingBag size={19} />
                <div>
                  <strong>Pickup</strong>
                  <span>Juja Gate C</span>
                </div>
              </div>
              <div className="service-item">
                <MessageCircle size={19} />
                <div>
                  <strong>WhatsApp</strong>
                  <span>Quick order support</span>
                </div>
              </div>
              <div className="service-item">
                <Tag size={19} />
                <div>
                  <strong>Rewards</strong>
                  <span>Points on every order</span>
                </div>
              </div>
            </section>

            <section id="shop" className="section-block">
              <div className="section-title-wrap">
                <div>
                  <span className="section-label">THIS MONTH</span>
                  <h2 className="main-heading">Best Selling Products</h2>
                </div>

                <div className="shop-tools">
                  <span className="filter-count-badge">
                    {filteredProducts.length} products
                  </span>
                  {search && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setSearch('')}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>

              <div className="products-grid">
                {productsLoading ? (
                  <div className="no-products-found">
                    <p>Loading products…</p>
                  </div>
                ) : productsError ? (
                  <div className="no-products-found">
                    <p>Could not load products right now. Please refresh the page.</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="no-products-found">
                    <Search size={34} />
                    <h3>No products found</h3>
                    <p>Try another search term or category.</p>
                    <button
                      type="button"
                      className="hero-btn"
                      onClick={() => {
                        setSearch('');
                        setSelectedCategory('All Products');
                      }}
                    >
                      Reset Shop
                    </button>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <article className="asenga-card" key={product.id} style={{ border: '1px solid rgba(180, 100, 40, 0.22)', borderRadius: '12px' }}>
                      <div className="card-img-wrap">
                        <img src={product.image} alt={product.name} loading="lazy" />
                        {product.badge && <span className="badge-tag">{product.badge}</span>}
                        <button
                          type="button"
                          className="card-quick-add"
                          onClick={() => addToCart(product)}
                          title={`Add ${product.name} to cart`}
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <Plus size={17} />
                        </button>
                      </div>

                      <div className="card-info">
                        <span className="card-category">{product.category}</span>
                        <h3 className="card-title">{product.name}</h3>
                        <p className="card-description">{product.description}</p>
                        <div className="card-footer">
                          <span className="card-price">{formatMoney(product.price)}</span>
                          <button
                            type="button"
                            className="btn-add-cart"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingBag size={16} />
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section id="packages" className="section-block">
              <div className="section-title-wrap">
                <div>
                  <span className="section-label">EVENT SPECIALS</span>
                  <h2 className="main-heading">Create Your Custom Party Package</h2>
                </div>
              </div>

              <div className="package-builder-card">
                <div className="package-builder-heading">
                  <div>
                    <span className="feature-icon"><Gift size={18} /></span>
                    <h3>Build it your way</h3>
                  </div>
                  <span className="package-discount-note">
                    Up to 10% automatic package discount for goods starting at KSh 700
                  </span>
                </div>

                <p className="sub-text">
                  Planning a birthday, movie night, hangout, picnic or corporate event? 
                  Choose products and get automatic discounts when your total hits KSh 700, or start from a ready-made bundle.
                </p>

                {eventTypes.length === 0 && (
                  <p className="muted-text">Loading event types…</p>
                )}

                <div className="event-pills-row">
                  {eventTypes.map((eventType) => (
                    <button
                      type="button"
                      key={eventType.id}
                      className={`event-pill ${selectedEventType === eventType.id ? 'active' : ''}`}
                      onClick={() => setSelectedEventType(eventType.id)}
                    >
                      {eventType.label}
                    </button>
                  ))}
                </div>

                <div className="package-quick-actions">
                  <button type="button" className="btn-outline small" onClick={applyEventPreset}>
                    <Sparkles size={14} />
                    Use suggested bundle
                  </button>
                  <button type="button" className="btn-outline small" onClick={handleSaveBundle}>
                    <Bookmark size={14} />
                    Save this bundle
                  </button>
                </div>

                <div className="package-items-grid">
                  {products.map((product) => {
                    const selectedQty = packageItems[product.id] || 0;

                    return (
                      <div
                        className={`package-item-chip ${selectedQty > 0 ? 'selected' : ''}`}
                        key={product.id}
                      >
                        <div className="chip-info">
                          <span className="chip-title-text">{product.name}</span>
                          <span className="chip-price-text">{formatMoney(product.price)}</span>
                        </div>

                        <div className="qty-control">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handlePackageQtyChange(product.id, -1)}
                            aria-label={`Decrease ${product.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-number">{selectedQty}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handlePackageQtyChange(product.id, 1)}
                            aria-label={`Increase ${product.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="tier-progress-mini">
                  <div className="tier-progress-track">
                    <div
                      className="tier-progress-fill"
                      style={{ width: `${Math.min(100, (rawPackagePrice / 700) * 100)}%` }}
                    />
                  </div>
                  <span className="tier-progress-note">
                    {nextPackageThreshold
                      ? rawPackagePrice < 400
                        ? `Add KSh ${400 - rawPackagePrice} more to unlock 5% off (reach KSh 700 for 10% off).`
                        : `Add KSh ${700 - rawPackagePrice} more to unlock your max 10% automatic package discount.`
                      : 'Maximum 10% automatic package discount unlocked!'}
                  </span>
                </div>

                <div className="package-summary-bar">
                  <div>
                    <span className="summary-caption">
                      {(selectedEventType || '').toUpperCase()} • {packageItemCount} items
                    </span>
                    <div className="package-price-line">
                      <strong>{formatMoney(finalPackagePrice)}</strong>
                      {packageDiscountPercent > 0 && (
                        <span className="old-price">{formatMoney(rawPackagePrice)}</span>
                      )}
                    </div>
                    {packageDiscountPercent > 0 && (
                      <span className="discount-badge">
                        {packageDiscountPercent}% OFF APPLIED
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="orange-submit-btn package-add-btn"
                    onClick={addCustomPackageToCart}
                  >
                    <Plus size={18} />
                    Add Package to Cart
                  </button>
                </div>
              </div>
            </section>

            <section id="loyalty" className="section-block">
              <div className="section-title-wrap">
                <div>
                  <span className="section-label">MABUYU REWARDS</span>
                  <h2 className="main-heading">Loyalty That Keeps The Flavour Coming</h2>
                </div>
              </div>

              <div className="loyalty-tiers-grid">
                {loyaltyTiers.map((loyaltyTier) => (
                  <div
                    key={loyaltyTier.id}
                    className={`loyalty-tier-tile ${currentUser && tier.id === loyaltyTier.id ? 'current' : ''}`}
                  >
                    <span className="feature-icon"><Award size={18} /></span>
                    <h3>{loyaltyTier.name}</h3>
                    <span className="tier-threshold-text">
                      {loyaltyTier.threshold === 0
                        ? 'Start earning from your first order'
                        : `From ${loyaltyTier.threshold} lifetime points`}
                    </span>
                    <p className="tier-perk-text">{loyaltyTier.perk}</p>
                    {currentUser && tier.id === loyaltyTier.id && (
                      <span className="discount-badge">YOUR CURRENT TIER</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section id="reviews" className="section-block">
              <div className="section-title-wrap">
                <div>
                  <span className="section-label">CUSTOMER FEEDBACK</span>
                  <h2 className="main-heading">Reviews & Ratings</h2>
                </div>

                <button
                  type="button"
                  className="hero-btn"
                  onClick={() => setShowReviewModal(true)}
                >
                  Leave a Review
                  <Star size={16} />
                </button>
              </div>

              <div className="reviews-grid">
                {reviews.length === 0 ? (
                  <p className="muted-text">No reviews yet — be the first to share your experience!</p>
                ) : (
                  reviews.map((review) => (
                    <article className="review-card" key={review.id}>
                      <div className="review-header">
                        <div className="stars-row" aria-label={`${review.rating} out of 5 stars`}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              fill={star <= review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <span className="verified-badge">
                            <Check size={12} />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <p className="review-text">&ldquo;{review.comment}&rdquo;</p>
                      <div className="review-footer">
                        <strong>{review.name}</strong>
                        <span>Customer</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section id="contact" className="asenga-contact-section">
              <div className="contact-grid-layout">
                <div>
                  <span className="section-label">CONTACT US</span>
                  <h2 className="main-heading">Reach Mabuyu Street Fast</h2>
                  <p className="contact-intro">
                    Call, WhatsApp, or request doorstep delivery across Juja, Thika,
                    Ruiru, Kahawa Sukari and KU.
                  </p>

                  <div className="contact-actions-block">
                    <a href={`tel:${ORDER_PHONE}`} className="contact-pill-card">
                      <div className="contact-pill-left">
                        <span className="icon-bubble call"><Phone size={19} /></span>
                        <span>
                          <strong className="pill-title">Call to Order</strong>
                          <small className="pill-sub">{ORDER_PHONE}</small>
                        </span>
                      </div>
                      <ChevronRight size={18} />
                    </a>

                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}`}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-pill-card"
                    >
                      <div className="contact-pill-left">
                        <span className="icon-bubble whatsapp"><MessageCircle size={19} /></span>
                        <span>
                          <strong className="pill-title">WhatsApp Us</strong>
                          <small className="pill-sub">0793 400 696 • Quick order enquiries</small>
                        </span>
                      </div>
                      <ChevronRight size={18} />
                    </a>

                    <a href={`mailto:${BUSINESS_EMAIL}`} className="contact-pill-card">
                      <div className="contact-pill-left">
                        <span className="icon-bubble email"><Package size={19} /></span>
                        <span>
                          <strong className="pill-title">Email</strong>
                          <small className="pill-sub">{BUSINESS_EMAIL}</small>
                        </span>
                      </div>
                      <ChevronRight size={18} />
                    </a>
                  </div>
                </div>

                <div className="location-card">
                  <div className="location-icon">
                    <MapPin size={24} />
                  </div>
                  <span className="section-label">PICKUP & DELIVERY</span>
                  <h3>Juja Gate C</h3>
                  <p>
                    Delivery support around Juja, Witeithie, Thika, Kimbo, Ruiru,
                    Kahawa Sukari, Kahawa Wendani, Roysambu, Kenyatta Road and KU.
                  </p>
                  <a
                    className="orange-submit-btn"
                    href="https://www.google.com/maps/search/?api=1&query=Juja%20Gate%20C"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get Directions
                    <MapPin size={17} />
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="site-footer" style={{ backgroundImage: `url(${popcornImg})` }}>
        <div className="footer-image-overlay" aria-hidden="true" />
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <div className="footer-brand">
                <img src={logoImg} alt="Mabuyu Street" className="footer-logo" />
                <strong>MABUYU STREET</strong>
              </div>
              <p className="footer-desc">
                Kenya-focused street confectioneries and snacks, including flavoured
                Mabuyu, Achari, Kashata, Popcorn, Labania and nuts.
              </p>
              {currentUser && (
                <p className="footer-desc footer-status-line">
                  Signed in as {currentUser.full_name || currentUser.email} • {tier.name} • {currentUser.loyalty_points || 0} points
                </p>
              )}
            </div>

            <div className="panel footer-col">
              <h4 className="footer-col-title">Quick Links</h4>
              <div className="footer-links-list">
                <button type="button" className="footer-link" onClick={goHome}>Home</button>
                <button type="button" className="footer-link" onClick={() => goToSection('packages')}>Event Packages</button>
                <button type="button" className="footer-link" onClick={() => goToSection('shop')}>Shop</button>
                <button type="button" className="footer-link" onClick={() => goToSection('loyalty')}>Rewards</button>
                <button type="button" className="footer-link" onClick={() => goToSection('reviews')}>Reviews</button>
                <button type="button" className="footer-link" onClick={() => goToSection('contact')}>Contact</button>
              </div>
            </div>

            <div className="panel footer-col">
              <h4 className="footer-col-title">Payments</h4>
              <p className="footer-desc">
                M-Pesa, Airtel Money, card and cash-on-delivery can be connected
                to the final checkout implementation.
              </p>
              <div className="payment-badges">
                <span>M-Pesa</span>
                <span>Airtel</span>
                <span>Card</span>
                <span>Cash</span>
              </div>
            </div>

            <div className="panel footer-col">
              <h4 className="footer-col-title">Contact Us</h4>
              <div className="footer-contact-info">
                <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>
                <a href={`tel:${ORDER_PHONE}`}>Call: {ORDER_PHONE}</a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
                  WhatsApp: 0793 400 696
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>© {new Date().getFullYear()} Mabuyu Street. All Rights Reserved.</span>
            <span>Juja • Kenya</span>
          </div>
        </div>
      </footer>

      <div className="mobile-bottom-nav">
        <button type="button" className={`mobile-nav-item ${view === 'shop' ? 'active' : ''}`} onClick={goHome}>
          <Home size={20} />
          <span>Home</span>
        </button>
        <button type="button" className="mobile-nav-item" onClick={() => goToSection('shop')}>
          <ShoppingBag size={20} />
          <span>Shop</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-item ${view === 'cart' ? 'active' : ''}`}
          onClick={() => setView(view === 'cart' ? 'shop' : 'cart')}
        >
          <span className="mobile-cart-badge-wrapper">
            <ShoppingCart size={20} />
            {cartQuantity > 0 && <span className="cart-count">{cartQuantity}</span>}
          </span>
          <span>Cart</span>
        </button>
        <button
          type="button"
          className={`mobile-nav-item ${view === 'account' ? 'active' : ''}`}
          onClick={() => (currentUser ? setView('account') : openAuthModal('signup'))}
        >
          <User size={20} />
          <span>Account</span>
        </button>
      </div>

      {showAuthModal && (
        <div className="auth-modal-overlay">
          <div
            className="admin-card auth-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <div className="flex items-center justify-between">
              <h3 id="auth-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                {authMode === 'login' ? 'Sign In to Mabuyu Street' : authMode === 'magic' ? 'Sign in with Magic Link' : 'Create Free Account'}
              </h3>
              <button type="button" onClick={closeAuthModal} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {authMode === 'signup' && (
              <div className="flex items-center gap-3" role="group" aria-label={`Sign up progress, step ${signupStepNumber} of 2`}>
                <div className="flex items-center gap-1.5 flex-1" aria-hidden="true">
                  <span className="h-1.5 flex-1 rounded-full bg-[#ffb703]" />
                  <span className={`h-1.5 flex-1 rounded-full ${authStep === 3 ? 'bg-[#ffb703]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">Step {signupStepNumber} of 2</span>
              </div>
            )}

            {authError && (
              <div role="alert" className="rounded-lg bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs px-3 py-2 font-semibold">
                {authError}
              </div>
            )}

            {authNotice && (
              <div role="status" className="rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs px-3 py-2 font-semibold">
                {authNotice}
              </div>
            )}

            <form onSubmit={handleAuthContinue} className="space-y-3" noValidate>
              {authMode === 'signup' && authStep === 1 && (
                <>
                  <div>
                    <label htmlFor="auth-name" className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Full Name</label>
                    <input
                      id="auth-name"
                      type="text"
                      value={authForm.name}
                      onChange={(e) => handleAuthFieldChange('name', e.target.value)}
                      onBlur={() => handleAuthBlur('name')}
                      placeholder="Your name"
                      autoComplete="name"
                      autoFocus
                      className={authInputClass(!!showAuthError('name'))}
                      aria-invalid={!!showAuthError('name')}
                      aria-describedby={showAuthError('name') ? 'auth-name-error' : undefined}
                      required
                    />
                    {showAuthError('name') && (
                      <p id="auth-name-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{showAuthError('name')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="auth-email" className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Email Address</label>
                    <input
                      id="auth-email"
                      type="email"
                      value={authForm.email}
                      onChange={(e) => handleAuthFieldChange('email', e.target.value)}
                      onBlur={() => handleAuthBlur('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={authInputClass(!!showAuthError('email'))}
                      aria-invalid={!!showAuthError('email')}
                      aria-describedby={showAuthError('email') ? 'auth-email-error' : undefined}
                      required
                    />
                    {showAuthError('email') && (
                      <p id="auth-email-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{showAuthError('email')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="auth-password" className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Password (min 8 chars)</label>
                    <input
                      id="auth-password"
                      type="password"
                      value={authForm.password}
                      onChange={(e) => handleAuthFieldChange('password', e.target.value)}
                      onBlur={() => handleAuthBlur('password')}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={authInputClass(!!showAuthError('password'))}
                      aria-invalid={!!showAuthError('password')}
                      aria-describedby={[showAuthError('password') ? 'auth-password-error' : null, 'auth-password-help'].filter(Boolean).join(' ')}
                      required
                    />
                    {showAuthError('password') && (
                      <p id="auth-password-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{showAuthError('password')}</p>
                    )}
                    <ul id="auth-password-help" className="mt-2 space-y-1" aria-label="Password requirements">
                      {getPasswordChecks(authForm.password).map((check) => (
                        <li
                          key={check.id}
                          className={`flex items-center gap-1.5 text-xs font-semibold ${check.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                          {check.met ? (
                            <Check size={12} aria-hidden="true" />
                          ) : (
                            <span className="inline-block w-3 text-center" aria-hidden="true">•</span>
                          )}
                          <span>{check.label}{check.required ? '' : ' (recommended)'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <label htmlFor="auth-phone" className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Phone Number (optional)</label>
                    <input
                      id="auth-phone"
                      type="tel"
                      value={authForm.phone}
                      onChange={(e) => handleAuthFieldChange('phone', e.target.value)}
                      onBlur={() => handleAuthBlur('phone')}
                      placeholder="07xx xxx xxx"
                      autoComplete="tel"
                      className={authInputClass(!!showAuthError('phone'))}
                      aria-invalid={!!showAuthError('phone')}
                      aria-describedby={showAuthError('phone') ? 'auth-phone-error' : undefined}
                    />
                    {showAuthError('phone') && (
                      <p id="auth-phone-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{showAuthError('phone')}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#ffb703] text-slate-950 font-bold py-2.5 rounded-lg text-sm hover:brightness-95 transition mt-2 shadow"
                  >
                    {authLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                  <div className="flex items-center justify-between pt-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <span>Already have an account?</span>
                    <button type="button" onClick={() => openAuthModal('login')} className="text-amber-600 dark:text-[#ffb703] font-bold hover:underline">
                      Sign in
                    </button>
                  </div>
                </>
              )}

              {authMode === 'signup' && authStep === 3 && (
                <div className="space-y-3 text-center py-2">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Account created successfully!</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">You can now sign in with your email and password.</p>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="w-full bg-[#ffb703] text-slate-950 font-bold py-2.5 rounded-lg text-sm hover:brightness-95 transition mt-3 shadow"
                  >
                    Sign In Now
                  </button>
                </div>
              )}

              {authMode === 'login' && (
                <>
                  <div>
                    <label htmlFor="auth-email-login" className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Email Address</label>
                    <input
                      id="auth-email-login"
                      type="email"
                      value={authForm.email}
                      onChange={(e) => handleAuthFieldChange('email', e.target.value)}
                      onBlur={() => handleAuthBlur('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      className={authInputClass(!!showAuthError('email'))}
                      aria-invalid={!!showAuthError('email')}
                      required
                    />
                    {showAuthError('email') && (
                      <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{showAuthError('email')}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="auth-password-login" className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Password</label>
                    <input
                      id="auth-password-login"
                      type="password"
                      value={authForm.password}
                      onChange={(e) => handleAuthFieldChange('password', e.target.value)}
                      onBlur={() => handleAuthBlur('password')}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={authInputClass(!!showAuthError('password'))}
                      aria-invalid={!!showAuthError('password')}
                      required
                    />
                    {showAuthError('password') && (
                      <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{showAuthError('password')}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#ffb703] text-slate-950 font-bold py-2.5 rounded-lg text-sm hover:brightness-95 transition mt-2 shadow"
                  >
                    {authLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <div className="flex items-center justify-between pt-2 text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <button type="button" onClick={() => openAuthModal('magic')} className="text-amber-600 dark:text-[#ffb703] hover:underline font-bold">
                      Use Magic Link
                    </button>
                    <button type="button" onClick={() => openAuthModal('signup')} className="text-slate-700 dark:text-slate-300 font-semibold hover:underline">
                      Create account
                    </button>
                  </div>
                </>
              )}

              {authMode === 'magic' && (
                <>
                  <div>
                    <label htmlFor="auth-email-magic" className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Email Address</label>
                    <input
                      id="auth-email-magic"
                      type="email"
                      value={authForm.email}
                      onChange={(e) => handleAuthFieldChange('email', e.target.value)}
                      onBlur={() => handleAuthBlur('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      className={authInputClass(!!showAuthError('email'))}
                      aria-invalid={!!showAuthError('email')}
                      required
                    />
                    {showAuthError('email') && (
                      <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-semibold">{showAuthError('email')}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-[#ffb703] text-slate-950 font-bold py-2.5 rounded-lg text-sm hover:brightness-95 transition mt-2 shadow"
                  >
                    {authLoading ? 'Sending...' : 'Send Magic Link'}
                  </button>
                  <div className="text-center pt-2">
                    <button type="button" onClick={() => openAuthModal('login')} className="text-xs text-amber-600 dark:text-[#ffb703] hover:underline font-bold">
                      Back to password sign in
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="auth-modal-overlay">
          <div className="admin-card review-modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Leave a Review</h3>
              <button type="button" onClick={() => setShowReviewModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-3">
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Your Name</span>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="Your name"
                  className="admin-input w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#ffb703]"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Rating (1 to 5 stars)</span>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="admin-input w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#ffb703]"
                >
                  <option value={5}>5 — Excellent</option>
                  <option value={4}>4 — Very Good</option>
                  <option value={3}>3 — Good</option>
                  <option value={2}>2 — Fair</option>
                  <option value={1}>1 — Poor</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200 font-bold block mb-1">Comment</span>
                <textarea
                  rows="3"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Tell us what you loved about Mabuyu Street..."
                  className="admin-input w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#ffb703]"
                  required
                />
              </label>

              <button
                type="submit"
                className="w-full bg-[#ffb703] text-slate-950 font-bold py-2.5 rounded-lg text-sm hover:brightness-95 transition mt-2 shadow"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}