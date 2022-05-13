const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'a user must have email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'provide a valid email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'a user must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'a user must have a password conformation'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords dont coincide',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  userRefreshToken: String,
  refreshTokenExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// userSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
//   let changedTimestamp;
//   if (this.passwordChangedAt) {
//     changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
//     // console.log(changedTimestamp, JWTtimestamp);
//   }
//   return JWTtimestamp < changedTimestamp;
// };
// userSchema.methods.createAccessToken = async function () {
//   const accessToken = jwt.sign(
//     { id: this._id },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: Date.now() + 2 * 60 * 1000 }
//   );

//   this.accessTokenExpires = Date.now() + 2 * 60 * 1000;
//   return accessToken;
// };

userSchema.methods.createRefreshToken = async function () {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: 24 * 60 * 60 }
  );
  this.userRefreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  this.refreshTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  return refreshToken;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
