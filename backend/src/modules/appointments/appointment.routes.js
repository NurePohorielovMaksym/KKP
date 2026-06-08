import express from 'express';
import AppointmentController from './appointment.controller.js';
import { sendAppointmentConfirmedEmail } from '../../services/email.service.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/check-completed/:specialistId', authenticateToken, AppointmentController.checkCompleted);
/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Отримати всі записи на прийом
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Список записів
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', AppointmentController.getAll);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Створити новий запис на прийом
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialist_id
 *               - rehabilitation_type_id
 *               - appointment_date
 *               - appointment_time
 *             properties:
 *               guest_name:
 *                  type: string
 *                  description: "Ім’я гостя (якщо user_id відсутній)"
 *               guest_phone:
 *                  type: string
 *                  description: "Телефон гостя (якщо user_id відсутній)"
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               specialist_id:
 *                 type: integer
 *                 example: 3
 *               rehabilitation_type_id:
 *                 type: integer
 *                 example: 2
 *               appointment_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-15"
 *               appointment_time:
 *                 type: string
 *                 example: "14:30:00"
 *               status:
 *                 type: string
 *                 example: "pending"
 *               notes:
 *                 type: string
 *                 example: "Пацієнт просив попередити за годину"
 *     responses:
 *       201:
 *         description: Запис успішно створено
 */
router.post('/', AppointmentController.create);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Отримати запис за ID
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Деталі запису
 */
router.get('/:id', AppointmentController.getById);

/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     summary: Оновити дані або статус запису
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "completed"
 *               appointment_date:
 *                 type: string
 *                 format: date
 *               appointment_time:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Запис оновлено
 */
router.patch('/:id', AppointmentController.update);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Видалити запис
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Запис видалено
 */
router.delete('/:id', AppointmentController.delete);

router.post('/:id/send-code', AppointmentController.sendCode);
router.post('/:id/confirm', AppointmentController.confirm);

export default router;