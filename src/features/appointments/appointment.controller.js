import * as appointmentService from './appointment.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';
import ApiResponse from '../../shared/utils/ApiResponse.js';

export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, appointment, 'Appointment booked successfully'));
});

export const getAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getAppointments(req.user, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Appointments fetched'));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateAppointmentStatus(
    req.params.id,
    req.user,
    req.body
  );
  return res.status(200).json(new ApiResponse(200, appointment, 'Appointment status updated'));
});