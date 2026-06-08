import React, { useState, useEffect } from "react";
import Doctor_card_home from "./Doctor_card_home";
import "./SpecialistsList.css";
import App from "../App";

function SpecialistsList() {
    const [isLoading, setIsLoading] = useState(true);
    const [specialists, setSpecialists] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        fetch('http://localhost:5000/api/specialists/')
            .then(response => response.json())
            .then(data => {
                setSpecialists(data.data.slice(0, 6));
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Помилка запиту:", error);
                setIsLoading(false);
            });
    }, []);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev === specialists.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev === 0 ? specialists.length - 1 : prev - 1));
    };

    const goToSlide = (index) => {
        setActiveIndex(index);
    };

    if (isLoading) return <p className="loading-text">Завантаження лікарів...</p>;
    if (specialists.length === 0) return null;

    return (
        <div className="specialists-stack-container">        
            <div className="carousel-controls-wrapper">
                <button className="stack-btn prev" onClick={prevSlide}>&#10094;</button>

                <div className="specialists-stack-window">
                    {specialists.map((doctor, index) => {
                        let positionClass = 'hidden';
                        if (index === activeIndex) {
                            positionClass = 'active';
                        } else if (index === activeIndex - 1 || (activeIndex === 0 && index === specialists.length - 1)) {
                            positionClass = 'prev-slide';
                        } else if (index === activeIndex + 1 || (activeIndex === specialists.length - 1 && index === 0)) {
                            positionClass = 'next-slide';
                        }
                        
                        
                        return (
                            <div className={`stack-slide ${positionClass}`} key={doctor.specialist_id}>
                                <Doctor_card_home doctor={doctor} />
                            </div>
                        );
                    })}
                </div>

                <button className="stack-btn next" onClick={nextSlide}>&#10095;</button>
            </div>

            <div className="stack-dots">
                {specialists.map((_, index) => (
                    <span 
                        key={index} 
                        className={`dot ${index === activeIndex ? 'active' : ''}`}
                    ></span>
                ))}
            </div>
        </div>
    );
}

export default SpecialistsList;