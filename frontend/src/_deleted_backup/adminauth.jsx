import React, { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';

import './App.css';

import logoImg from './assets/Gemini_Generated_Image_wt6ac1wt6ac1wt6a.jpeg';
import achariImg from './assets/achari.jpeg';
import datesImg from './assets/dates.jpeg';
import heroImg from './assets/hero.png';
import imagePng from './assets/image.png';
import kashataImg from './assets/kashata.jpeg';
import labaniaImg from './assets/labania.jpeg';
import mabuyuImg from './assets/mabuyu.jpeg';
import njuguMrabaImg from './assets/njugu mraba.jpeg';
import njuguImg from './assets/njugu.jpeg';
import popcornImg from './assets/popcorn.jpeg';

const WHATSAPP_NUMBER = '254793400696';
const ORDER_PHONE = '0741521578';
const BUSINESS_EMAIL = 'mabuyustreet@gmail.com';
const ACCOUNT_STORAGE_KEY = 'mabuyuStreetAccount';

const CATEGORIES = [
  'All Products',
  'Mabuyu',
  'Achari',
  'Dates',
  'Kashata & Labania',
  'Popcorn & Nuts',
  'Ready Combo Packages',
];

const EVENT_TYPES = [
  { id: 'birthday', label: 'Birthday Party' },
  { id: 'movie', label: 'Movie Night' },
  { id: 'hangout', label: 'Friends Hangout' },
  { id: 'picnic', label: 'Picnic Package' },
  { id: 'corporate', label: 'Office / Corporate' },
  { id: 'custom', label: 'Custom Event' },
];

// Ready-made starting bundles per event type, used by the "Use suggested
// bundle" shortcut in the package builder. Keys map to PRODUCTS ids below.
const EVENT_PRESETS = {
  birthday: { '1': 4, '7': 3, '8': 2 },
  movie: { '8': 4, '9': 2 },
  hangout: { '6': 3, '2': 2 },
  picnic: { '11': 3, '12': 2, '3': 2 },
  corporate: { '11': 4, '10': 2 },
  custom: {},
};

const PRODUCTS = [
  {
    id: '1',
    name: 'Flavoured Mabuyu Vinto',
    category: 'Mabuyu',
    description: 'Sweet, tangy and flavorful coated baobab seeds.',
    price: 60,
    badge: 'Bestseller',
    image: heroImg,
  },
  {
    id: '2',
    name: 'Flavoured Mabuyu Blueberry',
    category: 'Mabuyu',
    description: 'Rich blueberry flavour with the classic Mabuyu crunch.',
    price: 60,
    image: mabuyuImg,
  },
  {
    id: '3',
    name: 'Flavoured Mabuyu Strawberry',
    category: 'Mabuyu',
    description: 'Sweet strawberry-coated Mabuyu for a bright fruity taste.',
    price: 60,
    badge: 'Popular',
    image: mabuyuImg,
  },
  {
    id: '4',
    name: 'Flavoured Mabuyu Lemon',
    category: 'Mabuyu',
    description: 'Fresh citrus flavour with a tangy street-snack finish.',
    price: 60,
    image: mabuyuImg,
  },
  {
    id: '5',
    name: 'Flavoured Mabuyu Pineapple',
    category: 'Mabuyu',
    description: 'Tropical pineapple flavour with a sweet-tangy coating.',
    price: 60,
    image: mabuyuImg,
  },
  {
    id: '6',
    name: 'Spicy Tangy Achari',
    category: 'Achari',
    description: 'Bold, spicy and tangy achari made for snack lovers.',
    price: 70,
    badge: 'Hot Seller',
    image: achariImg,
  },
  {
    id: '7',
    name: 'Crunchy Coconut Kashata',
    category: 'Kashata & Labania',
    description: 'Traditional crunchy coconut confectionery.',
    price: 30,
    image: kashataImg,
  },
  {
    id: '8',
    name: 'Fresh Salted Popcorn',
    category: 'Popcorn & Nuts',
    description: 'Freshly prepared salted popcorn for movie nights and hangouts.',
    price: 60,
    image: popcornImg,
  },
  {
    id: '9',
    name: 'Njugu Mraba Pack',
    category: 'Popcorn & Nuts',
    description: 'Crunchy Kenyan-style coated peanut snack.',
    price: 130,
    badge: 'Value Pack',
    image: njuguMrabaImg,
  },
  {
    id: '10',
    name: 'Rich Swahili Labania Pack',
    category: 'Kashata & Labania',
    description: 'Rich traditional Swahili-style confectionery.',
    price: 130,
    badge: 'Delicacy',
    image: labaniaImg,
  },
  {
    id: '11',
    name: 'Premium Dates Pack',
    category: 'Dates',
    description: 'Naturally sweet dates for everyday snacking and gifting.',
    price: 150,
    badge: 'Healthy Choice',
    image: datesImg,
  },
  {
    id: '12',
    name: 'Classic Njugu Pack',
    category: 'Popcorn & Nuts',
    description: 'Crunchy roasted peanuts for a simple everyday snack.',
    price: 130,
    image: njuguImg,
  },
  {
    id: '13',
    name: 'Mabuyu Street Combo',
    category: 'Ready Combo Packages',
    description: 'A ready mix of customer favourites for sharing.',
    price: 250,
    badge: 'Combo',
    image: imagePng,
  },
];

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
    text: 'Order online, use WhatsApp checkout, arrange pickup or request delivery around our service areas.',
  },
];

