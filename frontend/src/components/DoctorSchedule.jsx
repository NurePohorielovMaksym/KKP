import React, { useEffect, useMemo, useState, useRef } from 'react';
import './DoctorSchedule.css';
import Toast from './Toast.jsx';
import { useToast } from '../hooks/useToast.js';

const DAY_NAMES = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTH_NAMES = ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв', 'Лип', 'Серп', 'Вер', 'Жовт', 'Лист', 'Груд'];
const DAYS_PER_PAGE = 7;

const isPastSlot = (dateStr, timeStr) => {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const slotDate = new Date(dateStr);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate <= now;
};

const isToday = (dateStr) => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

const createEmptyOtp = () => ['', '', '', ''];

const getUserDataFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    return {
      id: payload.id || payload.userId || payload.sub,
      email: payload.email,
      name: payload.name || payload.firstName || payload.given_name || '',
      phone: payload.phone || payload.phone_number || '',
      role: payload.role || ''
    };
  } catch (error) {
    console.error("Помилка декодування токена:", error);
    return null;
  }
};

function DoctorSchedule({ specialistId, price, specialistName, specialization, onScheduleLoad }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pageStart, setPageStart] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState("+380");
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [appointmentId, setAppointmentId] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState(createEmptyOtp());
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [freedSlots, setFreedSlots] = useState(new Set());
  const scheduleRef = useRef([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);
  const { toasts, showToast } = useToast();

  const [slideDir, setSlideDir] = useState(null);

const handlePrev = () => {
  if (pageStart <= 0) return;
  
  setSlideDir('right');
  
  setPageStart(v => v - 7);
  
  setTimeout(() => {
    setSlideDir(null);
  }, 400); 
};

const handleNext = () => {
  setSlideDir('left');
  setPageStart(v => v + 7);
  
  setTimeout(() => {
    setSlideDir(null);
  }, 400);
};

  const fetchSchedule = async (isInitial = false) => {
    if (!specialistId) return;
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await fetch(`http://localhost:5000/api/time-slots/${specialistId}/available?weeks=3`);
      const data = await response.json();
      const slots = data.data ?? [];

      const newlyFreed = new Set();
      scheduleRef.current.forEach(oldDay => {
        oldDay.slots.forEach(oldSlot => {
          if (!oldSlot.available && oldSlot.status === 'pending') {
            const newDay = slots.find(d => d.date === oldDay.date);
            const newSlot = newDay?.slots.find(s => s.time === oldSlot.time);
            if (newSlot?.available) {
              newlyFreed.add(`${oldDay.date}|${oldSlot.time}`);
            }
          }
        });
      });

      if (newlyFreed.size > 0) {
        setFreedSlots(newlyFreed);
        setTimeout(() => setFreedSlots(new Set()), 900);
      }

      scheduleRef.current = slots;
      setSchedule(slots);
      if (onScheduleLoad) onScheduleLoad(slots.length > 0);
    } catch (error) {
      showToast('Помилка завантаження розкладу', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
  if (!isModalOpen || !isAuthenticated) return;

  const userData = getUserDataFromToken();
  if (!userData?.id) return;

  fetch(`http://localhost:5000/api/users/${userData.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      const user = data.data ?? data;
      const fullName = [user.last_name, user.first_name, user.middle_name]
        .filter(Boolean)
        .join(' ');
      if (fullName) setGuestName(fullName);
      if (user.email) setGuestEmail(user.email);
      if (user.phone) setGuestPhone(user.phone);
    })
    .catch(() => {});
}, [isModalOpen, isAuthenticated]);

  useEffect(() => {
  if (!isModalOpen || !specialization) return;
  fetch(`http://localhost:5000/api/rehabilitation-types/by-specialization/${encodeURIComponent(specialization)}`)
    .then(r => r.json())
    .then(d => { if (d.success) setServiceOptions(d.data); });
}, [isModalOpen, specialization]);

  useEffect(() => {
    fetchSchedule(true);
  }, [specialistId]);

  useEffect(() => {
    let timer;
    if (showOtp && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && showOtp) {
      setOtpError('Час вичерпано. Спробуйте створити новий запис.');
      if (appointmentId) {
        fetch(`http://localhost:5000/api/appointments/${appointmentId}`, { method: 'DELETE' })
          .finally(() => fetchSchedule());
      }
      setTimeout(() => {
        setShowOtp(false);
        setAppointmentId(null);
        setOtpCode(createEmptyOtp());
        setOtpError('');
        setSelected(null);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [showOtp, timeLeft, appointmentId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const visibleDays = useMemo(() => {
    if (schedule.length === 0 && !loading) return [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < DAYS_PER_PAGE; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + pageStart + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${d}`;
      const existingData = schedule.find((item) => item.date === dateStr);
      days.push({
        date: dateStr,
        slots: existingData ? existingData.slots : [],
      });
    }
    return days;
  }, [schedule, pageStart, loading]);

  const allTimes = useMemo(() => {
    const timesSet = new Set();
    schedule.forEach((day) => {
      day.slots.forEach((slot) => timesSet.add(slot.time));
    });
    return Array.from(timesSet).sort();
  }, [schedule]);

  const visibleTimes = showAll ? allTimes : allTimes.slice(0, 8);

  const validateBookingForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()\u2060]{7,20}$/;

    if (!guestName.trim()) errors.name = "Ім'я є обов'язковим";
    if (!phoneRegex.test(guestPhone.trim())) errors.phone = 'Некоректний формат телефону';
    if (!guestEmail.trim()) {
      errors.email = "Електронна пошта є обов'язковою";
    } else if (!emailRegex.test(guestEmail.trim())) {
      errors.email = 'Некоректний формат email';
    }
    return errors;
  };

  const handleBooking = async () => {
  if (!selected) return;
  const errors = validateBookingForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  setFormErrors({});
  setIsSubmitting(true);
  const userData = getUserDataFromToken();

  try {
    const response = await fetch('http://localhost:5000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        specialist_id: specialistId,
        appointment_date: selected.date,
        appointment_time: selected.time,
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail,
        user_id: userData?.id || null,
        rehabilitation_type_id: selectedService ? Number(selectedService) : null,
        status: 'pending',
        notes: '',
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      showToast(result.message || 'Помилка створення запису', 'error');
      return;
    }

    const newId = result?.data?.id;

    if (userData?.role === 'admin') {
      await fetch(`http://localhost:5000/api/appointments/${newId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'confirmed' }),
  });

  // надсилаємо лист з інформацією про запис
  await fetch(`http://localhost:5000/api/appointments/${newId}/send-code`, { 
    method: 'POST' 
  });

  await fetchSchedule();
  setIsModalOpen(false);
  setSelected(null);
  showToast('Запис підтверджено! ✅', 'success', 5000);
  showToast('Письмо з інформацією про запис надіслано на вашу пошту 📩', 'info', 5000);
    } else {
      setAppointmentId(newId);
      setTimeLeft(300);
      setShowOtp(true);
      showToast('Код підтвердження надіслано на вашу пошту 📩', 'info');
      await fetch(`http://localhost:5000/api/appointments/${newId}/send-code`, { method: 'POST' });
      await fetchSchedule();
      setIsModalOpen(false);
    }
  } catch (error) {
    showToast("Помилка з'єднання з сервером", 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleOtpConfirm = async () => {
    const code = otpCode.join('');
    if (code.length < 4) {
      setOtpError('Введіть всі 4 цифри');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (!response.ok) {
        setOtpError(data.message || 'Невірний код');
        return;
      }

      await fetchSchedule();
      setShowOtp(false);
      setSelected(null);
      setOtpCode(createEmptyOtp());
      showToast('Запис підтверджено!', 'success', 5000);
      showToast('Письмо з інформацією про запис надіслано на вашу пошту 📩', 'info', 5000);
    } catch (error) {
      showToast("Помилка з'єднання", 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ds-card">
        <div className="ds-loading">Завантаження розкладу...</div>
      </div>
    );
  }

  return (
    <div className="ds-card">
      <Toast toasts={toasts} />
      <h2 className="ds-title">Запис на прийом/ консультація</h2>

      {price && (
        <div className="ds-price-block">
          <p className="ds-price-label">Умови прийому</p>
          <div className="ds-price-row">
            <span className="ds-price-dot green"></span>
            <span className="ds-price-value">{price} грн</span>
          </div>
          <span className="ds-price-tag">Платний прийом</span>
        </div>
      )}

      {visibleDays.length === 0 ? (
        <div className="ds-empty">Розклад не знайдено</div>
      ) : (
        <>
          <div className="ds-table-wrapper">
            <button className="ds-arrow" onClick={handlePrev} disabled={pageStart <= 0}>‹</button>

            <div className={`ds-table ${slideDir ? `ds-slide-${slideDir}` : ''}`}>
              <div className="ds-header-row">
                {visibleDays.map((day) => {
                  const date = new Date(day.date);
                  const today = isToday(day.date);
                  return (
                    <div key={day.date} className={`ds-col-header ${today ? 'ds-col-today' : ''}`}>
                      <span className="ds-col-dayname">{today ? 'Сьогодні' : DAY_NAMES[date.getDay()]}</span>
                      <span className="ds-col-date">{date.getDate()} {MONTH_NAMES[date.getMonth()]}</span>
                    </div>
                  );
                })}
              </div>

              {visibleTimes.length === 0 ? (
                <div className="ds-no-slots">На цей тиждень запис відсутній</div>
              ) : (
                visibleTimes.map((time) => (
                  <div key={time} className="ds-time-row">
                    {visibleDays.map((day) => {
                      const slot = day.slots.find((s) => s.time === time);
                      const past = isPastSlot(day.date, time);
                      const isSelected = selected?.date === day.date && selected?.time === time;
                      const isFreed = freedSlots.has(`${day.date}|${time}`);

                      if (!slot) return <div key={day.date} className="ds-cell ds-cell--empty">—</div>;

                      if (!slot.available || past) {
                        return (
                          <div key={day.date} className="ds-cell ds-cell--empty">
                            <span className={slot.status === 'pending' ? 'ds-cell pending' : 'ds-cell taken'}>
                              {time.slice(0, 5)}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={day.date}
                          className={`ds-cell ds-cell--slot ${isSelected ? 'ds-cell--selected' : ''} ${isFreed ? 'ds-cell--freed' : ''}`}
                          onClick={() => setSelected(isSelected ? null : { date: day.date, time })}
                        >
                          {time.slice(0, 5)}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          <button className="ds-arrow" onClick={handleNext}>›</button>
          </div>

          {allTimes.length > 8 && (
            <button className="ds-toggle-btn" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Показати менше ∧' : 'Показати більше ∨'}
            </button>
          )}

          {selected && !showOtp && (
            <div className="ds-confirm">
              <span className="ds-confirm-text">
                Обрано: <strong>{new Date(selected.date).toLocaleDateString('uk-UA')}</strong> о <strong>{selected.time.slice(0, 5)}</strong>
              </span>
              <button className="ds-confirm-btn" onClick={() => setIsModalOpen(true)}>
                  {getUserDataFromToken()?.role === 'admin' ? 'Підтвердити запис' : 'Записатися'}
              </button>
              <button className="ds-cancel-btn" onClick={() => setSelected(null)}>Скасувати</button>
            </div>
          )}
        </>
      )}

      {showOtp && (
        <div className="ds-otp-block">
          <p className="ds-otp-text">Код підтвердження надіслано на пошту 📩. Введіть його протягом 5 хвилин:</p>
          <div className={`ds-otp-timer ${timeLeft < 60 ? 'ds-timer-urgent' : ''}`} style={{ color: timeLeft < 60 ? '#dc2626' : '#166534', fontWeight: 'bold' }}>
            {formatTime(timeLeft)}
          </div>
          <div className="ds-otp-inputs">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                className="ds-otp-input"
                type="text"
                maxLength="1"
                value={digit}
                disabled={timeLeft === 0 || otpLoading}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(-1);
                  const next = [...otpCode];
                  next[index] = val;
                  setOtpCode(next);
                  if (val && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
                }}
              />
            ))}
          </div>
          {otpError && <p className="ds-otp-error" style={{ color: '#dc2626' }}>{otpError}</p>}
          <button className="ds-submit-btn" onClick={handleOtpConfirm} disabled={otpLoading || timeLeft === 0 || otpCode.some(d => !d)}>
            {otpLoading ? 'Перевірка...' : 'Підтвердити'}
          </button>
        </div>
      )}

      {isModalOpen && !showOtp && (
        <div className="ds-modal-overlay">
          <div className="ds-modal-content">
            <button className="ds-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            <h2 className="ds-modal-title">Запис на прийом</h2>
            <div className="ds-appointment-info">
              <p><strong>Лікар:</strong> {specialization}</p>
              <p><strong>ПІБ:</strong> {specialistName}</p>
              <p><strong>Дата:</strong> {new Date(selected.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} о {selected.time.slice(0, 5)}</p>
            </div>

            <div className="ds-form">
              <div className="ds-input-group">
                <label>Ваше ім'я*</label>
                <input 
                  type="text" 
                  value={guestName} 
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    setFormErrors(prev => ({ ...prev, name: '' }));
                  }} 
                  placeholder="Олександр" 
                />
                {formErrors.name && <span className="ds-field-error">{formErrors.name}</span>}
              </div>

              <div className="ds-input-group">
                <label>Ваш номер телефону*</label>
                <input 
                  type="tel" 
                  value={guestPhone} 
                  onChange={(e) => {
                    setGuestPhone(e.target.value);
                    setFormErrors(prev => ({ ...prev, phone: '' }));
                  }} 
                  placeholder="+380..." 
                />
                {formErrors.phone && <span className="ds-field-error">{formErrors.phone}</span>}
              </div>

              <div className="ds-input-group">
                <label>Електронна пошта*</label>
                <input 
                  type="email" 
                  value={guestEmail} 
                  onChange={(e) => {
                    setGuestEmail(e.target.value);
                    setFormErrors(prev => ({ ...prev, email: '' }));
                  }} 
                  placeholder="name@example.com" 
                />
                {formErrors.email && <span className="ds-field-error">{formErrors.email}</span>}
              </div>
              
  <div className="ds-input-group">
    <label>Послуга</label>
    <select
      className="ds-select"
      value={selectedService ?? ''}
      onChange={e => setSelectedService(e.target.value || null)}
    >
      <option value="">Консультація —  {Number(price).toLocaleString('uk-UA')} ₴ (60 хв)</option>
      {serviceOptions.map(s => (
        <option key={s.id} value={s.id}>
          {s.name} — {Number(s.price).toLocaleString('uk-UA')} ₴ ({s.duration_minutes} хв)
        </option>
      ))}
    </select>
  </div>
              <div className="ds-info-box">
                <span>ℹ️</span>
                <p>На вказану пошту буде надіслано 4-значний код для підтвердження запису.</p>
              </div>

              <button 
                className="ds-submit-btn" 
                onClick={handleBooking} 
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? 'Обробка...' : 'ДАЛІ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorSchedule;