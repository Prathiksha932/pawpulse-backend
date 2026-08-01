import { Router } from 'express';
import * as appointmentController from './appointment.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createAppointmentSchema, updateStatusSchema } from './appointment.validation.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('owner'), validate(createAppointmentSchema), appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.patch('/:id/status', validate(updateStatusSchema), appointmentController.updateStatus);

export default router;