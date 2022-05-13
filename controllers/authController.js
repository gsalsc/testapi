const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
// const sendEmail = require('../services/email');

// const cookieOptions = {
//   expires: new Date(
//     Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//   ),
//   // secure: true,
//   httpOnly: true,
// };
// const signToken = (id) =>
//   jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });

// exports.signup = async (req, res, next) => {
//   try {
//     const newUser = await User.create({
//       name: req.body.name,
//       email: req.body.email,
//       photo: req.body.photo,
//       role: req.body.role,
//       password: req.body.password,
//       passwordConfirm: req.body.passwordConfirm,
//       passwordChangedAt: req.body.passwordChangedAt,
//     });

//     const token = signToken(newUser._id);

//     newUser.password = undefined;

//     res.cookie('AccessToken', token, cookieOptions);
//     res.cookie('Test', token, cookieOptions);

//     res.status(201).json({
//       status: 'success',
//       token,
//       data: {
//         user: newUser,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err.message,
//     });
//   }
// };

// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       throw new Error('please provide password and email');
//     }

//     const user = await User.findOne({ email }).select('+password');

//     if (!user || !(await user.correctPassword(password, user.password))) {
//       throw new Error('data is incorrect');
//     }

//     const token = signToken(user._id);
//     res.status(200).json({
//       status: 'success',
//       email,
//       token,
//     });
//   } catch (err) {
//     res.status(401).json({
//       status: 'fail',
//       message: err.message,
//     });
//   }
// };

// exports.protect = async (req, res, next) => {
//   try {
//     let token;
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith('Bearer ')
//     ) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (!token) {
//       throw new Error('not authorized');
//     }

//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//     // 3) check if user still exists

//     const freshUser = await User.findById(decoded.id);
//     if (!freshUser) {
//       throw new Error("Token user doesn't exist");
//     }

//     // 4) check if user changed password after the token was issued

//     if (freshUser.changedPasswordAfter(decoded.iat)) {
//       throw new Error('Password has been changed. Relog in');
//     }
//     req.user = freshUser;
//     req.body.userid = decoded.id;
//     next();
//   } catch (err) {
//     res.status(401).json({
//       status: 'fail',
//       message: err.message,
//     });
//   }
// };

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw new Error('no permission to perform this action');
      }
      next();
    } catch (err) {
      res.status(403).json({
        status: 'fail',
        message: err.message,
      });
    }
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // console.log(req.body.email);
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error('user not found');
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = 'submit a new password';

    // await sendEmail({});

    res.status(200).json({
      status: 'success',
      data: { resetToken },
      resetURL,
      message,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error('token isnt valid');
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
