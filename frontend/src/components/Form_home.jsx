import { useState, useEffect } from 'react';
import '../pages/Home.css'; 
import '../App.css'

const SERVICES_API = 'http://localhost:5000/api/rehabilitation-types';

const createInitialForm = () => ({
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
});

function AppointmentForm({ t }) {
  const [formData, setFormData] = useState(createInitialForm());
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(''); 
  const [sending, setSending] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch(SERVICES_API)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.length > 0) {
          setServices(d.data);
          setFormData(prev => ({ ...prev, service: String(d.data[0].id) }));
        }
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const err = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]+$/;

    if (!formData.name.trim()) err.name = "Введіть ім'я";
    if (!formData.email.trim()) err.email = 'Введіть email';
    else if (!emailRegex.test(formData.email.trim())) err.email = 'Некоректний email';
    if (!formData.phone.trim()) err.phone = 'Введіть телефон';
    else if (!phoneRegex.test(formData.phone.trim())) err.phone = 'Некоректний формат';

    return err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSending(true);

      const res = await fetch('http://localhost:5000/api/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: services.find(s => String(s.id) === formData.service)?.name ?? formData.service,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        return;
      }

      setStatus('success');
      setFormData(createInitialForm());

      setTimeout(() => setStatus(''), 4000);

    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section-form">
      <div className="container container-form">
        <div className="form-wrapper">
          <p className="form-title-text">kinetra</p>
          <h3 className="form-title">Запис на прийом</h3>

          <form className="form" onSubmit={handleSubmit}>
            <label >
              <p className="label">Повне ім'я</p>
              <div className={`input-wrapper ${errors.name ? 'input-wrapper--error' : ''}`}>
                <svg className="icon-form" width="18" height="24">
                  <use href="/icons.svg#frame1"></use>
                </svg>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </label>

            <label>
              <p className="label">Електронна пошта</p>
              <div className={`input-wrapper ${errors.email ? 'input-wrapper--error' : ''}`}>
                <svg className="icon-form email-icon" width="18" height="24">
                  <use href="/icons.svg#email"></use>
                </svg>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </label>

            <label>
              <p className="label">Номер телефону</p>
              <div className={`input-wrapper ${errors.phone ? 'input-wrapper--error' : ''}`}>
                <svg className="icon-form" width="18" height="24">
                  <use href="/icons.svg#phone"></use>
                </svg>
                <input
                  className="form-input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+380 11 111 11 11"
                />
              </div>
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </label>

            <label>
              <p className="label">Послуга</p>
              <div className="input-wrapper type">
                <svg className="icon-form" width="18" height="24">
                  <use href="/icons.svg#love"></use>
                </svg>
                <select
                  className="form-input type"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                >
                  {services.length === 0 && (
                    <option value="">Завантаження...</option>
                  )}
                  {services.map(s => (
                    <option key={s.id} value={String(s.id)}>{s.name}</option>
                  ))}
                </select>
              </div>
            </label>

            <label className="teaxtarea-wrapper">
              <textarea
                className="form-input teaxtarea"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Ваше повідомлення"
              />
            </label>

            {status === 'success' && (
              <p className="form-status form-status--success">
                ✅ Запис відправлено! Ми зв'яжемось з вами найближчим часом.
              </p>
            )}
            {status === 'error' && (
              <p className="form-status form-status--error">
                ❌ Помилка. Спробуйте ще раз або зателефонуйте нам.
              </p>
            )}

            <button className="form-button" type="submit" disabled={sending}>
              {sending ? 'Відправка...' : 'Відправити'}
            </button>
          </form>
        </div>

        <div className="image-wrapper-section-form" />
      </div>
    </section>
  );
}

export default AppointmentForm;