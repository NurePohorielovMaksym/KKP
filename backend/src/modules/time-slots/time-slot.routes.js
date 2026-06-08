import express from 'express';
import TimeSlotController from './time-slot.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/role.middleware.js';

const router = express.Router();

/**
 *  @swagger
 *  tags:
 *    name: TimeSlots
 *    description: Управління графіком роботи лікарів
 */


/**
 * @swagger
 * /api/time-slots/{specialistId}/standard:
 *   post:
 *     summary: Згенерувати базовий графік 5/2 (10:00 - 18:00) для лікаря
 *     tags: [TimeSlots]
 *     security:
 *       - bearerAuth: []
*     parameters:
 *       - in: path
 *         name: specialistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID спеціаліста
 *     responses:
 *       201:
 *         description: Графік успішно створено
 *       400:
 *         description: Некоректні дані
 */
router.post('/:specialistId/standard', authenticateToken, authorizeRoles('admin', 'doctor'), TimeSlotController.generateStandard);

/**
 * @swagger
 * /api/time-slots/{specialistId}:
 *   get:
 *     summary: Отримати налаштований графік роботи лікаря
 *     tags: [TimeSlots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: specialistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID спеціаліста
 *     responses:
 *       200:
 *         description: Графік спеціаліста
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Користувача не знайдено
 */
router.get('/:specialistId', TimeSlotController.getBySpecialist);

/**
 * @swagger
 * /api/time-slots/{specialistId}/exceptions:
 *   post:
 *     summary: Додати або змінити виняток для конкретної дати (відгул, додаткова зміна)
 *     description: Якщо is_available = false (відгул), години роботи можна не передавати.
 *     tags: [TimeSlots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: specialistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID спеціаліста
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specific_date
 *               - is_available
 *             properties:
 *               specific_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-01"
 *               is_available:
 *                 type: boolean
 *                 example: false
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00" 
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "14:00:00" 
 *               reason:
 *                 type: string
 *                 example: "Лікарняний"
 *               slot_duration:
 *                 type: integer
 *                 description: Тривалість прийому у хвилинах
 *                 example: 45
 * 
 *     responses:
 *       201:
 *         description: Дату успішно збережено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Не авторизовано
 *       403:
 *         description: Немає прав доступу (потрібен admin)
 */
router.post('/:specialistId/exceptions', authenticateToken, authorizeRoles('admin', 'doctor'), TimeSlotController.updateDate);


/**
 * @swagger
 * /api/time-slots/{specialistId}/daily:
 *   get:
 *     summary: Отримати актуальний графік на конкретний день
 *     tags: [TimeSlots]
 *     parameters:
 *       - in: path
 *         name: specialistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID спеціаліста
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Дата у форматі YYYY-MM-DD
 *         example: "2026-04-21"
 *     responses:
 *       200:
 *         description: Актуальний розклад (шаблон або виняток)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     specialist_id:
 *                       type: integer
 *                     day_of_week:
 *                       type: integer
 *                       nullable: true
 *                     specific_date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *                     is_available:
 *                       type: boolean
 *                     slot_duration:
 *                       type: integer
 *                     reason:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Відсутня дата або некоректні дані
 *       404:
 *         description: Графік не знайдено
 *       500:
 *         description: Помилка сервера
 */
router.get('/:specialistId/daily', TimeSlotController.getDailySchedule);

/**
 * @swagger
 * /api/time-slots/{specialistId}/template/{dayOfWeek}:
 *   patch:
 *     summary: Оновити базовий шаблон дня тижня (назавжди)
 *     tags: [TimeSlots]
 *     parameters:
 *       - in: path
 *         name: specialistId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: dayOfWeek
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 7
 *         description: "1-Понеділок, ..., 7-Неділя"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *                 example: "10:00:00"
 *               end_time:
 *                 type: string
 *                 example: "20:00:00"
 *               is_available:
 *                 type: boolean
 *               slot_duration:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       200:
 *         description: Шаблон успішно оновлено
 *       404:
 *         description: Шаблон для цього дня не знайдено
 */
router.patch('/:specialistId/template/:dayOfWeek', TimeSlotController.updateTemplate);

router.get('/:specialistId/available', TimeSlotController.getAvailableSlots);

export default router;