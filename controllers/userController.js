const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ApiFeatures = require('../services/apiFeature');

exports.getAllUsers = async (req, res) => {
  try {
    const features = new ApiFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const users = await features.query;

    //Send response
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id });
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.find({ _id: req.body.userid });
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// exports.addNewUser = (req, res) => {
//   res.status(500).json({
//     status: 'success',
//     message: 'route not defined',
//   });
// };
// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'success',
//     message: 'route not defined',
//   });
// };

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  // secure: true,
  httpOnly: true,
};

exports.signin = async (req, res, next) => {
  try {
    console.log('hello');
    if (process.env.NODE_ENV === 'production') delete req.body.role;
    const newUser = await User.create(req.body);

    const accessToken = jwt.sign(
      { id: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 20 }
    );
    const refreshToken = await newUser.createRefreshToken();
    await newUser.save({ validateBeforeSave: false });

    res.cookie('AccessToken', accessToken, cookieOptions);
    res.cookie('RefreshToken', refreshToken, cookieOptions);
    newUser.password = undefined;
    newUser.userRefreshToken = undefined;
    newUser.refreshTokenExpires = undefined;
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('please provide password and email');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error('data is incorrect');
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 20 }
    );
    // const refreshToken = jwt.sign(
    //   { id: user._id },
    //   process.env.ACCESS_TOKEN_SECRET,
    //   { expiresIn: Date.now() + 10 * 60 * 60 * 1000 }
    // );

    const refreshToken = await user.createRefreshToken();
    await user.save({ validateBeforeSave: false });

    res.cookie('AccessToken', accessToken, cookieOptions);
    res.cookie('RefreshToken', refreshToken, cookieOptions);
    res.status(200).json({
      status: 'success',
      email,
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.logout = (req, res) => {
  res.cookie('AccessToken', undefined, cookieOptions);
  res.cookie('RefreshToken', undefined, cookieOptions);
  res.status(204).json({
    status: 'success',
  });
};

exports.refreshToken = async (req, res) => {
  try {
    const { RefreshToken } = req.cookies;
    const hashedToken = crypto
      .createHash('sha256')
      .update(RefreshToken)
      .digest('hex');

    const user = await User.findOne({
      userRefreshToken: hashedToken,
      refreshTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('Please log in again');
    }

    const decoded = await promisify(jwt.verify)(
      RefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 20 }
    );

    res.cookie('AccessToken', accessToken, cookieOptions);
    res.status(204).json({
      status: 'success',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
