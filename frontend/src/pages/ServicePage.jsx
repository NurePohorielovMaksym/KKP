import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ServicePage.css';
import '../App.css';
import Header from "../components/Header.jsx";
import Footer from '../components/Footer.jsx';
import { useReveal } from "../hooks/useReveal.js";

const API = 'http://localhost:5000/api/rehabilitation-types';

const CATEGORY_ICONS = {
  'Масажист':             '🤲',
  'Психолог':      '🩺',
  'Ерготерапевт':      '⚡',
  'Фізичний терапевт':      '🏃',
  'Мануальний терапевт': '✋',
};
const DEFAULT_ICON = '💊';

const getUserRole = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch { return null; }
};

export default function ServicePage({ t, toggleLang, lang }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const role = getUserRole();

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => { if (d.success) setServices(d.data); })
      .finally(() => setLoading(false));
  }, []);

  // Групуємо послуги по категоріях, зберігаючи порядок
  const grouped = services.reduce((acc, s) => {
    const cat = s.category || 'Інше';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  const formatMoney    = v => Number(v || 0).toLocaleString('uk-UA') + ' ₴';
  const formatDuration = m => m ? `${m} хв` : '—';

  // HERO
      const refHeroEyebrow = useReveal();
      const refHeroTitle   = useReveal();
      const refHeroText    = useReveal();

  return (
     <>
      <Header t={t} toggleLang={toggleLang} lang={lang} />
      <div className="srv-page">
  
        {/* HERO */}
        <section className="srv-hero">
          <div className="srv-hero-bg" />
            <div className="container">
              <h1 ref={refHeroEyebrow} className="srv-hero-title reveal reveal--down">Наші послуги</h1>
              <p ref={refHeroTitle} className="srv-hero-sub reveal reveal--down">
                Сучасна реабілітація, фізіотерапія та консультації від провідних фахівців.
                Ми допомагаємо відновити рухливість, зняти біль та повернути якість життя.
              </p>
              <a ref={refHeroText} href="#price-table" className="hero-button reveal reveal-hero-btn">
                 Ціни на послуги
              </a>
          </div>
        </section>

        <div className="container srv-body">  
  
          {loading && <div className="srv-loading">Завантаження...</div>}
  
          {/* GROUPED SECTIONS */}
          {!loading && categories.map(cat => (
            <section key={cat} className="srv-category-section">
              <Link to={`/services/${cat}`} className="srv-category-heading">
                <span className="srv-category-icon">{CATEGORY_ICONS[cat] ?? DEFAULT_ICON}</span>
                <h2 className="srv-category-title">{cat}</h2>
                <span className="srv-section-count">{grouped[cat].length}</span>
              </Link>
  
              <div className="srv-cards-grid">
                {grouped[cat].map(s => (
                  <Link key={s.id} to={`/services/${cat}/${s.id}`} className="srv-card srv-card-link">
                    <div className="srv-card-header">
                      <span className="srv-card-icon">{CATEGORY_ICONS[cat] ?? DEFAULT_ICON}</span>
                      {s.category && <span className="srv-card-cat">{s.category}</span>}
                    </div>
                    <h3 className="srv-card-name">{s.name}</h3>
                    {s.description && <p className="srv-card-desc">{s.description}</p>}
                    <div className="srv-card-footer">
                      <div className="srv-card-meta">
                        {s.duration_minutes && (
                          <span className="srv-card-duration">⏱ {formatDuration(s.duration_minutes)}</span>
                        )}
                      </div>
                      <span className="srv-card-price">{formatMoney(s.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
  
          {/* PRICE TABLE grouped by category */}
          {!loading && (
            <section className="srv-section srv-price-section" id="price-table">
              <h2 className="srv-section-title">Прайс-лист</h2>
  
              {categories.map(cat => (
                <div key={cat} className="srv-table-group">
                  <div className="srv-table-group-heading">
                    <Link to={`/services/${cat}`} className="srv-category-heading last-element">
                <span className="srv-category-icon">{CATEGORY_ICONS[cat] ?? DEFAULT_ICON}</span>
                <h2 className="srv-category-title">{cat}</h2>
                <span className="srv-section-count">{grouped[cat].length}</span>
              </Link>
                  </div>
                  <div className="srv-table-wrap">
                    <table className="srv-table">
                      <thead>
                        <tr>
                          <th>Послуга</th>
                          <th>Тривалість</th>
                          <th>Вартість</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped[cat].map(s => (
                          <tr key={s.id}>
                            <td>
                              <div className="srv-td-name">{s.name}</div>
                              {s.description && <div className="srv-td-desc">{s.description}</div>}
                            </td>
                            <td className="srv-td-center">{formatDuration(s.duration_minutes)}</td>
                            <td className="srv-td-price">{formatMoney(s.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          )}
  
        </div>
      </div>
      <Footer t={t} toggleLang={toggleLang} lang={lang}/>
     </>
  );
}