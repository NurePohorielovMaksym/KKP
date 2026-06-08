import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import "./ServiceDetailPage.css";
import Header from "../components/Header.jsx";
import Footer from '../components/Footer.jsx';

function ServiceDetailPage({t, toggleLang, lang}) {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [imageError, setImageError] = useState(false); // Стан для відстеження помилки завантаження

  useEffect(() => {
    fetch(`http://localhost:5000/api/rehabilitation-types/${id}`)
      .then(res => res.json())
      .then(d => { 
        if(d.success) {
          setService(d.data); 
          console.log("Шлях до фото:", d.data.photo_url_rehab);
        }
      });
  }, [id]);

  if (!service) return <div className="loader">Завантаження...</div>;

  const getPhotoSrc = () => {
    if (!service.photo_url_rehab) return null;
    if (service.photo_url_rehab.startsWith('http')) {
      return service.photo_url_rehab;
    }
    return `http://localhost:5000/uploads/${service.photo_url_rehab}`;
  };

  const photoSrc = getPhotoSrc();

  return (
    <>
     <Header t={t} toggleLang={toggleLang} lang={lang}/>
      <div className="container service-detail">
        <div className="service-header">
          <h1>{service.name}</h1>
          <span className="category-tag">{service.category}</span>
        </div>
        
        <div className="service-content">
          <div className="left-content">
            {photoSrc && !imageError ? (
              <img
                src={photoSrc}
                alt={service.name}
                className="service-image"
                onError={() => setImageError(true)} 
              />
            ) : (
              <div className="service-image-placeholder">
                Немає фото
              </div>
            )}

            <div className="description-block">
              <h2>Про послугу</h2>
              <p>{service.description}</p>
            </div>
          </div>

           <div className="info-card">
            <div className="info-item">
              <strong>Тривалість:</strong> {service.duration_minutes} хв
            </div>
            <div className="info-item">
              <strong>Вартість:</strong> {service.price} ₴
            </div>

            <Link to="/doctors" className="book-btn-large">
              Лікарі
            </Link>

            <p>
              У фільтрах виберіть спеціальність лікаря ({service.category}),
              та оберіть будь якого спеціаліста
            </p>
          </div>
      </div>         
        </div>
      
      <Footer t={t} toggleLang={toggleLang} lang={lang}/>
    </>
  );
}

export default ServiceDetailPage;