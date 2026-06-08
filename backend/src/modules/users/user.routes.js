import express from 'express';
import UserController from './user.controller.js'; 
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: Отримати список користувачів
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Користувачі
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.get('/', UserController.getUsers);


/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Отримати користувача по id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID користувача
 *     responses:
 *       200:
 *         description: Користувач
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', UserController.getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Оновити дані користувача 
 *     tags: [Users]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               middle_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               font_size:
 *                 type: integer
 *               high_contrast:
 *                 type: boolean
 *               high_contrast_mode:
 *                 type: boolean
 *               text_to_speech:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Профіль оновлено
 *       400:
 *         description: Помилка оновлення
 *       401:
 *         description: Не авторизовано
 *       403:
 *         description: Немає прав для оновлення чужого профілю
 */
router.put('/:id', authenticateToken, UserController.update);


/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Видалити користувача
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID користувача
 *     responses:
 *       200:
 *         description: Користувача видалено
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Користувача не знайдено
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), UserController.delete);

export default router;