import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header.jsx'; 
import Footer from '../components/Footer.jsx';
import './ServiceCategoryPage.css';
import { Link } from 'react-router-dom';
import "../App.css"

const API = 'http://localhost:5000/api/rehabilitation-types';

const CATEGORY_META = {
  'Ерготерапевт': {
    icon: '👐',
    description: 'Спеціалізована допомога у відновленні навичок, необхідних для повноцінного повсякденного життя. Ми адаптуємо середовище та допомагаємо повернути самостійність у побуті після важких захворювань чи травм.',
    benefits: [
      'Відновлення побутових навичок',
      'Тренування дрібної моторики',
      'Адаптація до нових умов життя',
      'Підвищення рівня самостійності'
    ],
  },
  'Психолог': {
    icon: '🧠',
    description: 'Професійна психоемоційна підтримка на шляху до одужання. Допомагаємо подолати тривожність, депресивні стани та стрес, створюючи надійний фундамент для комплексного фізичного та ментального здоров’я.',
    benefits: [
      'Подолання стресу та тривоги',
      'Емоційна стабілізація',
      'Робота з психосоматикою',
      'Мотивація до одужання'
    ],
  },
  'Масажист': {
    icon: '🤲',
    description: 'Глибоке опрацювання м’язів та м’яких тканин від сертифікованих майстрів. Наші методики спрямовані на зняття хронічного болю, ліквідацію застійних явищ та загальне відновлення енергетичного балансу тіла.',
    benefits: [
      'Зняття м’язових спазмів',
      'Покращення лімфотоку',
      'Зменшення рівня кортизолу',
      'Швидке відновлення після навантажень'
    ],
  },
  'Мануальний терапевт': {
    icon: '✋',
    description: 'Ефективне відновлення біомеханіки хребта та суглобів за допомогою точних ручних технік. Усуваємо функціональні блоки, защемлення нервів та безпосередньо першопричину больового синдрому.',
    benefits: [
      'Усунення болю в спині та шиї',
      'Розблокування суглобів',
      'Відновлення правильної постави',
      'Зняття м’язово-фасціальних затисків'
    ],
  },
  'Фізичний терапевт': {
    icon: '🦽',
    description: 'Науково обґрунтований підхід до відновлення рухових функцій. Ми допомагаємо повернутися до активного життя після операцій, інсультів або складних травм, використовуючи індивідуальні протоколи реабілітації.',
    benefits: [
      'Відновлення амплітуди рухів',
      'Навчання правильній біомеханіці',
      'Профілактика ускладнень',
      'Адаптація до побутових навантажень'
    ],
  }
};

export default function ServiceCategoryPage({ t, toggleLang, lang }) {
  const { category } = useParams(); 
  const decodedCategory = decodeURIComponent(category || ''); 
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);
  fetch(API)
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        const filtered = d.data.filter(s => 
          s.category?.trim().toLowerCase() === decodedCategory.trim().toLowerCase()
        );
        setServices(filtered);
      }
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, [category, decodedCategory]); 

  const meta = CATEGORY_META[decodedCategory] || {
    icon: '✨',
    description: `Усі доступні послуги у категорії «${decodedCategory}»`,
    benefits: []
  };

  return (
    <div className="page-wrapper">
      {/* Хедер */}
      <Header t={t} toggleLang={toggleLang} lang={lang} />

      <main className="scp-main">
        {/* Баннер категорії */}
        <section className="scp-hero">
          <div className="container">
            <div className="scp-hero-content">
              {/*<span className="scp-hero-icon">{meta.icon}</span>*/}
              <h1 className="scp-hero-title">{decodedCategory}</h1>
              <p className="scp-hero-desc">{meta.description}</p>
              
              {meta.benefits.length > 0 && (
                <ul className="scp-benefits-list">
                  {meta.benefits.map((benefit, i) => (
                    <li key={i}>✓ {benefit}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Таблиця прайс-листа */}
        <div className="container">
          <section className="scp-table-section">
            <h2 className="scp-section-title">Прайс-лист</h2>

            {loading ? (
              <p>Завантаження послуг...</p>
            ) : services.length === 0 ? (
              <p>На жаль, послуг у цій категорії поки немає.</p>
            ) : (
                <div className="scp-table-wrap">
  <table className="scp-table">
    <thead>
      <tr>
        <th>Послуга</th>
        <th>Тривалість</th>
        <th>Вартість</th>
      </tr>
    </thead>
    <tbody>
      {services.map(s => (
        <tr key={s.id} onClick={() => window.location.href = `/services/${encodeURIComponent(decodedCategory)}/${s.id}`}>
          <td>
            <Link to={`/services/${encodeURIComponent(decodedCategory)}/${s.id}`} className="scp-td-name">
              {s.name}
            </Link>
            {s.description && <div className="scp-td-desc">{s.description}</div>}
          </td>
          <td style={{ color: '#6B7280' }}>{s.duration_minutes} хв</td>
          <td className="scp-td-price">
            {Number(s.price).toLocaleString('uk-UA')} ₴
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
            )}
          </section>
        </div>
        <section className="scp-about-cta">
          <div className="container">
            <div className="scp-about-cta-content">
              <h2 className="scp-about-cta-title">Бажаєте дізнатися більше про наш центр?</h2>
              <p className="scp-about-cta-desc">
                Ми об'єднали команду висококласних фахівців, які щодня допомагають пацієнтам відновлювати здоров'я, рухливість та душевний баланс. Дізнайтеся більше про нашу філософію, сучасне європейське обладнання та методики, які ми використовуємо в роботі.
              </p>
              <Link to="/about" className="scp-about-cta-btn">
                Про наш центр
              </Link>
            </div>
          </div>
        </section>
      </main>
        <Footer t={t} toggleLang={toggleLang} lang={lang} />
    </div>
  );
}