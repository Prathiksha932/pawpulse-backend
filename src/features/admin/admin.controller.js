// admin.controller.js
import * as adminService from './admin.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';
import ApiResponse from '../../shared/utils/ApiResponse.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats fetched'));
});

export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Users fetched'));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(req.params.id, req.body.isActive);
  return res.status(200).json(new ApiResponse(200, user, 'User status updated'));
});

export const getAppointmentTrends = asyncHandler(async (req, res) => {
  const trends = await adminService.getAppointmentTrends(Number(req.query.days) || 30);
  return res.status(200).json(new ApiResponse(200, trends, 'Appointment trends fetched'));
});