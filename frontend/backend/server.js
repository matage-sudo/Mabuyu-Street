require('dotenv/config');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const publicRoutes = require('./src/routes/public.routes');
const customerAuthRoutes = require('./src/routes/customerAuth.routes');
const adminAuthRoutes = require('./src/routes/adminAuth.routes');
const adminDataRoutes = require('./src/routes/adminData.routes');

const app = express();

// ---------------------------------------------------------------------------
// Core middleware
// Fixes from the original server.js:
//  - cors()/express.json() were registered twice — removed the duplicates.
//  - app.use(securityMiddleware) passed the whole module.exports object
//    (which is { verifyThreeLayerSecurity }) instead of a function, which
//    would throw "TypeError: app.use() requires a middleware function" on
//    startup. Real auth now lives in src/middleware/adminAuth.js and is
//    applied only to /api/admin/* routes, not globally.
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true, // required so the admin_session cookie is sent/received
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api', publicRoutes);
app.use('/api/auth', customerAuthRoutes);

// Admin routes are their own router tree, each one individually protected
// by requireAdmin inside adminData.routes.js / adminAuth.routes.js. There
// is no link anywhere in the customer-facing frontend that points here —
// the admin panel is a separate build (see admin-main.jsx) served on its
// own path/subdomain, not discoverable through normal site navigation.
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminDataRoutes);

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`Mabuyu Street backend running on port ${PORT}`);
});