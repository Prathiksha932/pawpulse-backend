import { Router } from 'express';
import * as doctorController from './doctorProfile.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createDoctorProfileSchema, updateDoctorProfileSchema } from './doctorProfile.validation.js';

const router = Router();

router.get('/', doctorController.listDoctors); // public
router.get('/:id/availability', authenticate, doctorController.getAvailability);

router.post(
  '/profile',
  authenticate,
  authorize('doctor'),
  validate(createDoctorProfileSchema),
  doctorController.createProfile
);
router.patch(
  '/profile',
  authenticate,
  authorize('doctor'),
  validate(updateDoctorProfileSchema),
  doctorController.updateProfile
);
router.patch(
  '/:id/approve',
  authenticate,
  authorize('clinic_admin', 'super_admin'),
  doctorController.approveDoctor
);

export default router;