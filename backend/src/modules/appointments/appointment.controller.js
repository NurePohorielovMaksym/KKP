import AppointmentService from './appointment.service.js';
import { sendAppointmentConfirmedEmail } from '../../services/email.service.js';

class AppointmentController {
  async create(req, res) {
    try {
      const newAppointment = await AppointmentService.createAppointment(req.body);
      res.status(201).json({
        success: true,
        message: 'Запис успішно створено',
        data: newAppointment
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const appointments = await AppointmentService.getAllAppointments();
      res.json({ success: true, data: appointments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await AppointmentService.getAppointmentById(id);
      res.json({ success: true, data: appointment });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedAppointment = await AppointmentService.updateAppointment(id, req.body);
      res.json({
        success: true,
        message: 'Запис оновлено',
        data: updatedAppointment
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedAppointment = await AppointmentService.deleteAppointment(id);
      res.json({
        success: true,
        message: 'Запис видалено',
        data: deletedAppointment
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async sendCode(req, res) {
    try {
        const { id } = req.params;
        await AppointmentService.sendConfirmationCode(id);
        res.json({ success: true, message: 'Код надіслано на email' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
  }

  async confirm(req, res) {
    try {
      const { id } = req.params;
      const { code } = req.body;

      const appointment = await AppointmentService.confirmAppointment(id, code);

      await sendAppointmentConfirmedEmail({
        email: appointment.guest_email,
        name: appointment.guest_name,
        doctor: `${appointment.last_name} ${appointment.first_name} ${appointment.middle_name}`,
        specialization: appointment.specialization,
        date: new Date(appointment.appointment_date).toLocaleDateString('uk-UA'),
        time: appointment.appointment_time.slice(0, 5),
        service: appointment.service_name || 'Консультація', 
        price: appointment.service_price || appointment.base_price, 
        duration: appointment.duration_minutes || 60
      });

      res.json({ success: true, message: 'Запис успішно підтверджено' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
  
  async checkCompleted(req, res) {
    try {
        const userId = req.user.id;
        const specialistId = Number(req.params.specialistId);
        const hasCompleted = await AppointmentService.hasCompletedAppointment(userId, specialistId);
        res.json({ success: true, hasCompleted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

}

export default new AppointmentController();