import AppointmentRepo from './appointment.repository.js';
import crypto from 'crypto';
import { sendConfirmationCode } from '../../services/email.service.js';

class AppointmentService {
  // appointment.service.js

async createAppointment(data) {
    const { 
        user_id, guest_name, guest_phone, guest_email, 
        specialist_id, appointment_date, appointment_time 
    } = data;

    if (!user_id && (!guest_name || !guest_email)) {
        throw new Error('Необхідно вказати контактні дані для запису');
    }

    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    const now = new Date();
    const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (diffInHours < 0) throw new Error('Цей час уже минув');
    if (diffInHours < 2) throw new Error('Запис можливий мінімум за 2 години до початку');

    const totalActive = await AppointmentRepo.countTotalActive(user_id, guest_email);
    if (totalActive >= 2) {
        throw new Error('У вас вже є 2 активних записи. Новий запис буде доступний після завершення попередніх.');
    }

    const alreadyHasDocToday = await AppointmentRepo.hasAppointmentWithDoctorOnDate(
        user_id, guest_email, specialist_id, appointment_date
    );
    if (alreadyHasDocToday) {
        throw new Error('Ви вже записані до цього фахівця на цей день. Оберіть іншу дату.');
    }

    const hasConflict = await AppointmentRepo.checkUserTimeConflict(
        user_id, guest_email, appointment_date, appointment_time
    );
    if (hasConflict) {
        throw new Error('У вас вже є інший запис на цей самий час. Оберіть іншу годину.');
    }
    const doctorBusy = await AppointmentRepo.checkDoctorAvailability(
        specialist_id, appointment_date, appointment_time
    );
    if (doctorBusy) {
        throw new Error('Цей час у лікаря вже зайнятий іншим пацієнтом');
    }

    return await AppointmentRepo.create(data);
}

  async getAllAppointments() {
    return await AppointmentRepo.getAll();
  }

  async getAppointmentById(id) {
    const appointment = await AppointmentRepo.getById(id);
    if (!appointment) {
      throw new Error('Запис не знайдено');
    }
    return appointment;
  }

  async updateAppointment(id, data) {
    const existing = await AppointmentRepo.getById(id);
    if (!existing) {
      throw new Error('Запис не знайдено');
    }
    return await AppointmentRepo.update(id, data);
  }

  async deleteAppointment(id) {
    const deleted = await AppointmentRepo.delete(id);
    if (!deleted) {
      throw new Error('Запис не знайдено');
    }
    return deleted;
  }

  async sendConfirmationCode(appointmentId) {
    const appointment = await AppointmentRepo.getById(appointmentId);
    if (!appointment) throw new Error('Запис не знайдено');
    if (appointment.status !== 'pending') throw new Error('Запис вже підтверджено або скасовано');

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 10 * 60000); 

    await AppointmentRepo.setConfirmationCode(appointmentId, code, expires);

    const email = appointment.guest_email;
    if (email) {
        await sendConfirmationCode(email, code);
    }

    return { success: true };
}

async confirmAppointment(appointmentId, code) {
    const appointment = await AppointmentRepo.getByIdWithCode(appointmentId);
    if (!appointment) throw new Error('Запис не знайдено');
    if (appointment.confirmation_code !== code) throw new Error('Невірний код');
    if (new Date(appointment.confirmation_expires) < new Date()) {
      await AppointmentRepo.updateStatus(appointmentId, 'cancelled');
      throw new Error('Час дії коду вичерпано. Слот звільнено, спробуйте ще раз.');
    }

    return await AppointmentRepo.updateStatus(appointmentId, 'confirmed');
}

async hasCompletedAppointment(userId, specialistId) {
    return await AppointmentRepo.hasCompletedAppointment(userId, specialistId);
}

}

export default new AppointmentService();