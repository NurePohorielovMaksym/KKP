import express from 'express';
import EmailAppointmentController from './email-appointment.controller.js';

const router = express.Router();

router.post('/', EmailAppointmentController.create);

export default router;