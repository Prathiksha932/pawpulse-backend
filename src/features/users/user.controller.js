import asyncHandler from '../../shared/utils/asyncHandler.js';
import ApiResponse from '../../shared/utils/ApiResponse.js';

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, 'Current user fetched'));
});