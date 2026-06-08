import express from 'express';
import SpecialistController from './specialist.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';
import { upload } from '../../config/upload.js'; 

const router = express.Router();

router.get('/specializations', SpecialistController.getSpecializations);

/**
 * @swagger
 * /api/specialists/:
 *   get:
 *     summary: Отримати список усіх активних спеціалістів
 *     tags: [Specialists]
 *     responses:
 *       200:
 *         description: Користувачі
 *       401:
 *         description: Unauthorized
 */
router.get('/', SpecialistController.getAll);

/**
 * @swagger
 * /api/specialists/{id}:
 *   get:
 *     summary: Отримати деталі конкретного спеціаліста
 *     tags: [Specialists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID спеціаліста
 *     responses:
 *       200:
 *         description: Деталі спеціаліста 
 *       401:
 *         description: Спеціаліста не знайдено
 */
router.get('/:id', SpecialistController.getById);

/**
 * @swagger
 * /api/specialists/{id}:
 *   put:
 *     summary: Оновити профіль спеціаліста
 *     tags: [Specialists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID спеціаліста
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               qualification:
 *                 type: string
 *               years_of_experience:
 *                 type: integer
 *               bio:
 *                 type: string
 *               photo:
 *                 type: binary
 *     responses:
 *       200:
 *         description: Профіль оновлено
 *       401:
 *         description: Не авторизовано
 *       403:
 *         description: Немає доступу
 */
router.put('/:id', authenticateToken, authorizeRoles('admin', 'doctor'), upload.single('photo'), SpecialistController.update);


export default router;