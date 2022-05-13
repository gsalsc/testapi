const { promisify } = require('util');
const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  try {
    const { AccessToken, RefreshToken } = req.cookies;

    if (!AccessToken || !RefreshToken) {
      throw new Error('not authorized');
    }

    const decoded = await promisify(jwt.verify)(
      AccessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 3) check if user still exists
    // const freshUser = await User.findById(decoded.id);
    // if (!freshUser) {
    //   throw new Error("Token user doesn't exist");
    // }
    // 4) check if user changed password after the token was issued
    // if (freshUser.changedPasswordAfter(decoded.iat)) {
    //   throw new Error('Password has been changed. Relog in');
    // }
    //req.user = freshUser;

    req.body.userid = decoded.id;
    next();
  } catch (err) {
    if (err.message === 'jwt malformed') {
      res.status(401).json({
        status: 'fail',
        message: 'Please log in',
      });
    } else if (err.message === 'jwt expired') {
      res.status(401).json({
        status: 'fail',
        message: 'Refresh token',
      });
    } else {
      res.status(401).json({
        status: 'fail',
        message: err.message,
      });
    }
  }
};
