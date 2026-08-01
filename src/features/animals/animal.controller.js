import * as animalService from './animal.service.js';
import asyncHandler from '../../shared/utils/asyncHandler.js';
import ApiResponse from '../../shared/utils/ApiResponse.js';

export const createAnimal = asyncHandler(async (req, res) => {
  const animal = await animalService.createAnimal(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, animal, 'Animal added successfully'));
});

export const getAnimals = asyncHandler(async (req, res) => {
  const result = await animalService.getAnimals(req.user, req.query);
  return res.status(200).json(new ApiResponse(200, result, 'Animals fetched successfully'));
});

export const getAnimalById = asyncHandler(async (req, res) => {
  const animal = await animalService.getAnimalById(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, animal, 'Animal fetched successfully'));
});

export const updateAnimal = asyncHandler(async (req, res) => {
  const animal = await animalService.updateAnimal(req.params.id, req.user, req.body);
  return res.status(200).json(new ApiResponse(200, animal, 'Animal updated successfully'));
});

export const deleteAnimal = asyncHandler(async (req, res) => {
  await animalService.deleteAnimal(req.params.id, req.user);
  return res.status(200).json(new ApiResponse(200, null, 'Animal deleted successfully'));
});