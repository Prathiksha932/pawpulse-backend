import * as authService from './auth.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';
import ApiResponse from '../../shared/utils/ApiResponse.js';
import { logger } from '../../config/logger.js';
import { sendVerificationEmail } from '../../shared/utils/emailService.js';

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
};

export const register = asyncHandler(async (req, res) => {
  const { user, verificationToken } = await authService.registerUser(req.body);

  // Email sending isn't built yet (Nodemailer comes later) —
  // logging the link so we can manually test the verification flow now.
  await sendVerificationEmail(user.email, user.fullName, verificationToken);
  logger.info(`Verification link: http://localhost:5173/verify-email/${verificationToken}`, {
    requestId: req.id,
  });

  const message =
    user.role === 'doctor'
      ? 'Registration successful. Your account is pending admin approval.'
      : 'Registration successful. Please check your email to verify your account.';

  return res
    .status(201)
    .json(new ApiResponse(201, { userId: user._id, email: user.email }, message));
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

  res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      'Login successful'
    )
  );
});
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(incomingRefreshToken);

  res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  return res
    .status(200)
    .json(new ApiResponse(200, { accessToken }, 'Access token refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);

  res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS);

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});