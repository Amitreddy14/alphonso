const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
};

module.exports = protect;