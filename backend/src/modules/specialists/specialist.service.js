import SpecialistRepository from './specialist.repository.js';

class SpecialistService {
  async getAllSpecialists() {
    return await SpecialistRepository.findAll();
  }

  async getSpecialistById(id) {
    const specialist = await SpecialistRepository.findById(id);
    if (!specialist) {
      throw new Error('Спеціаліста не знайдено');
    }
    return specialist;
  }

  async updateSpecialistProfile(id, data) {
    await this.getSpecialistById(id);
    return await SpecialistRepository.updateProfile(id, data);
  }

async getSpecializationsList() {
  return await SpecialistRepository.getUniqueSpecializations();
}
}

export default new SpecialistService();