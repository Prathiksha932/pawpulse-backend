// admin.routes.js
import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();

router.use(authenticate, authorize('clinic_admin', 'super_admin'));

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/analytics/appointments', adminController.getAppointmentTrends);

export default router;