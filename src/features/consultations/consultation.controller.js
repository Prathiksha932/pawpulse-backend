// consultation.controller.js
import * as consultationService from './consultation.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';
import ApiResponse from '../../shared/utils/ApiResponse.js';

export const startConsultation = asyncHandler(async (req, res) => {
  const consultation = await consultationService.startConsultation(req.user._id, req.body.appointmentId);
  return res.status(201).json(new ApiResponse(201, consultation, 'Consultation started'));
});

export const endConsultation = asyncHandler(async (req, res) => {
  const consultation = await consultationService.endConsultation(req.params.id, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, consultation, 'Consultation completed'));
});

export const getConsultation = asyncHandler(async (req, res) => {
  const consultation = await consultationService.getConsultationById(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, consultation, 'Consultation fetched'));
});

export const getMessages = asyncHandler(async (req, res) => {
  const result = await consultationService.getMessageHistory(req.params.id, req.user, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Message history fetched'));
});