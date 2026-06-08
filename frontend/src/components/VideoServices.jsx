import React, { useState, useEffect, useRef } from 'react';
import './VideoServices.css'; 
import { Link } from "react-router-dom";

const VideoServices = ({ t }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const videoRefs = useRef([]);

    const videos = [
        { 
            id: 1, 
            title: t.video_title_1 || "Інклюзивна реабілітація", 
            src: "/video/rehab-video-one.mp4",
            desc: t.video_desc_1 || "Спеціалізований комплекс вправ для відновлення рухливості після травм.",
        },
        { 
            id: 2, 
            title: t.video_title_2 || "Професійне тейпування", 
            src: "/video/taping-video.mp4",
            desc: t.video_desc_2 || "Зняття м'язового болю та підтримка суглобів за допомогою кінезіотейпів.",
        },
        { 
            id: 3, 
            title: t.video_title_3 || "Мануальна терапія", 
            src: "/video/manual-therapy.mp4",
            desc: t.video_desc_3 || "Глибоке опрацювання м'язів та суглобів для відновлення їх нормальної роботи.",
        },
        { 
            id: 4, 
            title: t.video_title_4 || "Реабілітаційний пілатес", 
            src: "/video/rehab-pilates.mp4",
            desc: t.video_desc_4 || "Безпечні вправи на реформері для зміцнення корсета та покращення постави.",
        },
        { 
            id: 5, 
            title: t.video_title_5 || "Масаж з приладами", 
            src: "/video/massage-machine.mp4",
            desc: t.video_desc_5 || "Апаратний вплив для глибокого розслаблення та покращення кровообігу.",
        },
        { 
            id: 6, 
            title: t.video_title_6 || "Звичайний масаж", 
            src: "/video/toch-massage.mp4",
            desc: t.video_desc_6 || "Класичні техніки масажу для зняття напруги та загального оздоровлення.",
        },
    ];

    /*useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (video && index !== activeIndex) {
                video.pause();
            }
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target;
                    const videoIndex = videoRefs.current.indexOf(video);

                    if (entry.isIntersecting && videoIndex === activeIndex) {
                        video.play().catch(err => console.log("Автоплей скасовано:", err));
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        videoRefs.current.forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => {
            observer.disconnect();
        };
    }, [activeIndex]);*/

    const nextSlide = () => {
        setActiveIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
    };

    const goToSlide = (index) => {
        setActiveIndex(index);
    };

    const togglePlay = (index) => {
    const video = videoRefs.current[index]; 
    if (video) {
        if (video.paused) {
            video.play(); 
        } else {
            video.pause(); 
        }
    }
    };

    return (
        <section className="section-video-services">
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <div className="container relative-container">
                <h2 className="video-section-title">{t.video_section_title || "Види терапії"}</h2>
                
                <p className="video-section-subtitle">
                    {t.video_section_subtitle || "Ознайомтеся з нашими основними методиками лікування та відновлення. Ми підбираємо індивідуальний підхід для кожного пацієнта."}
                </p>
                
                <div className="carousel-wrapper">
                    <button className="carousel-btn prev" onClick={prevSlide}>
                        &#10094;
                    </button>

                    <div className="video-carousel">
                        {videos.map((vid, index) => {
                            let positionClass = 'hidden';
                            if (index === activeIndex) {
                                positionClass = 'active';
                            } else if (index === activeIndex - 1 || (activeIndex === 0 && index === videos.length - 1)) {
                                positionClass = 'prev-slide';
                            } else if (index === activeIndex + 1 || (activeIndex === videos.length - 1 && index === 0)) {
                                positionClass = 'next-slide';
                            }

                            return (
                                <div className={`video-slide ${positionClass}`} key={vid.id}>
                                    <div className="video-header">
                                        <h3 className="video-title">{vid.title}</h3>
                                    </div>
                                    
                                    <video 
                                        ref={(el) => (videoRefs.current[index] = el)} 
                                        onClick={() => togglePlay(index)}
                                        muted 
                                        loop 
                                        playsInline 
                                        disablePictureInPicture 
                                        className="promo-video"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <source src={vid.src} type="video/mp4" />
                                    </video>

                                    <p className="video-description">{vid.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    <button className="carousel-btn next" onClick={nextSlide}>
                        &#10095;
                    </button>
                </div>

                <div className="carousel-dots">
                    {videos.map((_, index) => (
                        <span 
                            key={index} 
                            className={`dot ${index === activeIndex ? 'active' : ''}`}
                        ></span>
                    ))}
                </div>

                <div className="link-wrapper">                   
                       <Link to="/services" style={{ color: "#159EEC", textDecoration: "none", fontWeight: "500"}}> 
                        {t.about_info_link_video || "Дізнатися більше ➔"}
                       </Link>
                </div>
            </div>
            
        </section>
    );
};

export default VideoServices;