import React, { useState, useEffect, useRef  } from 'react';
import './AccessibilityPanel.css';

function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const [inclusive, setInclusive] = useState(
    () => localStorage.getItem('inclusive') === 'true'
  );

  const [eyeComfort, setEyeComfort] = useState(
    () => localStorage.getItem('eyeComfort') === 'true'
  );

  useEffect(() => {
    document.body.classList.toggle('inclusive-theme', inclusive);
    localStorage.setItem('inclusive', inclusive);
  }, [inclusive]);

  useEffect(() => {
    document.body.classList.toggle('eye-comfort-theme', eyeComfort);
    localStorage.setItem('eyeComfort', eyeComfort);
  }, [eyeComfort]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {eyeComfort && <div className="eye-comfort-overlay" aria-hidden="true" />}

      <div className={`a11y-panel ${isOpen ? 'a11y-panel--open' : ''}` } ref={panelRef}>
        <button
          className="a11y-toggle-btn"
          onClick={() => setIsOpen(prev => !prev)}
          aria-label="Панель доступності"
          title="Панель доступності"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </button>

        <div className="a11y-drawer">
          <p className="a11y-drawer__title">Доступність</p>

          <div className="a11y-row">
            <div className="a11y-row__info">
              <span className="a11y-row__label">Більший текст</span>
              <span className="a11y-row__desc">Збільшений шрифт та кнопки</span>
            </div>
            <label className="a11y-switch">
              <input
                type="checkbox"
                checked={inclusive}
                onChange={e => setInclusive(e.target.checked)}
              />
              <span className="a11y-switch__track">
                <span className="a11y-switch__thumb" />
              </span>
            </label>
          </div>

          <div className="a11y-divider" />

          <div className="a11y-row">
            <div className="a11y-row__info">
              <span className="a11y-row__label">Комфорт для очей</span>
              <span className="a11y-row__desc">Тепліший відтінок екрана</span>
            </div>
            <label className="a11y-switch">
              <input
                type="checkbox"
                checked={eyeComfort}
                onChange={e => setEyeComfort(e.target.checked)}
              />
              <span className="a11y-switch__track">
                <span className="a11y-switch__thumb" />
              </span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccessibilityPanel;