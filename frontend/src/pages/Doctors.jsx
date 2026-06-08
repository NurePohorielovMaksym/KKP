import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from '../components/Footer.jsx';
import '../App.css';
import './Doctors.css';
import Doctor_card_doctors from "../components/Doctor_page/Doctor_card_doctors.jsx";
import Breadcrumb from '../components/Breadcrumb.jsx';

function Doctors({ t, toggleLang, lang }) {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSpec, setFilterSpec] = useState('');
    const [filterExp, setFilterExp] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [filterPrice, setFilterPrice] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch("http://localhost:5000/api/specialists")
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : (data.data ?? []);
                setDoctors(list);
                setLoading(false);
            })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

    const filtered = doctors.filter(d => {
        const fullName = `${d.last_name} ${d.first_name} ${d.middle_name}`.toLowerCase();
        const spec = (d.specialization ?? '').toLowerCase();
        const matchSearch = search.trim()
            ? fullName.includes(search.trim().toLowerCase()) || spec.includes(search.trim().toLowerCase())
            : true;
        const matchSpec = filterSpec ? d.specialization === filterSpec : true;

        let matchExp = true;
        if (filterExp === '0-3')  matchExp = d.years_of_experience <= 3;
        if (filterExp === '4-10') matchExp = d.years_of_experience >= 4 && d.years_of_experience <= 10;
        if (filterExp === '10+')  matchExp = d.years_of_experience > 10;

        const rating = parseFloat(d.average_rating ?? 0);
        let matchRating = true;
        if (filterRating === '<3') matchRating = rating < 3;
        if (filterRating === '3+') matchRating = rating >= 3 && rating < 4;
        if (filterRating === '4')  matchRating = rating >= 4 && rating < 5;
        if (filterRating === '5')  matchRating = rating === 5;

        const price = parseFloat(d.price ?? 0);
        let matchPrice = true;
        if (filterPrice === '0-300')   matchPrice = price < 300;
        if (filterPrice === '300-500') matchPrice = price >= 300 && price <= 500;
        if (filterPrice === '500+')    matchPrice = price > 500;

        return matchSearch && matchSpec && matchExp && matchRating && matchPrice;
    }).sort((a, b) => {
        if (sortBy === 'rating_desc') return parseFloat(b.average_rating ?? 0) - parseFloat(a.average_rating ?? 0);
        if (sortBy === 'rating_asc')  return parseFloat(a.average_rating ?? 0) - parseFloat(b.average_rating ?? 0);
        if (sortBy === 'price_asc')   return parseFloat(a.price ?? 0) - parseFloat(b.price ?? 0);
        if (sortBy === 'price_desc')  return parseFloat(b.price ?? 0) - parseFloat(a.price ?? 0);
        return 0;
    });

    const hasFilters = filterSpec || filterExp || filterRating || filterPrice || search || sortBy;
    const resetAll = () => {
        setFilterSpec(''); setFilterExp(''); setFilterRating('');
        setFilterPrice(''); setSortBy(''); setSearch('');
    };

    return (
        <>
        <Header t={t} toggleLang={toggleLang} lang={lang}/>
        <main>
            <section className="doctors-page">
                <div className="container">
                    <Breadcrumb items={[
                        { label: 'Головна', path: '/' },
                        { label: 'Лікарі', path: '/doctors' },
                    ]} />
                    <div className="doctors-page-header">
                        <div>
                            <h1 className="doctors-page-title">Наші лікарі</h1>
                            <p className="doctors-page-subtitle">Команда досвідчених фахівців для вашого відновлення</p>
                        </div>
                    </div>

                    <div className="doctors-search-bar">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                        </svg>
                        <input
                            className="search-input"
                            type="text"
                            placeholder="Пошук..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
                        )}
                    </div>

                    <div className="doctors-layout">

                        <aside className="doctors-sidebar">
                            <div className="sidebar-header">
                                <span className="sidebar-title">Фільтри</span>
                                {hasFilters && (
                                    <button className="filter-reset-small" onClick={resetAll}>Скинути</button>
                                )}
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Спеціальність</label>
                                <select
                                    className="filter-select"
                                    value={filterSpec}
                                    onChange={e => setFilterSpec(e.target.value)}
                                >
                                    <option value="">Всі спеціальності</option>
                                    {specializations.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Досвід роботи</label>
                                <select
                                    className="filter-select"
                                    value={filterExp}
                                    onChange={e => setFilterExp(e.target.value)}
                                >
                                    <option value="">Будь-який</option>
                                    <option value="0-3">До 3 років</option>
                                    <option value="4-10">4–10 років</option>
                                    <option value="10+">Понад 10 років</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Рейтинг</label>
                                <select
                                    className="filter-select"
                                    value={filterRating}
                                    onChange={e => setFilterRating(e.target.value)}
                                >
                                    <option value="">Будь-який</option>
                                    <option value="<3">до 3 зірок</option>
                                    <option value="3+">від 3 зірок</option>
                                    <option value="4">4 зірки</option>
                                    <option value="5">5 зірок</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">Ціна консультації</label>
                                <select
                                    className="filter-select"
                                    value={filterPrice}
                                    onChange={e => setFilterPrice(e.target.value)}
                                >
                                    <option value="">Будь-яка</option>
                                    <option value="0-300">до 300 грн</option>
                                    <option value="300-500">300–500 грн</option>
                                    <option value="500+">від 500 грн</option>
                                </select>
                            </div>

                            <div className="filter-divider" />

                            <div className="filter-group">
                                <label className="filter-label">Сортування</label>
                                <select
                                    className="filter-select"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    <option value="">За замовчуванням</option>
                                    <option value="rating_desc">Рейтинг: від високого</option>
                                    <option value="rating_asc">Рейтинг: від низького</option>
                                    <option value="price_asc">Ціна: від низької</option>
                                    <option value="price_desc">Ціна: від високої</option>
                                </select>
                            </div>
                        </aside>

                        <div className="doctors-main">
                            <p className="doctors-count">
                                {loading ? '' : `Знайдено: ${filtered.length} лікар${filtered.length === 1 ? 'я' : 'ів'}`}
                            </p>

                            {loading ? (
                                <p className="doctors-loading">Завантаження...</p>
                            ) : filtered.length === 0 ? (
                                <p className="doctors-empty">Лікарів не знайдено. Спробуйте змінити фільтри.</p>
                            ) : (
                                <div className="doctors-list">
                                    {filtered.map(doctor => (
                                        <Doctor_card_doctors key={doctor.specialist_id ?? doctor.id} doctor={doctor} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </section>
        </main>
        <Footer t={t} toggleLang={toggleLang} lang={lang}/>
        </>
    );
}

export default Doctors;