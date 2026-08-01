import { Animal } from './animal.model.js';
import ApiError from '../../shared/utils/ApiError.js';

export const createAnimal = async (ownerId, animalData) => {
  const animal = await Animal.create({ ...animalData, ownerId });
  return animal;
};

export const getAnimals = async (requestingUser, queryParams) => {
  const { page, limit, species, search, sortBy, order } = queryParams;

  const filter = { isActive: true };

  // Ownership scoping: owners only ever see their own animals.
  // Doctors/admins can see everyone's — enforced here, not trusted from the client.
  if (requestingUser.role === 'owner') {
    filter.ownerId = requestingUser._id;
  }

  if (species) {
    filter.species = species;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [animals, total] = await Promise.all([
    Animal.find(filter).sort(sortOptions).skip(skip).limit(limit).populate('ownerId', 'fullName email'),
    Animal.countDocuments(filter),
  ]);

  return {
    animals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAnimalById = async (animalId, requestingUser) => {
  const animal = await Animal.findOne({ _id: animalId, isActive: true }).populate(
    'ownerId',
    'fullName email'
  );

  if (!animal) {
    throw new ApiError(404, 'Animal not found');
  }

  assertOwnershipOrPrivileged(animal, requestingUser);

  return animal;
};

export const updateAnimal = async (animalId, requestingUser, updates) => {
  const animal = await Animal.findOne({ _id: animalId, isActive: true });

  if (!animal) {
    throw new ApiError(404, 'Animal not found');
  }

  assertOwnershipOrPrivileged(animal, requestingUser);

  Object.assign(animal, updates);
  await animal.save();

  return animal;
};

export const deleteAnimal = async (animalId, requestingUser) => {
  const animal = await Animal.findOne({ _id: animalId, isActive: true });

  if (!animal) {
    throw new ApiError(404, 'Animal not found');
  }

  assertOwnershipOrPrivileged(animal, requestingUser);

  animal.isActive = false;
  await animal.save();
};

// Shared ownership check — the concrete implementation of the
// resource-based authorization concept from Phase 1.
function assertOwnershipOrPrivileged(animal, requestingUser) {
  const isOwner = animal.ownerId._id
    ? animal.ownerId._id.equals(requestingUser._id)
    : animal.ownerId.equals(requestingUser._id);

  const isPrivilegedRole = ['doctor', 'clinic_admin', 'super_admin'].includes(requestingUser.role);

  if (!isOwner && !isPrivilegedRole) {
    throw new ApiError(403, 'You do not have permission to access this animal');
  }
}