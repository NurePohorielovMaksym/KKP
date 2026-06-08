import React, { useState, useEffect, useCallback } from 'react';
import './ReviewSection.css';

const API = 'http://localhost:5000/api/reviews';

function StarRating({ value, onChange, readonly = false }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="rs-star-picker" aria-label="Рейтинг">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    className={`rs-star-btn ${n <= (hovered || value) ? 'filled' : ''}`}
                    onClick={() => !readonly && onChange && onChange(n)}
                    onMouseEnter={() => !readonly && setHovered(n)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    disabled={readonly}
                    aria-label={`${n} зірок`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

function RatingBar({ star, count, total, active, onClick }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <button className={`rs-bar-row ${active ? 'rs-bar-row--active' : ''}`} onClick={onClick} type="button">
            <span className="rs-bar-label">{star}★</span>
            <div className="rs-bar-track">
                <div className="rs-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="rs-bar-count">{count}</span>
        </button>
    );
}

function ReviewCard({ review, currentUser, isAdmin, onDelete }) {
    const [confirming, setConfirming] = useState(false);
    const isOwn = currentUser && currentUser.id === review.user_id;
    const canDelete = isAdmin || isOwn;
    const initials = review.user_email
        ? review.user_email[0].toUpperCase()
        : '?';

    const date = new Date(review.created_at).toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="rs-card">
            <div className="rs-card-header">
                <div className="rs-avatar">{initials}</div>
                <div className="rs-card-meta">
                    <span className="rs-card-email">{review.user_email}</span>
                    <span className="rs-card-date">{date}</span>
                </div>
                <div className="rs-card-stars">
                    {[1,2,3,4,5].map(n => (
                        <span key={n} className={n <= review.rating ? 'rs-s-filled' : 'rs-s-empty'}>★</span>
                    ))}
                </div>
            </div>
            <p className="rs-card-comment">{review.comment}</p>
            {canDelete && (
                <div className="rs-card-footer">
                    {!confirming ? (
                        <button className="rs-del-btn" onClick={() => setConfirming(true)}>
                            Видалити
                        </button>
                    ) : (
                        <div className="rs-confirm">
                            <span>Видалити відгук?</span>
                            <button className="rs-confirm-yes" onClick={() => onDelete(review.id, isOwn)}>Так</button>
                            <button className="rs-confirm-no" onClick={() => setConfirming(false)}>Ні</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ReviewsSection({ specialistId, onStatsLoad, t, toggleLang, lang }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ total: 0, average: 0 });
    const [filterStar, setFilterStar] = useState(null);
    const [loading, setLoading] = useState(true);
    console.log("DEBUG: specialistId is:", specialistId);
    // Форма
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState(null); // { type: 'success'|'error', text }

    const userJson = localStorage.getItem('user');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    const token = localStorage.getItem('token');
    const isAdmin = currentUser?.role === 'admin';
    const [hasCompletedAppointment, setHasCompletedAppointment] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/${specialistId}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews);
                setStats(data.stats);
                onStatsLoad?.(data.stats);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [specialistId]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (!currentUser || !token) return;
        fetch(`http://localhost:5000/api/appointments/check-completed/${specialistId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setHasCompletedAppointment(data.hasCompleted))
            .catch(() => setHasCompletedAppointment(false));
    }, [specialistId, currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) return setFormMsg({ type: 'error', text: 'Оберіть рейтинг' });
        if (comment.trim().length < 5) return setFormMsg({ type: 'error', text: 'Коментар занадто короткий' });

        setSubmitting(true);
        setFormMsg(null);
        try {
            const res = await fetch(`${API}/${specialistId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ rating, comment }),
            });
            if (!res.ok) {
                const errorText = await res.text(); 
                throw new Error(`Помилка сервера: ${res.status}`);
            }   
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setRating(0);
            setComment('');
            setFormMsg({ type: 'success', text: 'Дякуємо за відгук!' });
            load();
        } catch (err) {
            setFormMsg({ type: 'error', text: err.message || 'Помилка' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, isOwn) => {
        const url = isOwn ? `${API}/${id}/my` : `${API}/${id}`;
        try {
            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            load();
        } catch (err) {
            alert(err.message);
        }
    };

    const starCounts = [5, 4, 3, 2, 1].map(s => ({
        star: s,
        count: reviews.filter(r => r.rating === s).length,
    }));

    const displayed = filterStar
        ? reviews.filter(r => r.rating === filterStar)
        : reviews;

    const alreadyReviewed = currentUser && reviews.some(r => r.user_id === currentUser.id);
    const canWriteReview = currentUser && ['patient', 'admin'].includes(currentUser.role) && !alreadyReviewed && hasCompletedAppointment;

    return (
        <section className="rs-section">
            <div className="rs-header">
                <h2 className="rs-title">Відгуки</h2>
                {stats.total > 0 && (
                    <div className="rs-summary">
                        <span className="rs-avg">{stats.average}</span>
                        <div className="rs-summary-right">
                            <StarRating value={Math.round(stats.average)} readonly />
                            <span className="rs-total">{stats.total} відгуків</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Фільтр по зірках */}
            {stats.total > 0 && (
                <div className="rs-filters">
                    <button
                        className={`rs-filter-all ${!filterStar ? 'active' : ''}`}
                        onClick={() => setFilterStar(null)}
                    >
                        Всі
                    </button>
                    {starCounts.map(({ star, count }) => (
                        <button
                            key={star}
                            className={`rs-filter-btn ${filterStar === star ? 'active' : ''}`}
                            onClick={() => setFilterStar(prev => prev === star ? null : star)}
                            disabled={count === 0}
                        >
                            {star}★ <span className="rs-filter-count">({count})</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Гістограма */}
            {stats.total > 0 && (
                <div className="rs-bars">
                    {starCounts.map(({ star, count }) => (
                        <RatingBar
                            key={star}
                            star={star}
                            count={count}
                            total={stats.total}
                            active={filterStar === star}
                            onClick={() => setFilterStar(prev => prev === star ? null : star)}
                        />
                    ))}
                </div>
            )}

            {/* Список відгуків */}
            <div className="rs-list">
                {loading ? (
                    <p className="rs-empty">Завантаження...</p>
                ) : displayed.length === 0 ? (
                    <p className="rs-empty">
                        {filterStar ? `Немає відгуків на ${filterStar}★` : 'Поки немає відгуків. Будьте першим!'}
                    </p>
                ) : (
                    displayed.map(r => (
                        <ReviewCard
                            key={r.id}
                            review={r}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {/* Форма */}
            {canWriteReview && (
                <div className="rs-form-wrapper">
                    <h3 className="rs-form-title">Залишити відгук</h3>
                    <form className="rs-form" onSubmit={handleSubmit}>
                        <div className="rs-form-row">
                            <label className="rs-form-label">Ваша оцінка</label>
                            <StarRating value={rating} onChange={setRating} />
                        </div>
                        <div className="rs-form-row">
                            <label className="rs-form-label">Коментар</label>
                            <textarea
                                className="rs-textarea"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Розкажіть про свій досвід..."
                                maxLength={1000}
                                rows={4}
                            />
                            <span className="rs-char-count">{comment.length}/1000</span>
                        </div>
                        {formMsg && (
                            <p className={`rs-form-msg rs-form-msg--${formMsg.type}`}>{formMsg.text}</p>
                        )}
                        <button className="rs-submit-btn" type="submit" disabled={submitting}>
                            {submitting ? 'Відправка...' : 'Надіслати відгук'}
                        </button>
                    </form>
                </div>
            )}

            {!currentUser && (
                <p className="rs-login-hint auth">
                    Увійдіть в акаунт, щоб залишити відгук
                </p>
            )}

            {currentUser && alreadyReviewed && (
                <p className="rs-login-hint">Ви вже залишили відгук для цього лікаря.</p>
            )}

            {currentUser && !alreadyReviewed && !hasCompletedAppointment && (
                <p className="rs-login-hint">
                        Відгук можна залишити лише після завершеного прийому у цього лікаря.
                </p>
            )}

        </section>
    );
}