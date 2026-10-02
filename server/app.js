require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const mongoose = require('mongoose');
const { configureCloudinary } = require('./config/cloudinary');

const sellerRouter = require('./routes/sellerRouter');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const { session } = require('./controllers/authController');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Behind Render/Vercel proxies, so req.ip and secure cookies resolve correctly.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

/**
 * CORS.
 *
 * `origin` was `process.env.CLIENT_URL`, which is undefined when the variable
 * is not set in the Render dashboard. That produces an invalid CORS
 * configuration and every browser request from the Vercel frontend fails, so
 * the cookie is never stored and login looks broken.
 *
 * Now: an explicit allowlist when configured, otherwise same-origin only.
 *
 * A disallowed origin is answered with `callback(null, false)`, which simply
 * omits the `Access-Control-Allow-Origin` header and lets the browser block the
 * response. Passing an `Error` instead (as this used to) made every
 * cross-origin request from an unlisted origin fail with HTTP 500, which
 * surfaced in the UI as "Cannot reach the server. Is the backend running?" -
 * the API was in fact healthy, and it also filled the logs with 500s for what
 * is a routine access-control decision.
 */
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin, curl and server-to-server calls have no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Login/register are the only brute-forceable endpoints, so they get a limit.
// The cap is configurable because the default needs to be high enough not to
// lock out a legitimate user (or several users behind one IP) during a demo.
const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX) || 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Too many attempts, please try again later' },
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  return res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});

app.get('/api/session', session);

app.use('/api/seller/login', authLimiter);
app.use('/api/seller/register', authLimiter);
app.use('/api/user/login', authLimiter);
app.use('/api/user/register', authLimiter);

app.use('/api/seller', sellerRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use(errorHandler);

/**
 * Connects to the database and starts listening.
 *
 * Previously the app called `app.listen()` immediately, so Render reported the
 * service as healthy even when MongoDB was unreachable and every request then
 * failed. Waiting for the connection makes a bad `MONGODB_URI` a loud startup
 * failure instead of a silently broken site.
 */
async function startServer() {
  const { connectDB } = require('./config/mongoose-connection');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not set. Add it to your environment (see .env.example).');
  }
  if (process.env.NODE_ENV === 'production' && !configureCloudinary()) {
    console.warn('[warn] Cloudinary credentials missing: product image uploads will be rejected.');
  }

  const { uri, inMemory } = await connectDB();

  if (inMemory) {
    console.warn(
      '\n⚠  No MONGODB_URI found - started an in-memory MongoDB.\n' +
        '   Data will NOT persist. For a real database set MONGODB_URI (see .env.example).\n' +
        `   URI: ${uri}\n`
    );

    // An empty in-memory database is useless to look at, so fill it with demo data.
    if (process.env.SEED_DEMO_DATA !== 'false') {
      const { seed } = require('./scripts/seedData');
      const result = await seed();
      console.log(
        `🌱 Seeded demo data: ${result.products} products, ${result.orders} orders, ` +
          `${result.users} customers, ${result.sellers} sellers\n${result.banner}`
      );
    }
  } else {
    console.log(`✅ MongoDB connected: ${uri.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@')}`);
  }

  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    console.log(`🚀 Scatch API listening on port ${port} (${process.env.NODE_ENV || 'development'})`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down.`);
    server.close(async () => {
      if (mongoose.__memoryServer) await mongoose.__memoryServer.stop();
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  });
}

module.exports = { app, startServer };