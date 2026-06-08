import express from 'express';
import AuthController from './auth.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { registerValidator } from './auth.validator.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентифікація 
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - middleName
 *               - email
 *               - password
 *             properties:          
 *               firstName:
 *                 type: string
 *                 example: John 
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               middleName:
 *                 type: string
 *                 example: Po
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongPass123
 *               phone:
 *                 type: string
 *                 example: +380 11 111 11 11
 * 
 *     responses:
 *       201:
 *         description: Користувач успішно зареєстрований
 *       400:
 *         description: Некоректні дані
 */
router.post('/register', registerValidator, validateRequest, AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизація
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongPass123
 * 
 *     responses:
 *       201:
 *         description: Користувач успішно залогінений
 *       400:
 *         description: Некоректні дані
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/register-staff:
 *   post:
 *     summary: Реєстрація нового робітника
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - middleName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongPass123
 *               firstName:
 *                 type: string
 *                 example: John 
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               middleName:
 *                 type: string
 *                 example: Po
 *               role:
 *                 type: string
 *                 enum: [doctor, admin]
 *                 example: doctor
 *               specialization:
 *                 type: string
 *                 description: Спеціалізація (тільки для лікарів)
 *                 example: Реабілітолог
 *               qualification:
 *                 type: string
 *                 description: Кваліфікація (тільки для лікарів)
 *                 example: Вища категорія, магістр
 *               yearsOfExperience:
 *                 type: string
 *                 description: Досвід роботи в роках (тільки для лікарів)
 *                 example: 5
 * 
 *     responses:
 *       201:
 *         description: Користувач успішно зареєстрований
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Не авторизовано
 *       403:
 *         description: Немає прав доступу (потрібен admin)
 */
router.post('/register-staff', authenticateToken, authorizeRoles('admin'), AuthController.registerStaff);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Вихід з акаунту
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Користувач успішно залогінений
 *       400:
 *         description: Некоректні дані
 */
router.post('/logout', authenticateToken, AuthController.logout);


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Запит на відновлення пароля (відправка токена)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Лист надіслано
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Скидання пароля за допомогою токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Токен з листа
 *               newPassword:
 *                 type: string
 *                 example: "newStrongPassword123"
 *     responses:
 *       200:
 *         description: Пароль змінено
 *       400:
 *         description: Недійсний токен
 */
router.post('/reset-password', AuthController.resetPassword);

router.post('/verify-otp', AuthController.verifyOtp);

export default router;