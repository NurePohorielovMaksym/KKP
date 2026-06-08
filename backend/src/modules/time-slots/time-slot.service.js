import TimeSlotRepository from './time-slot.repository.js';
import AppointmentRepository from '../appointments/appointment.repository.js';

class TimeSlotService {
  
  async generateStandardSchedule(specialistId) {
    const standardSlots = [];
    
    for (let day = 1; day <= 7; day++) {

      if(day === 6 || day === 7){
        standardSlots.push({
        specialist_id: specialistId,
        day_of_week: day,
        start_time: '00:00:00',
        end_time: '00:00:00',
        is_available: false
      });
      } else {
      standardSlots.push({
        specialist_id: specialistId,
        day_of_week: day,
        start_time: '10:00:00',
        end_time: '18:00:00',
        is_available: true,
        slot_duration: 60
      });
    }
  }
    return await TimeSlotRepository.createWeeklySchedule(specialistId, standardSlots);
  }

  async getSchedule(specialistId) {
    return await TimeSlotRepository.getBySpecialistId(specialistId);
  }

  async getScheduleForDate(specialistId, dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); 
  
  let dayOfWeek = date.getDay();
  if (dayOfWeek === 0) dayOfWeek = 7;

  const slot = await TimeSlotRepository.findActiveSlot(specialistId, dateString, dayOfWeek);
  
  if (!slot) {
    throw new Error('Графік для цього спеціаліста не налаштований');
  }

  return slot;
}

async updateTemplate(specialistId, dayOfWeek, updateData) {
  const dayNum = parseInt(dayOfWeek);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 7) {
    throw new Error('Некоректний день тижня. Має бути від 1 до 7');
  }
  const updatedSlot = await TimeSlotRepository.updateTemplateSlot(specialistId, dayNum, updateData);
  if (!updatedSlot) {
    throw new Error('Базовий шаблон для цього дня не знайдено');
  }

  return updatedSlot;
}

async getAvailableSlotsForPeriod(specialistId, weeksAhead = 2) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + weeksAhead * 7);
    const result = [];

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        let dayOfWeek = d.getDay();
        if (dayOfWeek === 0) dayOfWeek = 7;

        const slot = await TimeSlotRepository.findActiveSlot(specialistId, dateStr, dayOfWeek);
        if (!slot || !slot.is_available) continue;

        const timeSlots = this._generateSlots(
            slot.start_time,
            slot.end_time,
            slot.slot_duration || 60
        );
        
        const booked = await AppointmentRepository.getBookedTimesBySpecialistAndDate(specialistId, dateStr);
        
        result.push({
            date: dateStr,
            dayOfWeek,
            slots: timeSlots.map((time) => {
                const appointment = booked.find(b => b.appointment_time === time);
                
                return {
                    time,
                    available: !appointment, 
                    status: appointment ? appointment.status : 'available' 
                };
            }),
        });
    }
    return result;
}

_generateSlots(startTime, endTime, durationMinutes) {
    const slots = [];
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    let current = sh * 60 + sm;
    const end = eh * 60 + em;

    while (current < end) {
        const h = String(Math.floor(current / 60)).padStart(2, '0');
        const m = String(current % 60).padStart(2, '0');
        slots.push(`${h}:${m}:00`);
        current += durationMinutes;
    }
    return slots;
}

async setSpecificDateException(specialistId, exceptionData) {
    if (!exceptionData.specific_date) {
        throw new Error('Необхідно вказати specific_date');
    }
    if (exceptionData.is_available === undefined) {
        throw new Error('Необхідно вказати is_available');
    }

    if (exceptionData.is_available === false) {
        const bookedTimes = await AppointmentRepository.getBookedTimesBySpecialistAndDate(
            specialistId, 
            exceptionData.specific_date
        );
        
        if (bookedTimes && bookedTimes.length > 0) {
            throw new Error("На цей день вже є записи. Зв'яжіться з адміністратором.");
        }
    }

    if (!exceptionData.is_available) {
        exceptionData.start_time = '00:00:00';
        exceptionData.end_time = '00:00:00';
    }
    
    if (
        exceptionData.is_available &&
        (
            !exceptionData.start_time ||
            !exceptionData.end_time
        )
    ) {
        throw new Error(
            'Для робочого дня треба start_time та end_time'
        );
    }
    
    if (!exceptionData.slot_duration) {
        exceptionData.slot_duration = 60;
    }
    
    return await TimeSlotRepository.upsertSpecificDate(
        specialistId,
        exceptionData
    );
}
}

export default new TimeSlotService();