const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Authentication middleware to protect routes.  It looks for a Bearer token in
 * the Authorization header, verifies it and attaches the authenticated user
 * object to req.user.  If no token is present or verification fails, a 401
 * response is returned.  The JWT secret can be configured via the JWT_SECRET
 * environment variable; a default is provided for development convenience.
 */
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  res.status(401).json({ message: 'Not authorized, no token' });
};

/**
 * Authorization middleware to restrict actions to administrators.  Assumes the
 * protect middleware has already been executed and req.user is defined.
 */
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access denied' });
};