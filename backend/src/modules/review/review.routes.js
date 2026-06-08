import { Router } from 'express';
import reviewController from './review.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = Router();

// Публічно: отримати відгуки лікаря
router.get('/:specialistId', reviewController.getBySpecialist);

// Авторизований юзер: залишити відгук
router.post('/:specialistId', authenticateToken, reviewController.create);

// Авторизований юзер: видалити свій відгук
router.delete('/:id/my', authenticateToken, reviewController.userDelete);

// Тільки адмін: видалити будь-який відгук
router.delete('/:id', authenticateToken, authorizeRoles('admin'), reviewController.adminDelete);

export default router;