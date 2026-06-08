import { Router } from 'express';
import AdminController from './admin.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

router.use(authenticateToken, authorizeRoles('admin'));

router.get('/dashboard', AdminController.getDashboard.bind(AdminController));

router.get('/appointments', AdminController.getAppointments.bind(AdminController));
router.patch('/appointments/:id/status', AdminController.updateAppointmentStatus.bind(AdminController));
router.delete('/appointments/:id', AdminController.deleteAppointment.bind(AdminController));

router.get('/users', AdminController.getUsers.bind(AdminController));
router.get('/users/:id', AdminController.getUserById.bind(AdminController));
router.patch('/users/:id/role', AdminController.updateUserRole.bind(AdminController));
router.delete('/users/:id', AdminController.deleteUser.bind(AdminController));

router.get('/specialists', AdminController.getSpecialists.bind(AdminController));
router.patch('/specialists/:id/toggle', AdminController.toggleSpecialist.bind(AdminController));

export default router;