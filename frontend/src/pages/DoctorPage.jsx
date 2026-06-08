import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../App.css";
import "./DoctorPage.css";
import Breadcrumb from '../components/Breadcrumb.jsx';
import DoctorSchedule from '../components/DoctorSchedule.jsx';
import ReviewsSection from '../components/ReviewSection.jsx';
import { useToast } from "../hooks/useToast.js";

function DoctorPage({ t, toggleLang, lang }) {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewStats, setReviewStats] = useState({ total: 0, average: 0 });

    const [hasSchedule, setHasSchedule] = useState(null);
    const [scheduleKey, setScheduleKey] = useState(0);
    const [creatingSchedule, setCreatingSchedule] = useState(false);

    const userJson = localStorage.getItem('user');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    const { toasts, showToast } = useToast();

    useEffect(() => {
        fetch(`http://localhost:5000/api/specialists/${id}`)
            .then(res => res.json())
            .then(data => {
                setDoctor(data.data ?? data);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, [id]);

    if (loading) return (
        <>
            <Header t={t} toggleLang={toggleLang} lang={lang}/>
            <main className="doctor-page-loading">Завантаження...</main>
        </>
    );

    if (!doctor) return (
        <>
            <Header t={t} toggleLang={toggleLang} lang={lang}/>
            <main className="doctor-page-loading">Лікаря не знайдено.</main>
            <Footer t={t} toggleLang={toggleLang} lang={lang}/>
        </>
    );

    const handleAddSchedule = async () => {
        if (creatingSchedule) return;
        const token = localStorage.getItem('token');
        setCreatingSchedule(true);
        try {
            const res = await fetch(
                `http://localhost:5000/api/time-slots/${doctor.specialist_id}/standard`,
                { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Не вдалося створити розклад');
            showToast('Розклад успішно створено!', 'success');
            await new Promise(resolve => setTimeout(resolve, 1200));
            setHasSchedule(true);
            setScheduleKey(prev => prev + 1);
        } catch (err) {
            showToast(err.message || 'Помилка при створенні розкладу', 'error');
        } finally {
            setCreatingSchedule(false);
        }
    };

    const isAdmin = currentUser?.role === 'admin';
    const isOwnProfile = currentUser?.role === 'doctor' && Number(currentUser?.specialist_id) === Number(doctor.specialist_id);
    const canEdit = isAdmin || isOwnProfile;
    const canEditAdmin = isAdmin;

    const photoSrc = doctor.photo_url && doctor.photo_url !== "string"
        ? doctor.photo_url
        : "/images/doctor.jpg";

    // Відображення зірок на основі реального рейтингу
    const avgRating = reviewStats.average || 0;
    const fullStars = Math.round(avgRating);

    return (
        <>
        <Header t={t} toggleLang={toggleLang} lang={lang}/>
        <main>
            <section className="doctor-page">
                <div className="container">
                    <Breadcrumb items={[
                        { label: 'Головна', path: '/' },
                        { label: 'Лікарі', path: '/doctors' },
                        { label: `${doctor.last_name} ${doctor.first_name}` },
                    ]} />

                    <div className="dp-main-card">
                        <div className="dp-left">
                            <div className="dp-photo-wrapper">
                                <img src={photoSrc} alt={`${doctor.last_name} ${doctor.first_name}`} className="dp-photo" />
                            </div>
                        </div>

                        <div className="dp-right">
                            <div className="dp-name-block">
                                <h1 className="dp-name">{doctor.last_name} {doctor.first_name} {doctor.middle_name}</h1>
                                <span className="dp-specialty-badge">{doctor.specialization}</span>
                            </div>

                            {canEdit && (
  <div className="dp-admin-controls">
    <Link to={`/doctors/edit/${doctor.specialist_id}`} className="edit-btn profile-edit">
      ⚙️ Редагувати профіль
    </Link>

    {canEditAdmin && (
      <Link to={`/doctors/schedule-edit/${doctor.specialist_id}`} className="edit-btn schedule-edit">
        📅 Редагувати розклад
      </Link>
    )}

    {hasSchedule === false && (
      <button
        onClick={handleAddSchedule}
        className="edit-btn schedule-add"
        disabled={creatingSchedule}
      >
        {creatingSchedule ? 'Створення...' : '➕ Додати розклад'}
      </button>
    )}
  </div>
)}

                           

                            <div className="dp-rating-row">
                                <span className="dp-stars">
                                    {[1,2,3,4,5].map(n => (
                                        <span key={n} style={{ color: n <= fullStars ? '#FBBF24' : '#D1D5DB', fontSize: 22 }}>★</span>
                                    ))}
                                </span>
                                <span className="dp-reviews">
                                    {reviewStats.total > 0
                                        ? `${avgRating} · ${reviewStats.total} відгуків`
                                        : 'Немає відгуків'}
                                </span>
                            </div>

                            <div className="dp-info-grid">
                                <div className="dp-info-card">
                                    <span className="dp-info-label">Досвід роботи</span>
                                    <span className="dp-info-value">{doctor.years_of_experience} років</span>
                                </div>
                                {doctor.qualification && (
                                    <div className="dp-info-card">
                                        <span className="dp-info-label">Кваліфікація</span>
                                        <span className="dp-info-value">{doctor.qualification}</span>
                                    </div>
                                )}
                                <div className="dp-info-card">
                                    <span className="dp-info-label">Спеціальність</span>
                                    <span className="dp-info-value">{doctor.specialization}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {doctor.bio && (
                        <div className="dp-bio-card">
                            <h2 className="dp-bio-title">Про лікаря</h2>
                            <p className="dp-bio-text">{doctor.bio}</p>
                        </div>
                    )}

                    <DoctorSchedule
                        key={scheduleKey}
                        specialistId={doctor.specialist_id}
                        price={doctor.price}
                        specialistName={`${doctor.last_name} ${doctor.first_name} ${doctor.middle_name || ''}`}
                        specialization={doctor.specialization}
                        onScheduleLoad={(exists) => setHasSchedule(exists)}
                    />

                    <div className="button-sec-div">
                        <button className="dp-gallery-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            Сертифікати з курсів
                        </button>
                    </div>

                    {/* ── ВІДГУКИ ── */}
                    <ReviewsSection 
                        specialistId={doctor.specialist_id}
                        onStatsLoad={(stats) => setReviewStats(stats)}
                    />
                </div>
            </section>
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

export default DoctorPage;