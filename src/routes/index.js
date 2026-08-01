import { Router } from 'express';
import authRoutes from '../features/auth/auth.routes.js';
import userRoutes from '../features/users/user.routes.js';
import animalRoutes from '../features/animals/animal.routes.js';
import doctorRoutes from '../features/doctors/doctorProfile.routes.js';
import appointmentRoutes from '../features/appointments/appointment.routes.js';
import consultationRoutes from '../features/consultations/consultation.routes.js';
import adminRoutes from '../features/admin/admin.routes.js';


const router = Router();
router.use('/doctors', doctorRoutes);
router.use('/animals', animalRoutes);
router.use('/users', userRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/consultations', consultationRoutes);
router.use('/admin', adminRoutes);



router.use('/auth', authRoutes);

export default router;