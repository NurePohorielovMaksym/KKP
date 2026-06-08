import reviewService from './review.service.js';

const reviewController = {

  async getBySpecialist(req, res) {
    try {
      const { specialistId } = req.params;
      const data = await reviewService.getBySpecialist(Number(specialistId));
      res.json({ success: true, ...data });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async create(req, res) {
    try {
      const userId = req.user.id;
      const specialistId = Number(req.params.specialistId);
      const { rating, comment } = req.body;

      const review = await reviewService.create({ userId, specialistId, rating: Number(rating), comment });
      res.status(201).json({ success: true, review });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async adminDelete(req, res) {
    try {
      const { id } = req.params;
      await reviewService.adminDelete(Number(id));
      res.json({ success: true, message: 'Відгук видалено' });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  async userDelete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await reviewService.userDelete(Number(id), userId);
      res.json({ success: true, message: 'Відгук видалено' });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },
};

export default reviewController;