const INITIAL_REVIEWS = [
  {
    id: 'review-1',
    name: 'Kevin M.',
    rating: 5,
    comment: 'Best flavoured Mabuyu in Juja! Delivery was under 20 mins.',
    verified: true,
  },
  {
    id: 'review-2',
    name: 'Amina K.',
    rating: 5,
    comment: 'Ordered the Movie Night package and got a 10% discount automatically.',
    verified: true,
  },
  {
    id: 'review-3',
    name: 'Brian N.',
    rating: 4,
    comment: 'Spicy Tangy Achari is top tier. Highly recommend Mabuyu Street.',
    verified: true,
  },
];

// Mabuyu Rewards loyalty tiers, keyed by lifetime points earned (not the
// spendable balance, so redeeming points never knocks someone back a tier).
const LOYALTY_TIERS = [
  {
    id: 'taster',
    name: 'Street Taster',
    threshold: 0,
    perk: 'Earn 1 point for every KSh 20 you spend.',
  },
  {
    id: 'fan',
    name: 'Flavour Fan',
    threshold: 500,
    perk: '5% off every custom event package, applied automatically.',
  },
  {
    id: 'vip',
    name: 'Mabuyu VIP',
    threshold: 1500,
    perk: 'Free delivery on every order, plus first access to new flavours.',
  },
];

// Delivery fee zones. Replace/extend this list any time the coverage area
// or pricing changes — everything downstream (checkout UI, WhatsApp order
// text, totals) reads from here automatically.
const DELIVERY_OPTIONS = [
  { id: 'pickup', label: 'Pickup', fee: 0, note: 'Collect at Juja Gate C' },
  { id: 'juja', label: 'Juja', fee: 0, note: 'Free delivery within Juja' },
  { id: 'kenyatta_road', label: 'Kenyatta Road', fee: 40, note: 'Kenyatta Road area' },
  { id: 'witeithie', label: 'Witeithie', fee: 50, note: 'Witeithie area' },
  { id: 'thika', label: 'Thika', fee: 60, note: 'Thika town & surrounding' },
  { id: 'toll_kimbo', label: 'Toll / Kimbo', fee: 60, note: 'Toll Station & Kimbo' },
  {
    id: 'thika_road_corridor',
    label: 'Ruiru, Bypass, KU, Kahawa Sukari, Kahawa Wendani, Githurai',
    fee: 90,
    note: 'Thika Road corridor',
  },
  { id: 'roysambu_cbd', label: 'Roysambu to CBD', fee: 120, note: 'Any point along this route' },
];

const POINTS_PER_KSH = 20; // 1 Mabuyu Rewards point earned per KSh 20 spent
const POINTS_REDEMPTION = { points: 100, value: 50 }; // 100 points = KSh 50 off

