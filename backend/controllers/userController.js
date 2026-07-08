const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');


const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        dailyGoalLiters: req.user.dailyGoalLiters,
        createdAt: req.user.createdAt,
      },
    },
  });
});


const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, dailyGoalLiters } = req.body;

  const user = await User.findById(req.user._id);

  if (email && email !== user.email) {
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      res.status(400);
      throw new Error('That email is already in use');
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (dailyGoalLiters) user.dailyGoalLiters = dailyGoalLiters;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        dailyGoalLiters: updatedUser.dailyGoalLiters,
      },
    },
  });
});


const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated' });
});

module.exports = { getProfile, updateProfile, changePassword };
