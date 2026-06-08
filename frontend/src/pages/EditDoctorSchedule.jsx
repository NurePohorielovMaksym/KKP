import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from '../components/Breadcrumb.jsx';
import { useToast } from "../hooks/useToast.js"; 
import "./DoctorPage.css";

function EditDoctorSchedule({ t, toggleLang, lang }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toasts, showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [exceptionLoading, setExceptionLoading] = useState(false);

    const [schedule, setSchedule] = useState({
        1: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
        2: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
        3: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
        4: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
        5: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
        6: { isWorking: false, start: '00:00', end: '00:00', slot_duration: 60 },
        7: { isWorking: false, start: '00:00', end: '00:00', slot_duration: 60 },
    });

    const [exceptions, setExceptions] = useState([]);

    const [excDate, setExcDate] = useState('');
    const [excIsWorking, setExcIsWorking] = useState(false);
    const [excStart, setExcStart] = useState('09:00');
    const [excEnd, setExcEnd] = useState('14:00');
    const [excReason, setExcReason] = useState('Вихідний');

    const userJson = localStorage.getItem('user');
    let currentUser = null;
    try {
        if (userJson && userJson !== 'undefined') {
            currentUser = JSON.parse(userJson);
        }
    } catch (e) {
        console.error(e);
    }

    const token = localStorage.getItem('token');
    const userRole = currentUser?.role;
    const userSpecialistId = currentUser?.specialist_id;

    useEffect(() => {
        if (
            userRole !== 'admin' &&
            Number(userSpecialistId) !== Number(id)
        ) {
            showToast(
                "У вас немає прав для редагування розкладу",
                "error"
            );
            setTimeout(() => {
                navigate(`/doctors/${id}`);
            }, 2000);

            return;
        }

        loadSchedule();
    }, [id]);

    const loadSchedule = async () => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/time-slots/${id}`
            );
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message);
            }
            const baseSchedule = {
                1: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
                2: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
                3: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
                4: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
                5: { isWorking: true, start: '10:00', end: '18:00', slot_duration: 60 },
                6: { isWorking: false, start: '00:00', end: '00:00', slot_duration: 60 },
                7: { isWorking: false, start: '00:00', end: '00:00', slot_duration: 60 },
            };
            const fetchedExceptions = [];
            data.data.forEach(slot => {
                if (slot.specific_date) {
                    fetchedExceptions.push(slot);
                } else if (slot.day_of_week) {
                    baseSchedule[slot.day_of_week] = {
                        isWorking: slot.is_available,
                        start:
                            slot.start_time?.slice(0, 5) || '00:00',
                        end:
                            slot.end_time?.slice(0, 5) || '00:00',
                        slot_duration: slot.slot_duration || 60
                    };
                }
            });
            setSchedule(baseSchedule);
            setExceptions(fetchedExceptions);

        } catch (err) {
            console.error(err);
            showToast(
                "Помилка завантаження графіка",
                "error"
            );
        }
    };

    const handleDayChange = (day, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const handleWorkingToggle = (day, checked) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                isWorking: checked,

                start: checked
                    ? (
                        prev[day].start === '00:00'
                            ? '10:00'
                            : prev[day].start
                    )
                    : '00:00',

                end: checked
                    ? (
                        prev[day].end === '00:00'
                            ? '18:00'
                            : prev[day].end
                    )
                    : '00:00',
            }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const promises = Object.entries(schedule).map(
                async ([dayOfWeek, dayData]) => {

                    const body = {
                        is_available: dayData.isWorking,

                        start_time: dayData.isWorking
                            ? `${dayData.start}:00`
                            : '00:00:00',

                        end_time: dayData.isWorking
                            ? `${dayData.end}:00`
                            : '00:00:00',

                        slot_duration:
                            dayData.slot_duration || 60
                    };

                    const res = await fetch(
                        `http://localhost:5000/api/time-slots/${id}/template/${dayOfWeek}`,
                        {
                            method: 'PATCH',
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(body)
                        }
                    );
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        throw new Error(
                            data.message ||
                            `Помилка дня ${dayOfWeek}`
                        );
                    }
                    return data;
                }
            );
            
            await Promise.all(promises);
            showToast(
                "Розклад успішно збережено!",
                "success"
            );
            setTimeout(() => {
                navigate(`/doctors/${id}`);
            }, 1500);

        } catch (err) {
            console.error(err);

            showToast(
                err.message || "Помилка збереження",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAddException = async () => {
        if (!excDate) {
            showToast(
                "Оберіть дату",
                "error"
            );
            return;
        }
        if (
            excIsWorking &&
            excStart >= excEnd
        ) {
            showToast(
                "Некоректний час",
                "error"
            );
            return;
        }
        setExceptionLoading(true);

        try {
            const body = {
                specific_date: excDate,
                is_available: excIsWorking,
                start_time: excIsWorking
                    ? `${excStart}:00`
                    : '00:00:00',
                end_time: excIsWorking
                    ? `${excEnd}:00`
                    : '00:00:00',
                reason: excReason?.trim() || null,
                slot_duration: 60
            };

            const res = await fetch(
                `http://localhost:5000/api/time-slots/${id}/exceptions`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Помилка створення винятку"
                );
            }
            showToast(
                "Виняток додано!",
                "success"
            );
            await loadSchedule();
            setExcDate('');
            setExcIsWorking(false);
            setExcStart('09:00');
            setExcEnd('14:00');
            setExcReason('Вихідний');
            
        } catch (err) {
            console.error(err);
            showToast(
                err.message ||
                "Помилка сервера",
                "error"
            );
        } finally {
            setExceptionLoading(false);
        }
    };

    const daysTranslation = {
        1: 'Понеділок',
        2: 'Вівторок',
        3: 'Середа',
        4: 'Четвер',
        5: "П'ятниця",
        6: 'Субота',
        7: 'Неділя'
    };

    return (
        <>
            <Header t={t} toggleLang={toggleLang} lang={lang}/>
            <main className="doctor-page">
                <div className="container">
                    <Breadcrumb items={[
                        { label: 'Головна', path: '/' },
                        { label: 'Лікарі', path: '/doctors' },
                        { label: 'Сторінка лікаря', path: `/doctors/${id}` },
                        { label: 'Редагування розкладу' },
                    ]} />

                    <div className="dp-main-card" style={{flexDirection: 'column'}}>
                        
                        {/* --- БЛОК 1: Базовий розклад --- */}
                        <div style={{marginBottom: '30px'}}>
                            <h1 className="dp-name" style={{textAlign: 'center'}}>Базовий графік роботи</h1>
                            <p className="dp-bio-text" style={{ fontSize: '18px', marginBlock: '15px', textIndent: '40px'}}>Вкажіть стандартні робочі дні та години прийому.</p>

                            <div className="edit-profile-form" style={{marginTop: '20px'}}>
                                {Object.entries(schedule).map(([dayKey, dayData]) => (
                                    <div key={dayKey} className="schedule-day-row" style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
                                        <label className="schedule-checkbox" style={{display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px'}}>
                                            <input 
                                                type="checkbox" 
                                                checked={dayData.isWorking}
                                                onChange={(e) => handleWorkingToggle(dayKey, e.target.checked)}
                                            />
                                            <span style={{fontWeight: '600'}}>{daysTranslation[dayKey]}</span>
                                        </label>

                                        {dayData.isWorking ? (
                                            <div className="schedule-time-inputs" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                <input 
                                                    type="time" 
                                                    className="form-input time" 
                                                    value={dayData.start}
                                                    onChange={(e) => handleDayChange(dayKey, 'start', e.target.value)}
                                                    style={{}}
                                                />
                                                <span>—</span>
                                                <input 
                                                    type="time" 
                                                    className="form-input" 
                                                    value={dayData.end}
                                                    onChange={(e) => handleDayChange(dayKey, 'end', e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <span style={{color: '#9CA3AF', fontStyle: 'italic', paddingLeft: '10px', color: "black"}}>Вихідний</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr style={{border: '1px solid #E5E7EB', margin: '10px 0 30px 0'}}/>

                        {/* --- БЛОК 2: Винятки на конкретні дати --- */}
                        <div>
                            <h2 className="dp-bio-title" style={{fontSize: '32px', marginBottom: '10px', textAlign: 'center'}}>Винятки та вихідні</h2>
                            <p className="dp-bio-text" style={{fontSize: '18px', marginBlock: '20px', textIndent: '40px'}}>Додайте конкретну дату, якщо графік відрізняється від базового (наприклад, відпустка, свято або робоча субота).</p>
                            
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'end', background: '#F9FAFB', padding: '20px', borderRadius: '12px'}}>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                    <label style={{fontSize: '14px', fontWeight: '500', color: "black"}}>Дата</label>
                                    <input type="date" className="form-input" value={excDate} onChange={(e) => setExcDate(e.target.value)} />
                                </div>
                                
                                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                    <label style={{fontSize: '14px', fontWeight: '500', color: "black"}}>Тип дня</label>
                                    <select className="form-input" value={excIsWorking} onChange={(e) => setExcIsWorking(e.target.value === 'true')}>
                                        <option value="false" style={{color: "black"}}>Вихідний / Недоступний</option>
                                        <option value="true" style={{color: "black"}}>Робочий день</option>
                                    </select>
                                </div>

                                {excIsWorking && (
                                    <>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                            <label style={{fontSize: '14px', fontWeight: '500', color: "black"}}>Початок</label>
                                            <input type="time" className="form-input" value={excStart} onChange={(e) => setExcStart(e.target.value)} />
                                        </div>
                                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                            <label style={{fontSize: '14px', fontWeight: '500', color: "black"}}>Кінець</label>
                                            <input type="time" className="form-input" value={excEnd} onChange={(e) => setExcEnd(e.target.value)} />
                                        </div>
                                    </>
                                )}

                                <div style={{display: 'flex', flexDirection: 'column', gap: '5px', flexGrow: 1}}>
                                    <label style={{fontSize: '14px', fontWeight: '500', color: "black"}}>Причина (необов'язково)</label>
                                    <input type="text" className="form-input" placeholder="Відпустка, свято тощо" value={excReason} onChange={(e) => setExcReason(e.target.value)} />
                                </div>

                                <button 
                                    type="button" 
                                    onClick={handleAddException} 
                                    className="save-btn" 
                                    disabled={exceptionLoading} 
                                    style={{height: '42px', padding: '0 20px'}}
                                    >
                                    {exceptionLoading
                                        ? 'Додавання...'
                                        : '➕ Додати'}
                                </button>
                            </div>

                            {/* Список вже доданих винятків */}
                            {exceptions.length > 0 && (
                                <div style={{marginTop: '20px'}}>
                                    <h3 style={{fontSize: '16px', marginBottom: '10px', color: "black"}}>Заплановані зміни:</h3>
                                    <ul style={{listStyle: 'none', padding: 0}}>
                                        {exceptions.map((exc, idx) => (
                                            <li key={idx} style={{padding: '10px 15px', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
                                                <div>
                                                    <strong style={{color: '#159EEC'}}>{new Date(exc.specific_date).toLocaleDateString()}</strong> 
                                                    <span style={{marginLeft: '10px', color: "black"}}>{exc.is_available ? `Робочий (${exc.start_time?.slice(0,5)} - ${exc.end_time?.slice(0,5)})` : 'Вихідний'}</span>
                                                </div>
                                                {exc.reason && <span style={{color: '#6B7280', fontSize: '14px'}}>{exc.reason}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        {/* --- ГОЛОВНІ КНОПКИ ЗБЕРЕЖЕННЯ (У САМОМУ НИЗУ) --- */}
                        <div className="form-actions" style={{marginTop: '40px', borderTop: '1px solid #E5E7EB', paddingTop: '20px', display: 'flex', gap: '15px'}}>
                            <button type="button" onClick={handleSubmit} className="save-btn" disabled={loading} style={{padding: '14px 32px', fontSize: '16px'}}>
                                {loading ? 'Збереження...' : '💾 Зберегти розклад'}
                            </button>
                            <button type="button" onClick={() => navigate(`/doctors/${id}`)} className="cancel-btn" style={{padding: '14px 32px', fontSize: '16px'}}>
                                Скасувати
                            </button>
                        </div>

                    </div>
                </div>
            </main>

            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`custom-toast toast-${toast.type}`}>
                        {toast.message}
                    </div>
                ))}
            </div>

            <Footer t={t} toggleLang={toggleLang} lang={lang}/>
        </>
    );
}

export default EditDoctorSchedule;