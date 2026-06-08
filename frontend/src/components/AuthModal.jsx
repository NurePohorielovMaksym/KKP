import React, { useEffect, useRef, useState } from 'react';

const API_BASE = 'http://localhost:5000/api/auth';
const OTP_LENGTH = 4;

const createInitialFormData = () => ({
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  password: '',
  phone: '',
  newPassword: '',
  confirmPassword: '',
});

function AuthModal({ t, toggleLang, lang, onLoginSuccess, onClose }) {
  const [authMode, setAuthMode] = useState('signIn');
  const [formData, setFormData] = useState(createInitialFormData());
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef(
    Array.from({ length: OTP_LENGTH }, () => React.createRef())
  );

  useEffect(() => {
    if (authMode === 'otp') {
      otpRefs.current[0]?.current?.focus();
    }
  }, [authMode]);

  const resetState = () => {
    setAuthMode('signIn');
    setFormData(createInitialFormData());
    setOtp(Array(OTP_LENGTH).fill(''));
    setErrors({});
    setMessage('');
    setLoading(false);
  };

  const switchMode = (mode) => (e) => {
    e.preventDefault();
    setAuthMode(mode);
    setErrors({});
    setMessage('');
    if (mode !== 'otp') setOtp(Array(OTP_LENGTH).fill(''));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleOtpChange = (index, value) => {
    const next = value.replace(/\D/g, '').slice(-1);
    setOtp(prev => {
      const arr = [...prev];
      arr[index] = next;
      return arr;
    });
    setErrors(prev => ({ ...prev, otp: '' }));
    if (next && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.current?.focus();
    }
  };

  const validate = () => {
    const err = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    const hasUpperCase = /[A-Z]/;
    const hasNumber = /[0-9]/;

    if (authMode === 'signIn') {
      if (!formData.email.trim()) err.email = 'Введіть email';
      else if (!emailRegex.test(formData.email.trim())) err.email = 'Некоректний email';
      if (!formData.password) err.password = 'Введіть пароль';
    }

    if (authMode === 'signUp') {
      if (!formData.firstName.trim()) err.firstName = "Ім'я є обов'язковим";
      if (!formData.lastName.trim()) err.lastName = "Прізвище є обов'язковим";
      if (!formData.middleName.trim()) err.middleName = "По батькові є обов'язковим";
      if (!formData.email.trim()) err.email = 'Введіть email';
      else if (!emailRegex.test(formData.email.trim())) err.email = 'Некоректний email';
      if (!formData.password) err.password = 'Введіть пароль';
      else if (formData.password.length < 8) err.password = 'Мінімум 8 символів';
      else if (!hasUpperCase.test(formData.password)) err.password = 'Хоча б одна велика літера';
      else if (!hasNumber.test(formData.password)) err.password = 'Хоча б одна цифра';
      if (formData.phone && !phoneRegex.test(formData.phone.trim())) err.phone = 'Некоректний формат';
    }

    if (authMode === 'forgot') {
      if (!formData.email.trim()) err.email = 'Введіть email';
      else if (!emailRegex.test(formData.email.trim())) err.email = 'Некоректний email';
    }

    if (authMode === 'reset') {
      if (!formData.newPassword) err.newPassword = 'Введіть новий пароль';
      else if (formData.newPassword.length < 8) err.newPassword = 'Мінімум 8 символів';
      else if (!hasUpperCase.test(formData.newPassword)) err.newPassword = 'Хоча б одна велика літера';
      else if (!hasNumber.test(formData.newPassword)) err.newPassword = 'Хоча б одна цифра';
      if (!formData.confirmPassword) err.confirmPassword = 'Підтвердіть пароль';
      else if (formData.newPassword !== formData.confirmPassword) err.confirmPassword = 'Паролі не збігаються';
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const endpoints = {
      signIn: { url: '/login', body: { email: formData.email.trim(), password: formData.password } },
      signUp: { url: '/register', body: { firstName: formData.firstName.trim(), lastName: formData.lastName.trim(), middleName: formData.middleName.trim(), email: formData.email.trim(), password: formData.password, phone: formData.phone.trim() } },
      forgot: { url: '/forgot-password', body: { identifier: formData.email.trim() } },
      reset:  { url: '/reset-password', body: { token: otp.join(''), newPassword: formData.newPassword } },
    };

    const { url, body } = endpoints[authMode];

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessageType('error');
        setMessage(data.message || 'Сталася помилка. Перевірте дані.');
        return;
      }

      if (authMode === 'signIn') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user)
        setMessage('✅ Успішно авторизовано');
        setMessageType('success');
        setTimeout(() => { onClose(); resetState(); }, 1000);
        window.location.reload();
        return;
      }

      if (authMode === 'signUp') {
        setMessageType('success');
        setMessage('Реєстрація успішна 🎉');
        setTimeout(() => { setAuthMode('signIn'); setFormData(createInitialFormData()); setMessage(''); }, 1000);
        return;
      }

      if (authMode === 'forgot') {
        setMessageType('success');
        setMessage(data.message || 'Код надіслано на email.');
        setTimeout(() => { setAuthMode('otp'); setMessage(''); }, 1000);
      }

      if (authMode === 'reset') {
        setMessageType('success');
        setMessage('Пароль змінено 🔐');
        setTimeout(() => { setAuthMode('signIn'); setFormData(createInitialFormData()); setOtp(Array(OTP_LENGTH).fill('')); setMessage(''); }, 1000);
      }

    } catch {
      setMessage("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpContinue = async (e) => {
    e.preventDefault();
    if (otp.some(d => !d)) {
      setErrors(prev => ({ ...prev, otp: 'Введіть усі цифри коду' }));
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp.join('') }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(prev => ({ ...prev, otp: data.message || 'Невірний код' }));
        return;
      }
      setErrors(prev => ({ ...prev, otp: '' }));
      setAuthMode('reset');
    } catch {
      setErrors(prev => ({ ...prev, otp: "Помилка з'єднання" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-sign-in" >
      <div className="modal-sign-in" >

        <div className="sign-in-up-buttons">
          <button type="button" onClick={toggleLang} className="language form-lang">
            {lang === 'ua'
              ? <><span className="text-ua">УКР</span><span className="text-slash">/</span><span className="text-eng">ENG</span></>
              : <><span className="text-eng">ENG</span><span className="text-slash">/</span><span className="text-ua">УКР</span></>
            }
          </button>
          <button className="close-button" type="button" onClick={() => { onClose(); resetState(); }}>
            <svg className="icon close" width="12" height="12">
              <use href="/icons.svg#close"></use>
            </svg>
          </button>
        </div>

        <div className="sign-in-div-text">
          <p className="logo logo-header sign-up">Kine<span className="span-logo">tra</span></p>
          <h3 className="sign-in-h3">
            {authMode === 'signIn' && t.sign_in_form_h3}
            {authMode === 'signUp' && t.sign_up_form_h3}
            {authMode === 'forgot' && t.forgot_pass_form_h3}
            {authMode === 'otp'    && t.otp_form_h3}
            {authMode === 'reset'  && t.reset_form_h3}
          </h3>
          <p className="sign-in-form-paragraph">
            {authMode === 'signIn' && t.sign_in_form_paragraph}
            {authMode === 'signUp' && t.sign_up_form_paragraph}
            {authMode === 'forgot' && t.forgot_pass_form_paragraph}
            {authMode === 'otp'    && t.otp_form_paragraph}
            {authMode === 'reset'  && t.reset_form_paragraph}
          </p>
        </div>

        {message && <div className={`form-message ${messageType}`}>{message}</div>}

        <form className="sign-in-form" onSubmit={handleSubmit}>

          {authMode === 'signIn' && <>
            <label className="sign-in-label">
              {t.sign_in_form_label_email}
              <input className={`sign-in-type ${errors.email ? 'input-error' : ''}`} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t.sign_in_form_label_email} autoComplete="email" />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </label>
            <label className="sign-in-label">
              {t.sign_in_form_label_password}
              <input className={`sign-in-type ${errors.password ? 'input-error' : ''}`} type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="********" autoComplete="current-password" />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </label>
            <a href="#" className="forgot-pass" onClick={switchMode('forgot')}>{t.sign_in_form_forgot_password}</a>
            <button className="sign-in-button" type="submit" disabled={loading}>{loading ? '...' : t.sbmt_btn}</button>
            <div className="to-sign-up-div">
              <p className="p-to-sign-up">{t.sign_in_form_dont_have_acc}</p>
              <a href="#" className="link-to-sign-up" onClick={switchMode('signUp')}>{t.sign_up_form_h3}</a>
            </div>
          </>}

          {authMode === 'signUp' && <>
            <label className="sign-in-label">{t.sign_up_label_name}<input className={`sign-in-type ${errors.firstName ? 'input-error' : ''}`} type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t.sign_up_label_name} autoComplete="given-name" />{errors.firstName && <span className="error-text">{errors.firstName}</span>}</label>
            <label className="sign-in-label">{t.sign_up_label_second_name}<input className={`sign-in-type ${errors.lastName ? 'input-error' : ''}`} type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t.sign_up_label_second_name} autoComplete="family-name" />{errors.lastName && <span className="error-text">{errors.lastName}</span>}</label>
            <label className="sign-in-label">{t.sign_up_label_middle_name}<input className={`sign-in-type ${errors.middleName ? 'input-error' : ''}`} type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} placeholder={t.sign_up_label_middle_name} />{errors.middleName && <span className="error-text">{errors.middleName}</span>}</label>
            <label className="sign-in-label">{t.sign_in_form_label_email}<input className={`sign-in-type ${errors.email ? 'input-error' : ''}`} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t.sign_in_form_label_email} autoComplete="email" />{errors.email && <span className="error-text">{errors.email}</span>}</label>
            <label className="sign-in-label">{t.sign_in_form_label_password}<input className={`sign-in-type ${errors.password ? 'input-error' : ''}`} type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="********" autoComplete="new-password" />{errors.password && <span className="error-text">{errors.password}</span>}</label>
            <label className="sign-in-label">{t.sign_up_label_phone}<input className={`sign-in-type ${errors.phone ? 'input-error' : ''}`} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+380 11 111 11 11" autoComplete="tel" />{errors.phone && <span className="error-text">{errors.phone}</span>}</label>
            <button className="sign-in-button" type="submit" disabled={loading}>{loading ? '...' : t.sbmt_btn}</button>
            <div className="to-sign-up-div">
              <p className="p-to-sign-up">{t.already_have_acc}</p>
              <a href="#" className="link-to-sign-up" onClick={switchMode('signIn')}>{t.sign_in_form_h3}</a>
            </div>
          </>}

          {authMode === 'forgot' && <>
            <label className="sign-in-label">
              {t.sign_in_form_label_email}
              <input className={`sign-in-type ${errors.email ? 'input-error' : ''}`} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@mail.com" autoComplete="email" />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </label>
            <button className="sign-in-button" type="submit" disabled={loading}>{loading ? '...' : t.sbmt_btn}</button>
            <button className="back-to-login" type="button" onClick={switchMode('signIn')}>← {t.back_to_login}</button>
          </>}

          {authMode === 'otp' && <>
            <div className="otp-div">
              {otp.map((digit, index) => (
                <input key={index} ref={otpRefs.current[index]} className={`sign-in-type otp-input ${errors.otp ? 'input-error' : ''}`} type="text" inputMode="numeric" pattern="\d*" maxLength="1" value={digit} onChange={e => handleOtpChange(index, e.target.value)} onKeyDown={e => handleOtpKeyDown(index, e)} />
              ))}
            </div>
            {errors.otp && <span className="error-text">{errors.otp}</span>}
            <button className="sign-in-button" type="button" onClick={handleOtpContinue} disabled={loading}>{loading ? '...' : t.sbmt_btn}</button>
            <button className="back-to-login" type="button" onClick={switchMode('forgot')}>{t.back}</button>
          </>}

          {authMode === 'reset' && <>
            <label className="sign-in-label">
              {t.label_new_password}
              <input className={`sign-in-type ${errors.newPassword ? 'input-error' : ''}`} type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="********" autoComplete="new-password" />
              {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
            </label>
            <label className="sign-in-label">
              {t.label_confirm_password}
              <input className={`sign-in-type ${errors.confirmPassword ? 'input-error' : ''}`} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="********" autoComplete="new-password" />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </label>
            <button className="sign-in-button" type="submit" disabled={loading}>{loading ? '...' : t.sbmt_btn}</button>
            <button className="back-to-login" type="button" onClick={switchMode('otp')}>{t.back}</button>
          </>}

        </form>
      </div>
    </div>
  );
}

export default AuthModal;