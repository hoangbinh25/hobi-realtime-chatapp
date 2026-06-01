import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectedRoute = (req, res, next) => {
  try {
    // get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Not found access token' });
    }

    // confirm token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
      if (err) {
        console.error(err);

        return res.status(403).json({ message: 'Access token expired or not correct' });
      }

      // find user
      const user = await User.findById(decodedUser.userId).select('-hashedPassword');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // return user in req
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error when verify JWT in authMiddleware', error);
    return res.status(500).json({ message: 'System error' });
  }
};
