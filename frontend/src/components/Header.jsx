import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import '../App.css';
import AuthModal from './AuthModal';
import { HashLink } from 'react-router-hash-link';

const SERVICES_API = 'http://localhost:5000/api/rehabilitation-types';

function Header({ t, toggleLang, lang }) {
  const [user, setUser] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [allServices, setAllServices] = useState([]);
  
  const userMenuRef = useRef(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetch(SERVICES_API)
      .then(r => r.json())
      .then(d => { if (d.success) setAllServices(d.data); })
      .catch(() => {});
  }, []);

  const categories = [...new Set(allServices.map(s => s.category).filter(Boolean))];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsVisible(!(y > lastScrollYRef.current && y > 160));
      lastScrollYRef.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSuccess = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsUserMenuOpen(false);
    setShowLogoutConfirm(false);
    window.location.reload();
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(prev => {
      if (prev) setShowLogoutConfirm(false);
      return !prev;
    });
  };

  return (
    <header className={`header ${isVisible ? '' : 'header-hidden'}`}>
      <div className="container header-container">

        <Link className="logo logo-header" to="/">
          Kine<span className="span-logo">tra</span>
        </Link>

        <nav className="nav">
          <ul className="nav-list">
            <li><Link className="nav-link" to="/">{t.nav_home}</Link></li>
            <li><Link className="nav-link" to="/about">{t.nav_about}</Link></li>

            {/* ПОСЛУГИ */}
            <li className="dropdown-container">
              <Link className="nav-link" to="/services">{t.nav_service}</Link>
              <ul className="dropdown-menu">
                <li><HashLink className="dropdown-link" to="/services#price-table">{t.sub_nav_price}</HashLink></li>
                {categories.map(cat => (
                  <li key={cat} className="sub-dropdown-container">
                    <Link className="dropdown-link" to={`/services/${cat}`}>
                      {cat}
                      <svg className="icon-play" width="20" height="20">
                        <use href="/icons.svg#play"></use>
                      </svg>
                    </Link>
                    <ul className="sub-dropdown-menu">
                      {allServices
                        .filter(s => s.category === cat)
                        .map(service => (
                          <li key={service.id}>
                            <Link className="dropdown-link" to={`/services/${cat}/${service.id}`}>
                              {service.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>

            <li><Link className="nav-link" to="/doctors">{t.nav_doctors}</Link></li>
            <li><a className="nav-link" href="#address">{t.nav_contact}</a></li>
          </ul>
        </nav>

        <button type="button" onClick={toggleLang} className="language">
          {lang === 'ua'
            ? <><span className="text-ua">УКР</span><span className="text-slash">/</span><span className="text-eng">ENG</span></>
            : <><span className="text-eng">ENG</span><span className="text-slash">/</span><span className="text-ua">УКР</span></>
          }
        </button>

        <div className="div-about-schedule">
          <svg className="icon" width="30" height="28"><use href="/icons.svg#clock"></use></svg>
          <a className="div-about-schedule-link">{t.about_schedule}</a>
        </div>

        <address className="address">
          <ul className="address-list">
            <li>
              <a className="address-link" href="tel:+110001111111">
                <div className="svg-item">
                  <svg className="icon" width="30" height="28"><use href="/icons.svg#phone"></use></svg>
                </div>
                <p className="icon-text">+11 (000) 111-1-111</p>
              </a>
            </li>
          </ul>
        </address>

        {/* USER ZONE */}
        {user ? (
          <div className="user-menu" ref={userMenuRef}>
            <div className="avatar" onClick={toggleUserMenu}>
              {user.email[0].toUpperCase()}
            </div>
            {isUserMenuOpen && (
              <div className="dropdown-user">
                <p className="user-email">{user.email}</p>
                {user.role === 'doctor' && (
                  <Link to={`/doctors/${user.specialist_id}`} className="user-role-btn doctor-btn" onClick={() => setIsUserMenuOpen(false)}>
                    🩺 Мій кабінет
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="user-role-btn admin-btn" onClick={() => setIsUserMenuOpen(false)}>
                    ⚙️ Блок управління
                  </Link>
                )}
                {!showLogoutConfirm ? (
                  <button onClick={() => setShowLogoutConfirm(true)} className="logout-btn">{t.logout}</button>
                ) : (
                  <div className="logout-confirm">
                    <p className="logout-confirm-text">{t.logout_text}</p>
                    <div className="logout-confirm-buttons">
                      <button onClick={handleLogout} className="logout-btn confirm-yes">{t.logout_yes}</button>
                      <button onClick={() => setShowLogoutConfirm(false)} className="logout-btn confirm-no">{t.logout_no}</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <a className="sign-up-link" href="#" onClick={e => { e.preventDefault(); setIsModalOpen(true); }}>
            <svg className="icon" width="32" height="30"><use href="/icons.svg#profile-icon"></use></svg>
            <p className="sign-up-text">{t.sign_in_text}</p>
          </a>
        )}

      </div>
      {isModalOpen && (
        <AuthModal
          t={t}
          toggleLang={toggleLang}
          lang={lang}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </header>
  );
}

export default Header;