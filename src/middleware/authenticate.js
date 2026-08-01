import jwt from 'jsonwebtoken';
import { User } from '../features/users/user.model.js';
import ApiError from '../shared/utils/ApiError.js';
import asyncHandler from '../shared/utils/asyncHandler.js';
import { env } from '../config/env.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access token is missing or malformed');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token has expired');
    }
    throw new ApiError(401, 'Invalid access token');
  }

  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User no longer exists or is inactive');
  }

  req.user = user;
  next();
});