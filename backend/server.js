const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const usageRoutes = require('./routes/usageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

connectDB();

const app = express();

// Trust Render's proxy (fixes express-rate-limit warning)
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false, // disabled to keep the vanilla-JS frontend simple to serve
  })
);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- Static frontend ---
const FRONTEND_PUBLIC = path.join(__dirname, '..', 'frontend', 'public');
const FRONTEND_PAGES = path.join(__dirname, '..', 'frontend', 'pages');

app.use(express.static(FRONTEND_PUBLIC));
app.use(express.static(FRONTEND_PAGES));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_PAGES, 'index.html'));
});

// Any unmatched non-API route falls back to the 404 page
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.status(404).sendFile(path.join(FRONTEND_PAGES, '404.html'));
});

// --- API error handling ---
app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AquaTrack server running on port ${PORT}`);
});
