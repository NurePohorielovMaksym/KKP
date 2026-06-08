import RehabilitationTypeRepository from './rehabilitation-type.repository.js';

class RehabilitationTypeService {
  async getAllTypes() {
    return await RehabilitationTypeRepository.getAll();
  }

  async createType(data) {
    if (data.duration_minutes <= 0) {
      throw new Error('Тривалість має бути більше 0');
    }
    return await RehabilitationTypeRepository.create(data);
  }

  async updateType(id, data) {
    const exists = await RehabilitationTypeRepository.getById(id);
    if (!exists) {
      throw new Error('Тип реабілітації не знайдено');
    }
    return await RehabilitationTypeRepository.update(id, data);
  }

  async deleteType(id) {
  const deletedType = await RehabilitationTypeRepository.delete(id);
  
  if (!deletedType) {
    throw new Error('Тип реабілітації не знайдено, видалення неможливе');
  }
  
  return deletedType;
}

async getBySpecialization(specialization) {
  return await RehabilitationTypeRepository.getBySpecialization(specialization);
}

async getTypesByCategory(category) {
  return await RehabilitationTypeRepository.getByCategory(category);
}

async getTypeById(id) {
    return await RehabilitationTypeRepository.getById(id);
  }

}

export default new RehabilitationTypeService();