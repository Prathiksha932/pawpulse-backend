// consultation.routes.js
import { Router } from 'express';
import * as consultationController from './consultation.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  startConsultationSchema,
  endConsultationSchema,
  messageHistoryQuerySchema,
} from './consultation.validation.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize('doctor'), validate(startConsultationSchema), consultationController.startConsultation);
router.patch('/:id/end', authorize('doctor'), validate(endConsultationSchema), consultationController.endConsultation);
router.get('/:id', consultationController.getConsultation);
router.get('/:id/messages', validate(messageHistoryQuerySchema, 'query'), consultationController.getMessages);

export default router;