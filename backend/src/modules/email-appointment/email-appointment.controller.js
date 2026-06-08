import { sendAppointmentEmail } from '../../services/email.service.js';

class EmailAppointmentController {
  async create(req, res) {
    try {
      const { name, email, phone, service, message } = req.body;

      if (!name || !email || !phone || !service) {
        return res.status(400).json({ message: 'Заповніть усі обов\'язкові поля' });
      }

      await sendAppointmentEmail({ name, email, phone, service, message });

      res.json({ success: true, message: 'Запис успішно відправлено!' });
    } catch (err) {
      console.error('Помилка відправки:', err);
      res.status(500).json({ message: 'Помилка при відправці. Спробуйте пізніше.' });
    }
  }
}

export default new EmailAppointmentController();