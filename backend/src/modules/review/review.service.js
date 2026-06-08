import reviewRepository from './review.repository.js';

const reviewService = {

  async getBySpecialist(specialistId) {
    const [reviews, stats] = await Promise.all([
      reviewRepository.getBySpecialist(specialistId),
      reviewRepository.getStats(specialistId),
    ]);
    return { reviews, stats };
  },

  async create({ userId, specialistId, rating, comment }) {
    if (!rating || rating < 1 || rating > 5) {
      throw { status: 400, message: 'Рейтинг має бути від 1 до 5' };
    }
    if (!comment || comment.trim().length < 5) {
      throw { status: 400, message: 'Коментар занадто короткий (мін. 5 символів)' };
    }
    if (comment.trim().length > 1000) {
      throw { status: 400, message: 'Коментар занадто довгий (макс. 1000 символів)' };
    }

    const hasVisited = await reviewRepository.hasCompletedAppointment(userId, specialistId);
    if (!hasVisited) {
      throw { status: 403, message: 'Відгук можна залишити лише після завершеного прийому' };
    }

    const existing = await reviewRepository.findExisting(userId, specialistId);
    if (existing) {
      throw { status: 409, message: 'Ви вже залишили відгук для цього лікаря' };
    }

    return reviewRepository.create({
      userId,
      specialistId,
      rating,
      comment: comment.trim(),
    });
  },

  async adminDelete(id) {
    const deleted = await reviewRepository.deleteById(id);
    if (!deleted) throw { status: 404, message: 'Відгук не знайдено' };
    return deleted;
  },

  async userDelete(id, userId) {
    const deleted = await reviewRepository.deleteOwn(id, userId);
    if (!deleted) throw { status: 404, message: 'Відгук не знайдено або не належить вам' };
    return deleted;
  },
};

export default reviewService;