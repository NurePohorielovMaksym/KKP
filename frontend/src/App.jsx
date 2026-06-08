import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Doctors from './pages/Doctors.jsx';
import { ua } from './locale/ua.js';
import { en } from './locale/en.js';
import DoctorPage from './pages/DoctorPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import EditDoctorProfile from './pages/EditDoctorProfile.jsx';
import EditDoctorSchedule from './pages/EditDoctorSchedule.jsx';
import Admin from './pages/Admin.jsx';
import ServicePage from './pages/ServicePage.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ServiceCategoryPage from './pages/ServiceCategoryPage.jsx';
import ServiceDetailPage from './pages/ServiceDetailPage.jsx';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import AccessibilityPanel from './components/AccessibilityPanel.jsx';

function App() {
  const [lang, setLang] = useState('ua');
  const toggleLang = () => {
    setLang(prev => (prev === 'ua' ? 'en' : 'ua'));
  };

  const t = lang === 'ua' ? ua : en;

  return (
    <>
       <AccessibilityPanel />
      <BrowserRouter>
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home t={t} toggleLang={toggleLang} lang={lang} />} />
            <Route path="/doctors" element={<Doctors t={t} toggleLang={toggleLang} lang={lang} />} />
            <Route path="/doctors/:id" element={<DoctorPage t={t} toggleLang={toggleLang} lang={lang} />} />
            <Route path="/about" element={<AboutPage t={t} toggleLang={toggleLang} lang={lang} />}/>
            <Route path="/doctors/edit/:id" element={<EditDoctorProfile t={t} toggleLang={toggleLang} lang={lang} />} />
            <Route path="/doctors/schedule-edit/:id" element={<EditDoctorSchedule t={t} toggleLang={toggleLang} lang={lang} />} />
            <Route path="/admin" element={<Admin t={t} toggleLang={toggleLang} lang={lang}/>}/>
            <Route path="/services" element={<ServicePage t={t} toggleLang={toggleLang} lang={lang}/>} />
            <Route path="/services/:category" element={<ServiceCategoryPage t={t} toggleLang={toggleLang} lang={lang} />} />
            <Route path="/services/:category/:id" element={<ServiceDetailPage t={t} toggleLang={toggleLang} lang={lang} />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </> 
  );
}

export default App;