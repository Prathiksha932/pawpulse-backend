import { Router } from 'express';
import * as animalController from './animal.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  createAnimalSchema,
  updateAnimalSchema,
  animalQuerySchema,
} from './animal.validation.js';

const router = Router();

router.use(authenticate); // every route below requires login

router.post('/', authorize('owner'), validate(createAnimalSchema), animalController.createAnimal);
router.get('/', validate(animalQuerySchema, 'query'), animalController.getAnimals);
router.get('/:id', animalController.getAnimalById);
router.patch('/:id', validate(updateAnimalSchema), animalController.updateAnimal);
router.delete('/:id', animalController.deleteAnimal);

export default router;