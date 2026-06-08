import React from "react";
import '../../App.css';
import './Doctor_card_doctors.css';
import { Link } from 'react-router-dom';

function Doctor_card_doctors({ doctor }) {
    
    if (!doctor) return null;

    return (
        <div className="doctor-card-h">
            <div className="doctor-image-wrapper-h">
                <img
                    src={doctor.photo_url && doctor.photo_url !== "string" ? doctor.photo_url : "/images/doctor.jpg"}
                    alt={`${doctor.last_name} ${doctor.first_name}`}
                    className="doctor-img-h"
                />
            </div>

            <div className="doctor-content-h">
                <div className="doctor-header-h">
                    <div>
                        <h3 className="doctor-name-h">
                            <Link className="link-name" to={`/doctors/${doctor.specialist_id ?? doctor.id}`}>{doctor.last_name} {doctor.first_name} {doctor.middle_name}</Link>
                        </h3>
                        <p className="doctor-specialty-h">{doctor.specialization}</p>

                        <div className="price-block">
                            <span className="price-dot green"></span>
                            <span className="price-value">{doctor.price} грн</span>
                        </div>
                    </div>
                    
<div className="doctor-rating-h">
    <div className="rs-card-stars">
        {[1, 2, 3, 4, 5].map(n => (
            <span 
                key={n} 
                className={n <= Math.round(doctor.average_rating || 0) ? 'rs-s-filled' : 'rs-s-empty'}
            >
                ★
            </span>
        ))}
    </div>
    <span>
        {doctor.total_reviews || 0} {/* Виводимо кількість відгуків */}
        {doctor.total_reviews === 1 ? ' відгук' : ' відгуків'}
    </span>
</div>
                </div>

                <div className="doctor-meta-h">
                    <span className="doctor-badge">🕐 {doctor.years_of_experience} років досвіду</span>
                    {doctor.qualification && (
                        <span className="doctor-badge">{doctor.qualification}</span>
                    )}
                </div>
            </div>

            <div className="doctor-action-h">
                <Link to={`/doctors/${doctor.specialist_id ?? doctor.id}`} className="doctor-btn-h">Записатися</Link>
            </div>
        </div>
    );
}

export default Doctor_card_doctors;