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
    contentSecurityPolicy: false,
  })
);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- API Routes ----------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ---------------- Static Frontend ----------------
const FRONTEND = path.join(__dirname, '..', 'frontend');

app.use(express.static(FRONTEND));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND, 'index.html'));
});

// Serve HTML pages directly
app.get('/:page', (req, res, next) => {
  if (req.params.page.startsWith('api')) return next();

  const file = path.join(FRONTEND, `${req.params.page}.html`);

  res.sendFile(file, (err) => {
    if (err) next();
  });
});

// 404 Page
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.status(404).sendFile(path.join(FRONTEND, '404.html'));
});

// ---------------- API Error Handling ----------------
app.use('/api', notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AquaTrack server running on port ${PORT}`);
});