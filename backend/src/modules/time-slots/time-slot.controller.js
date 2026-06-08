import TimeSlotService from './time-slot.service.js';

class TimeSlotController {
  
  async generateStandard(req, res) {
    try {
      const { specialistId } = req.params;
      const schedule = await TimeSlotService.generateStandardSchedule(specialistId);
      
      res.status(201).json({ 
        success: true, 
        message: "Базовий графік (5/2, 10:00-18:00) успішно згенеровано", 
        data: schedule 
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getBySpecialist(req, res) {
    try {
      const { specialistId } = req.params;
      const schedule = await TimeSlotService.getSchedule(specialistId);
      
      res.status(200).json({ success: true, data: schedule });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateDate(req, res) {
    try {
      const { specialistId } = req.params;
      const exceptionData = req.body;
      
      const result = await TimeSlotService.setSpecificDateException(specialistId, exceptionData);
      
      const message = result.action === 'inserted' 
        ? "Виняток для графіка успішно створено" 
        : "Існуючий виняток для цієї дати оновлено";

      res.status(200).json({ 
        success: true, 
        message, 
        data: result.record 
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getDailySchedule(req, res) {
  try {
    const { specialistId } = req.params;
    const { date } = req.query; 

    if (!date) {
      return res.status(400).json({ success: false, message: "Параметр date обов'язковий" });
    }

    const schedule = await TimeSlotService.getScheduleForDate(specialistId, date);
    
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(
    error.message.includes('не налаштований')
        ? 404
        : 400
    ).json({ success: false, message: error.message });
  }
}

async updateTemplate(req, res) {
  try {
    const { specialistId, dayOfWeek } = req.params;
    const updateData = req.body;

    const result = await TimeSlotService.updateTemplate(specialistId, dayOfWeek, updateData);

    res.json({
      success: true,
      message: `Шаблон для дня №${dayOfWeek} успішно оновлено назавжди`,
      data: result
    });
  } catch (error) {
    res.status(error.message.includes('не знайдено') ? 404 : 400).json({
      success: false,
      message: error.message
    });
  }
}

async getAvailableSlots(req, res) {
    try {
        const { specialistId } = req.params;
        const weeks = parseInt(req.query.weeks) || 2;

        const slots = await TimeSlotService.getAvailableSlotsForPeriod(specialistId, weeks);

        res.json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

}

export default new TimeSlotController();