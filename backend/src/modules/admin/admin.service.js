import AdminRepo from './admin.repository.js';

class AdminService {

  async getDashboard() {
    const [stats, appointmentsChart, usersChart, topSpecialists, recentAppointments] = await Promise.all([
      AdminRepo.getDashboardStats(),
      AdminRepo.getAppointmentsPerMonth(),
      AdminRepo.getNewUsersPerMonth(),
      AdminRepo.getTopSpecialists(5),
      AdminRepo.getRecentAppointments(10),
    ]);

    return { stats, appointmentsChart, usersChart, topSpecialists, recentAppointments };
  }

  async getAppointments(filters) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    return await AdminRepo.getAllAppointments({ ...filters, page, limit });
  }

  async updateAppointmentStatus(id, status) {
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) throw new Error('Недопустимий статус');
    const result = await AdminRepo.updateAppointmentStatus(id, status);
    if (!result) throw new Error('Запис не знайдено');
    return result;
  }

  async deleteAppointment(id) {
    const result = await AdminRepo.deleteAppointment(id);
    if (!result) throw new Error('Запис не знайдено');
    return result;
  }

  async getUsers(filters) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    return await AdminRepo.getAllUsers({ ...filters, page, limit });
  }

  async getUserById(id) {
    const user = await AdminRepo.getUserById(id);
    if (!user) throw new Error('Користувача не знайдено');
    return user;
  }

  async updateUserRole(id, role) {
    const allowed = ['patient', 'doctor', 'admin'];
    if (!allowed.includes(role)) throw new Error('Недопустима роль');
    const result = await AdminRepo.updateUserRole(id, role);
    if (!result) throw new Error('Користувача не знайдено');
    return result;
  }

  async deleteUser(id) {
    const result = await AdminRepo.deleteUser(id);
    if (!result) throw new Error('Користувача не знайдено');
    return result;
  }

  async getSpecialists() {
    return await AdminRepo.getAllSpecialists();
  }

  async toggleSpecialist(specialistId, isActive) {
    const result = await AdminRepo.toggleSpecialistActive(specialistId, isActive);
    if (!result) throw new Error('Спеціаліста не знайдено');
    return result;
  }
}

export default new AdminService();