function formatMoney(value) {
  return `KSh ${Number(value || 0).toLocaleString()}`;
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getTier(lifetimePoints) {
  let current = LOYALTY_TIERS[0];
  for (const tier of LOYALTY_TIERS) {
    if (lifetimePoints >= tier.threshold) current = tier;
  }
  return current;
}

function getNextTier(lifetimePoints) {
  return LOYALTY_TIERS.find((tier) => tier.threshold > lifetimePoints) || null;
}

function loadAccount() {
  try {
    const raw = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistAccount(account) {
  try {
    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  } catch {
    // Local storage unavailable in this browser; the session still works,
    // it just will not be remembered on the next visit.
  }
}

function createAccount({ name, email, password, phone, location }) {
  return {
    name,
    email,
    password,
    phone: phone || '',
    location: location || '',
    points: 0,
    lifetimePoints: 0,
    referralCode: `MABUYU-${Math.floor(1000 + Math.random() * 9000)}`,
    joinedAt: new Date().toISOString(),
    orders: [],
    savedBundles: [],
  };
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState([]);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  const [selectedEventType, setSelectedEventType] = useState('birthday');
  const [packageItems, setPackageItems] = useState({ '1': 3, '6': 2, '8': 2 });

  const [inputReferralCode, setInputReferralCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [referralSuccess, setReferralSuccess] = useState(false);

  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  // view controls which page is shown in <main>: shop | cart | checkout | account | confirmation
  const [view, setView] = useState('shop');

  const [currentUser, setCurrentUser] = useState(() => loadAccount());

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [authStep, setAuthStep] = useState(1);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [authError, setAuthError] = useState('');

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
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
      });
      setCheckoutForm((form) => ({
        ...form,
        name: form.name || currentUser.name || '',
        email: form.email || currentUser.email || '',
        phone: form.phone || currentUser.phone || '',
        location: form.location || currentUser.location || '',
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

    return PRODUCTS.filter((product) => {
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
  }, [selectedCategory, search]);

  const packageItemCount = useMemo(
    () => Object.values(packageItems).reduce((sum, quantity) => sum + quantity, 0),
    [packageItems]
  );

  const rawPackagePrice = useMemo(
    () =>
      Object.entries(packageItems).reduce((total, [productId, quantity]) => {
        const product = PRODUCTS.find((item) => item.id === productId);
        return total + (product ? product.price * quantity : 0);
      }, 0),
    [packageItems]
  );

  const packageDiscountPercent = useMemo(() => {
    if (packageItemCount >= 8) return 15;
    if (packageItemCount >= 5) return 10;
    if (packageItemCount >= 3) return 5;
    return 0;
  }, [packageItemCount]);

  const finalPackagePrice = Math.round(
    rawPackagePrice * (1 - packageDiscountPercent / 100)
  );

  const nextPackageThreshold =
    packageItemCount >= 8 ? null : packageItemCount >= 5 ? 8 : packageItemCount >= 3 ? 5 : 3;
  const nextPackagePercent =
    nextPackageThreshold === 8 ? 15 : nextPackageThreshold === 5 ? 10 : 5;

  const tier = getTier(currentUser?.lifetimePoints || 0);
  const nextTier = getNextTier(currentUser?.lifetimePoints || 0);
  const tierProgressPercent = nextTier
    ? Math.min(100, Math.round(((currentUser?.lifetimePoints || 0) / nextTier.threshold) * 100))
    : 100;

  const deliveryOption = DELIVERY_OPTIONS.find((option) => option.id === selectedDelivery) || DELIVERY_OPTIONS[0];
  const deliveryFee = deliveryOption.fee;
  const canRedeemPoints = !!currentUser && currentUser.points >= POINTS_REDEMPTION.points;
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
      const product = PRODUCTS.find((item) => item.id === productId);

      if (!product) return;

      for (let index = 0; index < quantity; index += 1) {
        addToCart(product);
      }
    });

    setView('cart');
  };

  const applyEventPreset = () => {
    const preset = EVENT_PRESETS[selectedEventType];

    if (!preset || Object.keys(preset).length === 0) {
      window.alert('Pick a specific event type above to load a ready-made bundle, or build your own below.');
      return;
    }

    setPackageItems(preset);
  };

  const handleSaveBundle = () => {
    if (!currentUser) {
      window.alert('Create a free Mabuyu Rewards account to save this bundle for next time.');
      return;
    }

    if (packageItemCount === 0) {
      window.alert('Add at least one item before saving a bundle.');
      return;
    }

    const defaultName = EVENT_TYPES.find((event) => event.id === selectedEventType)?.label || 'My Bundle';
    const name = window.prompt('Name this bundle so you can reorder it later:', defaultName);

    if (!name || !name.trim()) return;

    const bundle = {
      id: `bundle-${Date.now()}`,
      name: name.trim(),
      eventType: selectedEventType,
      items: { ...packageItems },
      createdAt: new Date().toISOString(),
    };

    const updated = { ...currentUser, savedBundles: [bundle, ...(currentUser.savedBundles || [])] };
    persistAccount(updated);
    setCurrentUser(updated);
  };

  const handleLoadBundle = (bundle) => {
    setSelectedEventType(bundle.eventType);
    setPackageItems(bundle.items);
    setView('shop');
    window.setTimeout(() => scrollToId('packages'), 0);
  };

  const handleDeleteBundle = (bundleId) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      savedBundles: (currentUser.savedBundles || []).filter((bundle) => bundle.id !== bundleId),
    };
    persistAccount(updated);
    setCurrentUser(updated);
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

  const handleAddReview = (event) => {
    event.preventDefault();

    if (!newReview.name.trim() || !newReview.comment.trim()) {
      window.alert('Please fill in your name and review.');
      return;
    }

    setReviews((current) => [
      {
        id: `review-${Date.now()}`,
        name: newReview.name.trim(),
        rating: Number(newReview.rating),
        comment: newReview.comment.trim(),
        verified: true,
      },
      ...current,
    ]);

    setNewReview({ name: '', rating: 5, comment: '' });
    setShowReviewModal(false);
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
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthStep(1);
    setAuthMode('signup');
    setAuthForm({ name: '', email: '', password: '', phone: '', location: '' });
    setAuthError('');
  };

  const handleAuthFieldChange = (field, value) => {
    setAuthForm((form) => ({ ...form, [field]: value }));
  };

  const handleAuthContinue = (event) => {
    event.preventDefault();
    setAuthError('');

    if (authMode === 'login') {
      if (!authForm.email.trim() || !authForm.password) {
        setAuthError('Enter your email and password.');
        return;
      }

      const stored = loadAccount();

      if (
        !stored ||
        stored.email.toLowerCase() !== authForm.email.trim().toLowerCase() ||
        stored.password !== authForm.password
      ) {
        setAuthError('We could not find a matching account on this device. Try creating one instead.');
        return;
      }

      setCurrentUser(stored);
      closeAuthModal();
      return;
    }

    // Sign-up flow, three short steps.
    if (authStep === 1) {
      if (!authForm.name.trim() || !authForm.email.trim() || authForm.password.length < 8) {
        setAuthError('Fill in your name, email, and a password with at least 8 characters.');
        return;
      }

      setAuthStep(2);
      return;
    }

    if (authStep === 2) {
      const account = createAccount({
        name: authForm.name.trim(),
        email: authForm.email.trim(),
        password: authForm.password,
        phone: authForm.phone.trim(),
        location: authForm.location.trim(),
      });

      persistAccount(account);
      setCurrentUser(account);
      setAuthStep(3);
      return;
    }

    closeAuthModal();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('shop');
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();
    if (!currentUser) return;

    const updated = {
      ...currentUser,
      name: profileForm.name.trim() || currentUser.name,
      email: profileForm.email.trim() || currentUser.email,
      phone: profileForm.phone.trim(),
    };

    persistAccount(updated);
    setCurrentUser(updated);
  };

  const handleCheckoutFieldChange = (field, value) => {
    setCheckoutForm((form) => ({ ...form, [field]: value }));
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();

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

    const lines = [
      '*NEW ORDER - MABUYU STREET*',
      `Order Ref: ${orderId}`,
      '------------------------',
      ...cart.map(
        (item) => `• ${item.name} x${item.qty} = ${formatMoney(item.price * item.qty)}`
      ),
    ];

    if (appliedDiscount > 0) {
      lines.push(`• Referral Discount = -${formatMoney(appliedDiscount)}`);
    }

    if (pointsDiscount > 0) {
      lines.push(`• Rewards Points Redeemed = -${formatMoney(pointsDiscount)}`);
    }

    lines.push(`• ${deliveryOption.label} = ${deliveryFee > 0 ? formatMoney(deliveryFee) : 'Free'}`);
    lines.push(
      '------------------------',
      `*Total: ${formatMoney(checkoutTotal)}*`,
      `Customer: ${checkoutForm.name}`,
      `Phone: ${checkoutForm.phone}`
    );

    if (selectedDelivery !== 'pickup') {
      lines.push(`Delivery Location: ${checkoutForm.location}`);
    }

    if (checkoutForm.notes.trim()) {
      lines.push(`Notes: ${checkoutForm.notes.trim()}`);
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    const orderRecord = {
      id: orderId,
      date: new Date().toISOString(),
      items: cart.map((item) => ({ name: item.name, qty: item.qty, price: item.price })),
      deliveryMethod: deliveryOption.label,
      deliveryFee,
      discount: appliedDiscount + pointsDiscount,
      total: checkoutTotal,
      pointsEarned: currentUser ? pointsToEarn : 0,
    };

    if (currentUser) {
      const updated = {
        ...currentUser,
        points:
          currentUser.points - (pointsDiscount > 0 ? POINTS_REDEMPTION.points : 0) + pointsToEarn,
        lifetimePoints: (currentUser.lifetimePoints || 0) + pointsToEarn,
        orders: [orderRecord, ...(currentUser.orders || [])],
      };

      persistAccount(updated);
      setCurrentUser(updated);
    }

    setLastOrder(orderRecord);
    setCart([]);
    setAppliedDiscount(0);
    setReferralSuccess(false);
    setRedeemPoints(false);
    setView('confirmation');
  };

  return (
    <div className="app-container">
      <header className="header-nav">
        <div className="container nav-wrapper">
          <button type="button" className="brand-logo" onClick={goHome} aria-label="Go to Mabuyu Street home">
            <img src={logoImg} alt="Mabuyu Street" className="logo-badge" />
            <span className="brand-name">Mabuyu Street</span>
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
                <span className="avatar-initial">{currentUser.name.trim().charAt(0).toUpperCase()}</span>
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
                <>Signed in as {currentUser.name} • {currentUser.points} Mabuyu Rewards points</>
              ) : (
                <>
                  Sign in to track your orders and earn reward points.{' '}
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

                  {currentUser && (
                    <div className="points-earn-note">
                      <Sparkles size={14} />
                      <span>You will earn {pointsToEarn} Mabuyu Rewards points on this order.</span>
                    </div>
                  )}
                </div>

                <form className="checkout-form-panel" onSubmit={handlePlaceOrder}>
                  <h3 className="panel-heading">Your details</h3>

                  <label className="form-group">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={checkoutForm.name}
                      onChange={(event) => handleCheckoutFieldChange('name', event.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </label>

                  <div className="form-row-2">
                    <label className="form-group">
                      <span>Phone number</span>
                      <input
                        type="tel"
                        value={checkoutForm.phone}
                        onChange={(event) => handleCheckoutFieldChange('phone', event.target.value)}
                        placeholder="07xx xxx xxx"
                        required
                      />
                    </label>
                    <label className="form-group">
                      <span>Email (optional)</span>
                      <input
                        type="email"
                        value={checkoutForm.email}
                        onChange={(event) => handleCheckoutFieldChange('email', event.target.value)}
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>

                  <h3 className="panel-heading">Choose delivery</h3>
                  <div className="delivery-options-grid">
                    {DELIVERY_OPTIONS.map((option) => (
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
                        (balance: {currentUser.points} points)
                      </span>
                    </label>
                  )}

                  {!currentUser && (
                    <div className="guest-checkout-note">
                      <Award size={15} />
                      <span>
                        Sign in to earn Mabuyu Rewards points on this order.{' '}
                        <button type="button" className="inline-link-btn" onClick={() => openAuthModal('signup')}>
                          Create a free account
                        </button>
                      </span>
                    </div>
                  )}

                  <button type="submit" className="btn-black-checkout">
                    Send Order via WhatsApp
                    <MessageCircle size={18} />
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
                <h1 className="account-title">{currentUser.name}</h1>
                <p className="account-sub">
                  Member since{' '}
                  {new Date(currentUser.joinedAt).toLocaleDateString('en-KE', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="account-grid">
              <div className="account-main-col">
                <div className="account-card">
                  <h3 className="panel-heading">Profile details</h3>
                  <form className="profile-form" onSubmit={handleSaveProfile}>
                    <div className="form-row-2">
                      <label className="form-group">
                        <span>Name</span>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(event) => setProfileForm((form) => ({ ...form, name: event.target.value }))}
                        />
                      </label>
                      <label className="form-group">
                        <span>Email</span>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(event) => setProfileForm((form) => ({ ...form, email: event.target.value }))}
                        />
                      </label>
                    </div>
                    <label className="form-group">
                      <span>Phone</span>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(event) => setProfileForm((form) => ({ ...form, phone: event.target.value }))}
                        placeholder="07xx xxx xxx"
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
                  <h3 className="panel-heading">Order history</h3>
                  {currentUser.orders.length === 0 ? (
                    <p className="empty-cart-sub">No orders yet. Your Mabuyu Street orders will show up here.</p>
                  ) : (
                    <div className="order-history-list">
                      {currentUser.orders.map((order) => (
                        <div className="order-history-row" key={order.id}>
                          <div>
                            <strong>{order.id}</strong>
                            <span className="muted-text"> • {new Date(order.date).toLocaleDateString()}</span>
                            <div className="order-history-items">
                              {order.items.map((item) => `${item.name} x${item.qty}`).join(', ')}
                            </div>
                          </div>
                          <div className="order-history-total">
                            <strong>{formatMoney(order.total)}</strong>
                            {order.pointsEarned > 0 && (
                              <span className="order-points-tag">
                                <Sparkles size={12} /> +{order.pointsEarned}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {currentUser.savedBundles?.length > 0 && (
                  <div className="account-card">
                    <h3 className="panel-heading">Saved event bundles</h3>
                    <div className="saved-bundles-list">
                      {currentUser.savedBundles.map((bundle) => (
                        <div className="saved-bundle-chip" key={bundle.id}>
                          <div>
                            <strong>{bundle.name}</strong>
                            <span className="muted-text">
                              {' '}
                              • {Object.values(bundle.items).reduce((a, b) => a + b, 0)} items
                            </span>
                          </div>
                          <div className="saved-bundle-actions">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleLoadBundle(bundle)}
                              title="Reorder this bundle"
                              aria-label="Reorder this bundle"
                            >
                              <Repeat size={14} />
                            </button>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => handleDeleteBundle(bundle.id)}
                              title="Remove bundle"
                              aria-label="Remove bundle"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <aside className="account-side-col">
                <div className="loyalty-tier-card">
                  <span className="feature-icon"><Award size={18} /></span>
                  <h3>{tier.name}</h3>
                  <p className="tier-perk-text">{tier.perk}</p>
                  <div className="points-balance-line">
                    <Wallet size={16} />
                    <span>{currentUser.points} points available</span>
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

                <div className="referral-mini-card">
                  <span className="referral-kicker dark-kicker">
                    <Gift size={15} /> YOUR REFERRAL CODE
                  </span>
                  <div className="code-box light-code-box">
                    <strong>{currentUser.referralCode}</strong>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={() => copyReferralCode(currentUser.referralCode)}
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                  <p className="tier-perk-text">Share this code. Friends get KSh 50 off their first order.</p>
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === 'confirmation' && lastOrder && (
          <section className="confirmation-page-wrapper">
            <div className="confirmation-card">
              <span className="confirmation-icon"><CheckCircle2 size={40} /></span>
              <span className="section-label">ORDER SENT</span>
              <h1 className="main-heading">
                Thanks{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="confirmation-sub">
                Your order <strong>{lastOrder.id}</strong> for {formatMoney(lastOrder.total)} has been sent to
                Mabuyu Street on WhatsApp. Reply there to confirm your delivery time.
              </p>

              {currentUser && lastOrder.pointsEarned > 0 && (
                <div className="points-earned-banner">
                  <Sparkles size={16} />
                  <span>
                    +{lastOrder.pointsEarned} points added. New balance: {currentUser.points} points.
                  </span>
                </div>
              )}

              {!currentUser && (
                <div className="guest-checkout-note centered">
                  <Award size={15} />
                  <span>
                    Create a free account next time to start earning Mabuyu Rewards points on every order.
                  </span>
                </div>
              )}

              <div className="confirmation-actions">
                <button type="button" className="hero-btn" onClick={() => setView('shop')}>
                  Continue Shopping
                </button>
                {currentUser && (
                  <button type="button" className="btn-outline" onClick={() => setView('account')}>
                    View My Account
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {view === 'shop' && (
          <>
            <section className="hero-layout">
              <aside className="side-categories" aria-label="Product categories">
                <div className="cat-header">Categories</div>
                {CATEGORIES.map((category) => (
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
                  <span>Juja, Thika & Ruiru</span>
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
                {filteredProducts.length === 0 ? (
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
                    <article className="asenga-card" key={product.id}>
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
                    Up to 15% automatic package discount
                  </span>
                </div>

                <p className="sub-text">
                  Planning a birthday, movie night, hangout, picnic or corporate event?
                  Choose products and get automatic tier discounts, or start from a ready-made bundle.
                </p>

                <div className="event-pills-row">
                  {EVENT_TYPES.map((eventType) => (
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
                  {PRODUCTS.map((product) => {
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
                      style={{ width: `${Math.min(100, (packageItemCount / 8) * 100)}%` }}
                    />
                  </div>
                  <span className="tier-progress-note">
                    {nextPackageThreshold
                      ? `Add ${nextPackageThreshold - packageItemCount} more item${
                          nextPackageThreshold - packageItemCount === 1 ? '' : 's'
                        } to unlock ${nextPackagePercent}% off.`
                      : 'Maximum 15% package discount unlocked.'}
                  </span>
                </div>

                <div className="package-summary-bar">
                  <div>
                    <span className="summary-caption">
                      {selectedEventType.toUpperCase()} • {packageItemCount} items
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
                {LOYALTY_TIERS.map((loyaltyTier) => (
                  <div
                    key={loyaltyTier.id}
                    className={`loyalty-tier-tile ${currentUser && tier.id === loyaltyTier.id ? 'current' : ''}`}
                  >
                    <span className="feature-icon"><Award size={18} /></span>
                    <h4>{loyaltyTier.name}</h4>
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

              <div className="referral-card">
                <div className="referral-copy">
                  <span className="referral-kicker">
                    <Gift size={17} />
                    MABUYU REWARDS
                  </span>
                  <h2>{currentUser ? `You're a ${tier.name}` : 'Earn While You Snack'}</h2>
                  <p>
                    {currentUser
                      ? tier.perk
                      : 'Create a free account to start earning 1 point for every KSh 20 you spend, plus automatic discounts as you climb tiers.'}
                  </p>

                  {currentUser ? (
                    <div className="code-box">
                      <strong>{currentUser.referralCode}</strong>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => copyReferralCode(currentUser.referralCode)}
                      >
                        <Copy size={14} />
                        Copy Code
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="hero-btn" onClick={() => openAuthModal('signup')}>
                      Join Mabuyu Rewards
                    </button>
                  )}
                </div>

                <div className="referral-actions">
                  <div className="points-display">
                    <Wallet className="gift-icon" size={24} />
                    <div className="points-amount">{currentUser ? currentUser.points : 0}</div>
                    <div className="points-label">Points Balance</div>
                  </div>

                  <div className="referral-input-card">
                    <strong>Have a friend's referral code?</strong>
                    <span>Enter it below to claim your discount.</span>
                    <div className="ref-input-group">
                      <input
                        type="text"
                        value={inputReferralCode}
                        onChange={(event) => setInputReferralCode(event.target.value)}
                        placeholder="e.g. FRIEND50"
                      />
                      <button type="button" className="btn-add-cart compact" onClick={handleApplyReferral}>
                        Apply
                      </button>
                    </div>

                    {referralSuccess && (
                      <div className="success-inline">
                        <Check size={14} />
                        KSh 50 referral discount unlocked.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {currentUser && currentUser.savedBundles?.length > 0 && (
                <div className="saved-bundles-row">
                  <span className="package-discount-note">Quick reorder:</span>
                  {currentUser.savedBundles.map((bundle) => (
                    <button
                      type="button"
                      key={bundle.id}
                      className="event-pill"
                      onClick={() => handleLoadBundle(bundle)}
                    >
                      <Repeat size={13} /> {bundle.name}
                    </button>
                  ))}
                </div>
              )}
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
                {reviews.map((review) => (
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
                ))}
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
                <strong>Mabuyu Street</strong>
              </div>
              <p className="footer-desc">
                Kenya-focused street confectioneries and snacks, including flavoured
                Mabuyu, Achari, Kashata, Popcorn, Labania and nuts.
              </p>
              {currentUser && (
                <p className="footer-desc footer-status-line">
                  Signed in as {currentUser.name} • {tier.name} • {currentUser.points} points
                </p>
              )}
            </div>

            <div className="footer-col">
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

            <div className="footer-col">
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

            <div className="footer-col">
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
            <span>Juja Gate C • Kenya</span>
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

      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-card review-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="close-modal" onClick={() => setShowReviewModal(false)} aria-label="Close review form">
              <X size={19} />
            </button>

            <div className="modal-heading">
              <span className="feature-icon"><Star size={18} /></span>
              <div>
                <span className="section-label">CUSTOMER FEEDBACK</span>
                <h3>Leave a Customer Review</h3>
              </div>
            </div>

            <form onSubmit={handleAddReview} className="review-form">
              <label className="form-group">
                <span>Your Name</span>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(event) => setNewReview({ ...newReview, name: event.target.value })}
                  placeholder="e.g. Sarah M."
                />
              </label>

              <label className="form-group">
                <span>Rating</span>
                <select
                  value={newReview.rating}
                  onChange={(event) => setNewReview({ ...newReview, rating: Number(event.target.value) })}
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </label>

              <label className="form-group">
                <span>Review / Comment</span>
                <textarea
                  rows="4"
                  value={newReview.comment}
                  onChange={(event) => setNewReview({ ...newReview, comment: event.target.value })}
                  placeholder="Tell us about your experience..."
                />
              </label>

              <button type="submit" className="orange-submit-btn">
                Submit Review
                <Check size={17} />
              </button>
            </form>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="modal-overlay" onClick={closeAuthModal}>
          <div className="modal-card auth-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="close-modal" onClick={closeAuthModal} aria-label="Close account form">
              <X size={19} />
            </button>

            {authMode === 'signup' && (
              <div className="auth-progress-dots">
                <span className={`auth-dot ${authStep >= 1 ? 'filled' : ''}`} />
                <span className={`auth-dot ${authStep >= 2 ? 'filled' : ''}`} />
                <span className={`auth-dot ${authStep >= 3 ? 'filled' : ''}`} />
              </div>
            )}

            {authMode === 'login' && (
              <>
                <div className="auth-modal-header">
                  <img src={logoImg} alt="Mabuyu Street" className="auth-logo" />
                  <div>
                    <span className="section-label">WELCOME BACK</span>
                    <h3>Sign in</h3>
                    <p>Access your Mabuyu Rewards balance and order history.</p>
                  </div>
                </div>

                <form onSubmit={handleAuthContinue}>
                  <label className="form-group">
                    <span>Email</span>
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(event) => handleAuthFieldChange('email', event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </label>
                  <label className="form-group">
                    <span>Password</span>
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(event) => handleAuthFieldChange('password', event.target.value)}
                      placeholder="Your password"
                      autoComplete="current-password"
                    />
                  </label>

                  {authError && <p className="auth-error-text">{authError}</p>}

                  <button type="submit" className="login-submit-btn">
                    Sign in
                    <ArrowRight size={17} />
                  </button>
                </form>

                <p className="auth-switch-text">
                  New here?{' '}
                  <button type="button" className="inline-link-btn" onClick={() => openAuthModal('signup')}>
                    Create an account
                  </button>
                </p>
              </>
            )}

            {authMode === 'signup' && authStep === 1 && (
              <>
                <div className="modal-heading">
                  <span className="feature-icon"><User size={18} /></span>
                  <div>
                    <span className="section-label">JOIN MABUYU REWARDS</span>
                    <h3>Create your account</h3>
                  </div>
                </div>

                <form onSubmit={handleAuthContinue}>
                  <label className="form-group">
                    <span>Full name</span>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(event) => handleAuthFieldChange('name', event.target.value)}
                      placeholder="e.g. Aisha Njeri"
                    />
                  </label>
                  <label className="form-group">
                    <span>Email</span>
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(event) => handleAuthFieldChange('email', event.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="form-group">
                    <span>Password</span>
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(event) => handleAuthFieldChange('password', event.target.value)}
                      placeholder="At least 8 characters"
                    />
                    <span className="field-hint">At least 8 characters</span>
                  </label>

                  {authError && <p className="auth-error-text">{authError}</p>}

                  <button type="submit" className="login-submit-btn">
                    Continue
                    <ArrowRight size={17} />
                  </button>
                </form>

                <p className="auth-switch-text">
                  Already have an account?{' '}
                  <button type="button" className="inline-link-btn" onClick={() => openAuthModal('login')}>
                    Sign in
                  </button>
                </p>
              </>
            )}

            {authMode === 'signup' && authStep === 2 && (
              <>
                <div className="modal-heading">
                  <span className="feature-icon"><MapPin size={18} /></span>
                  <div>
                    <span className="section-label">A BIT MORE ABOUT YOU</span>
                    <h3>Delivery details</h3>
                  </div>
                </div>

                <form onSubmit={handleAuthContinue}>
                  <label className="form-group">
                    <span>Phone (optional)</span>
                    <input
                      type="tel"
                      value={authForm.phone}
                      onChange={(event) => handleAuthFieldChange('phone', event.target.value)}
                      placeholder="07xx xxx xxx"
                    />
                  </label>
                  <label className="form-group">
                    <span>Usual delivery area (optional)</span>
                    <input
                      type="text"
                      value={authForm.location}
                      onChange={(event) => handleAuthFieldChange('location', event.target.value)}
                      placeholder="e.g. Juja Gate, Thika Road"
                    />
                  </label>

                  <button type="submit" className="login-submit-btn">
                    Continue
                    <ArrowRight size={17} />
                  </button>
                </form>
              </>
            )}

            {authMode === 'signup' && authStep === 3 && (
              <div className="auth-confirmation">
                <span className="confirmation-icon"><CheckCircle2 size={40} /></span>
                <h3>Welcome to Mabuyu Rewards</h3>
                <p>
                  You will now earn 1 point for every KSh 20 you spend, with automatic
                  discounts as you climb tiers.
                </p>
                <button type="button" className="login-submit-btn" onClick={closeAuthModal}>
                  Finish
                </button>
              </div>
            )}

            <div className="auth-security-note">
              <CheckCircle2 size={16} />
              <span>Demo account system stored on this device. Connect a real authentication backend before launch.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}