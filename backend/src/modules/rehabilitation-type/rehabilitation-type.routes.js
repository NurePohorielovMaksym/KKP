import express from 'express';
import RehabilitationTypeController from './rehabilitation-type.controller.js';
import { upload } from '../../config/upload.js';

const router = express.Router();


router.get('/by-specialization/:specialization', RehabilitationTypeController.getBySpecialization);
/**
 * @swagger
 * /api/rehabilitation-types:
 *   get:
 *     summary: Отримати всі активні типи реабілітації
 *     tags: [RehabilitationTypes]
 *     responses:
 *       200:
 *         description: Успішно отримано список
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
 *       500:
 *         description: Помилка сервера
 */
router.get('/', RehabilitationTypeController.getAll);

/**
 * @swagger
 * /api/rehabilitation-types:
 *   post:
 *     summary: Створити новий тип реабілітації
 *     tags: [RehabilitationTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Масаж спини"
 *               description:
 *                 type: string
 *                 example: "Лікувальний масаж поперекового відділу"
 *               duration_minutes:
 *                 type: integer
 *                 example: 45
 *               price:
 *                 type: number
 *                 example: 500.00
 *               category:
 *                 type: string
 *                 example: "Масаж"
 *     responses:
 *       201:
 *         description: Успішно створено
 *       400:
 *         description: Помилка валідації або запиту
 */
router.post('/', upload.single('photo'), RehabilitationTypeController.create);

/**
 * @swagger
 * /api/rehabilitation-types/{id}:
 *   patch:
 *     summary: Оновити існуючий тип реабілітації
 *     tags: [RehabilitationTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID типу реабілітації
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               duration_minutes:
 *                 type: integer
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Успішно оновлено
 *       400:
 *         description: Помилка запиту або тип не знайдено
 */
router.patch('/:id', upload.single('photo'), RehabilitationTypeController.update);

/**
 * @swagger
 * /api/rehabilitation-types/{id}:
 *   delete:
 *     summary: Видалити тип реабілітації
 *     tags: [RehabilitationTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID типу реабілітації
 *     responses:
 *       200:
 *         description: Успішно видалено
 *       404:
 *         description: Тип не знайдено
 *       500:
 *         description: Помилка сервера
 */
router.delete('/:id', RehabilitationTypeController.delete);

router.get('/category/:categoryName', RehabilitationTypeController.getByCategory);

router.get('/:id', RehabilitationTypeController.getById);

export default router;