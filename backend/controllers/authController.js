const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created',
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      token,
    },
  });
});

// @desc    Authenticate a user and return a token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Logged in',
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      token,
    },
  });
});

// @desc    Logout (stateless JWT - client discards the token)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // Nothing to invalidate server-side for a stateless JWT; this endpoint
  // exists so the client has a consistent, semantic call to make on logout.
  res.status(200).json({ success: true, message: 'Logged out' });
});

module.exports = { registerUser, loginUser, logoutUser };
