import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header.jsx";
import Footer from '../components/Footer.jsx';
import '../App.css';
import './Home.css';
import VideoServices from "../components/VideoServices.jsx";
import SpecialistsList from "../components/SpecialistsList.jsx";
import AppointmentForm from '../components/Form_home.jsx';
import { Link } from 'react-router-dom';
import { useReveal } from "../hooks/useReveal.js";
import { HashLink } from 'react-router-hash-link';

function Home({ t, toggleLang, lang }) {
 
    const [doctors, setDoctors] = useState([]);
    useEffect(() => {
        fetch("http://localhost:5000/api/specialists")
            .then(res => res.json())
            .then(data => setDoctors(data))
            .catch(err => console.error(err));
    }, []);
 
    const refAboutImg    = useReveal();
    const refAboutTitle  = useReveal();
    const refAboutPre    = useReveal();
    const refAboutPost   = useReveal();
    const refAboutLink   = useReveal();
    const refAboutCards  = useReveal();
    const refVideo       = useReveal();
    const refDoctorTitle = useReveal();
    const refDoctorList  = useReveal();
    const refDoctorLink  = useReveal();
    const refForm        = useReveal();
 
    return (
        <>
        <Header t={t} toggleLang={toggleLang} lang={lang}/>
        <main>
 
            {/* ══ HERO ══ */}
            <section className="hero-section">
                <div className="container hero">
                    <div className="hero-content reveal-hero">
                        <h1 className="hero-title">{t.hero_title}</h1>
                        <p className="hero-subtitle">{t.hero_paragraph}</p>
                    </div>
                    <Link to="/services" className="hero-button reveal-hero-btn" >
                        {t.hero_button}
                    </Link>
                </div>
            </section>
 
            {/* ══ ABOUT ══ */}
            <section className="about-section">
                <div className="container about">
                    <div className="div-about-info">
 
                        <div
                            ref={refAboutImg}
                            className="div-info-about-img reveal reveal--left"
                        >
                            <img src="/images/team.jpg" className="info-about-img" alt="doctors"/>
                        </div>
 
                        <div className="about-second-element">
                            <p
                                ref={refAboutPre}
                                className="about-info-preparagraph reveal reveal--fade"
                                style={{ transitionDelay: '0.05s' }}
                            >
                                {t.about_info_preparagraph}
                            </p>
                            <h2
                                ref={refAboutTitle}
                                className="about-info-title reveal reveal--up"
                                style={{ transitionDelay: '0.15s' }}
                            >
                                {t.about_info_title}
                            </h2>
                            <p
                                ref={refAboutPost}
                                className="about-info-postparagraph reveal reveal--up"
                                style={{ transitionDelay: '0.25s' }}
                            >
                                {t.about_info_postparagraph}
                            </p>
                            <a
                                ref={refAboutLink}
                                className="about-info-link about reveal reveal--fade"
                                href="/about"
                                style={{ transitionDelay: '0.3s' }}
                            >
                                {t.about_info_link}
                            </a>
                            <div
                                ref={refAboutCards}
                                className="div-card-about reveal reveal--up"
                                style={{ transitionDelay: '0.4s' }}
                            >
                                <Link to="/doctors" className="interactive-buttons">
                                    <div className="about-section-card first">
                                        <p className="about-section-card-text">{t.about_section_card_text_1}</p>
                                        <svg className="icon" width="40" height="40">
                                            <use href="/icons.svg#calendar"></use>
                                        </svg>
                                    </div>
                                </Link>
                                <HashLink to="/services#price-table" className="interactive-buttons">
                                    <div className="about-section-card second">
                                        <p className="about-section-card-text">{t.about_section_card_text_2}</p>
                                        <svg className="icon" width="40" height="40">
                                            <use href="/icons.svg#cash"></use>
                                        </svg>
                                    </div>
                                </HashLink>
                            </div>
                        </div>
 
                    </div>
                </div>
            </section>
 
            {/*  VIDEO SERVICES  */}
            <VideoServices t={t} />
 
            {/*  DOCTORS  */}
            <section className="doctors">
                <div className="bg-blob blob-3"></div>
                <div className="bg-blob blob-4"></div>
                <div className="container">
                    <h2
                        ref={refDoctorTitle}
                        className="doctor-title reveal reveal--up"
                    >
                        Наші лікарі
                    </h2>
                    <div
                        ref={refDoctorList}
                        className="reveal reveal--up"
                        style={{ transitionDelay: '0.15s' }}
                    >
                        <SpecialistsList />
                    </div>
                    <div
                        ref={refDoctorLink}
                        className="link-wrapper speclist reveal reveal--fade"
                        style={{ transitionDelay: '0.3s' }}
                    >
                        <Link className="about-info-link" to="/doctors">
                            {t.about_info_link_doctors}
                        </Link>
                    </div>
                </div>
            </section>
 
            {/* ══ FORM ══ */}
            <div ref={refForm} className="reveal reveal--up">
                <AppointmentForm t={t} />
            </div>
 
        </main>
        <Footer t={t} toggleLang={toggleLang} lang={lang}/>
        </>
    );
}
 
export default Home;


