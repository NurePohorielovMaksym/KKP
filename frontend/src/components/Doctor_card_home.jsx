import React from "react";
import '../App.css';
import './Doctor_card_home.css';
import { Link } from 'react-router-dom';

function Doctor_card_home({ doctor }) {
    if (!doctor) return null;

    return (
        <div className="doctor-card">
            <div className="doctor-image-wrapper">
              <img 
                  src={doctor.photo_url && doctor.photo_url !== "string" ? doctor.photo_url : "/images/doctor.jpg"}   alt={`${doctor.last_name} ${doctor.first_name} ${doctor.middle_name}`} 
                  className="doctor-img" 
              />
            </div>

            <div className="doctor-content">
                <div className="main-info">
                    <h3 className="doctor-name">
                        {doctor.last_name} {doctor.first_name} {doctor.middle_name}
                    </h3>
                </div>

                <p className="doctor-specialty">{doctor.specialization}</p>

                <ul className="doctor-info">
                    <li>{doctor.years_of_experience} років досвіду</li>
                    {doctor.qualification && <li>{doctor.qualification}</li>}
                </ul>

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
    <div >
        <span>{doctor.total_reviews || 0} {/* Виводимо кількість відгуків */}</span>
        <span>{doctor.total_reviews === 1 ? ' відгук' : ' відгуків'}</span>
    </div>
</div>
                <Link to={`/doctors/${doctor.specialist_id ?? doctor.id}`} className="doctor-btn">Записатися</Link>
            </div>
        </div>
    );
}

export default Doctor_card_home;