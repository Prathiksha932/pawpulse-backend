import * as doctorService from './doctorProfile.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';
import ApiResponse from '../../shared/utils/ApiResponse.js';

export const createProfile = asyncHandler(async (req, res) => {
  const profile = await doctorService.createProfile(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, profile, 'Doctor profile created'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await doctorService.updateProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, profile, 'Doctor profile updated'));
});

export const listDoctors = asyncHandler(async (req, res) => {
  const result = await doctorService.listApprovedDoctors(req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Doctors fetched'));
});

export const approveDoctor = asyncHandler(async (req, res) => {
  const profile = await doctorService.approveDoctor(req.params.id);
  return res.status(200).json(new ApiResponse(200, profile, 'Doctor approved'));
});

export const getAvailability = asyncHandler(async (req, res) => {
  const slots = await doctorService.getAvailableSlots(req.params.id, req.query.date);
  return res.status(200).json(new ApiResponse(200, { date: req.query.date, slots }, 'Available slots fetched'));
});