import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Breadcrumb from '../components/Breadcrumb.jsx';
import "./DoctorPage.css"; 
import { useToast } from "../hooks/useToast.js"; 

function EditDoctorProfile({ t, toggleLang, lang }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toasts, showToast } = useToast();
    const [doctorData, setDoctorData] = useState(null);
    const [formData, setFormData] = useState({
        specialization: '',
        qualification: '',
        years_of_experience: '',
        bio: '',
        price: ''
    });
    
    const [photo, setPhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); 
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetch(`http://localhost:5000/api/specialists/${id}`)
            .then(res => res.json())
            .then(data => {
                const d = data.data ?? data;
                
                if (currentUser?.role !== 'admin' && Number(currentUser?.specialist_id) !== Number(d.specialist_id)) {
                    alert("У вас немає прав для редагування цього профілю");
                    navigate(`/doctor/${id}`);
                    return;
                }

                setDoctorData(d);
                setFormData({
                    specialization: d.specialization || '',
                    qualification: d.qualification || '',
                    years_of_experience: d.years_of_experience || '',
                    bio: d.bio || '',
                    price: d.price || ''
                });
                
                if (d.photo_url && d.photo_url !== "string") {
                    setPreviewUrl(d.photo_url);
                } else {
                    setPreviewUrl("/images/doctor.jpg"); 
                }
                
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        const data = new FormData();
        if (formData.specialization) data.append('specialization', formData.specialization);
        if (formData.qualification) data.append('qualification', formData.qualification);
        if (formData.years_of_experience) data.append('years_of_experience', Number(formData.years_of_experience)); 
        if (formData.bio) data.append('bio', formData.bio);
        if (photo) data.append('photo', photo);
        if (formData.price) data.append('price', Number(formData.price));
        
        try {
            const res = await fetch(`http://localhost:5000/api/specialists/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            const result = await res.json(); 

            if (res.ok) {
                showToast("Профіль успішно оновлено!", "success");
                
                setTimeout(() => {
                    navigate(`/doctors/${id}`);
                }, 2000);

            } else {
                console.error("Server error:", result);
                showToast(result.message || "Помилка при оновленні", "error");
            }
        } catch (err) {
            console.error("Помилка оновлення:", err);
            showToast("Сталася помилка при відправці даних", "error");
        }
    };

    if (loading) return (
        <><Header t={t} toggleLang={toggleLang} lang={lang}/><main className="doctor-page-loading">Завантаження...</main></>
    );

    return (
        <>
            <Header t={t} toggleLang={toggleLang} lang={lang}/>
            <main className="doctor-page">
                <div className="container">
                    <Breadcrumb items={[
                        { label: 'Головна', path: '/' },
                        { label: 'Лікарі', path: '/doctors' },
                        { label: 'Профіль лікаря', path: `/doctors/${id}` },
                        { label: 'Редагування' },
                    ]} />

                    <form onSubmit={handleSubmit}>
                        {/* Блок як на DoctorPage, але з полями вводу */}
                        <div className="dp-main-card">
                            <div className="dp-left">
                                <div className="dp-photo-wrapper">
                                    <img src={previewUrl} alt="Preview" className="dp-photo" style={{objectFit: 'cover'}} />
                                </div>
                                {/* Кнопка заміни фото під картинкою */}
                                <label className="edit-btn profile-edit" style={{cursor: 'pointer', textAlign: 'center', width: '100%', marginTop: '10px'}}>
                                    📷 Змінити фото
                                    <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                                </label>
                            </div>

                            <div className="dp-right">
                                <div className="dp-name-block">
                                    {/* Ім'я не редагується тут, бо воно в таблиці Users */}
                                    <h1 className="dp-name">{doctorData.last_name} {doctorData.first_name} {doctorData.middle_name}</h1>
                                    
                                    {/* Інпут замість бейджа спеціальності */}
                                    <input 
                                        type="text" 
                                        name="specialization" 
                                        value={formData.specialization} 
                                        onChange={handleInputChange} 
                                        className="form-input-inline specialty-input" 
                                        placeholder="Спеціальність (напр. Кардіолог)"
                                    />
                                </div>

                                <div className="dp-rating-row" style={{marginBottom: '20px'}}>
                                    <span className="dp-stars">⭐⭐⭐⭐⭐</span>
                                    <span className="dp-reviews">Режим редагування</span>
                                </div>

                                <div className="dp-info-grid">
                                    <div className="dp-info-card">
                                        <span className="dp-info-label">Досвід роботи (років)</span>
                                        <input 
                                            type="number" 
                                            name="years_of_experience" 
                                            value={formData.years_of_experience} 
                                            onChange={handleInputChange} 
                                            className="form-input-inline" 
                                        />
                                    </div>
                                    <div className="dp-info-card">
                                        <span className="dp-info-label">Кваліфікація</span>
                                        <input 
                                            type="text" 
                                            name="qualification" 
                                            value={formData.qualification} 
                                            onChange={handleInputChange} 
                                            className="form-input-inline" 
                                        />
                                    </div>
                                    <div className="dp-info-card">
                                        <span className="dp-info-label">Вартість прийому (грн)</span>
                                        <input 
                                            type="number" 
                                            name="price" 
                                            value={formData.price} 
                                            onChange={handleInputChange} 
                                            className="form-input-inline" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio блок */}
                        <div className="dp-bio-card">
                            <h2 className="dp-bio-title">Про лікаря</h2>
                            <textarea 
                                name="bio" 
                                value={formData.bio} 
                                onChange={handleInputChange} 
                                className="form-textarea-full" 
                                rows="6" 
                                placeholder="Напишіть кілька слів про лікаря..."
                            />
                        </div>

                        {/* Кнопки збереження */}
                        <div className="button-sec-div" style={{marginTop: '30px', display: 'flex', gap: '15px'}}>
                        {/* ВИДАЛИЛИ onClick звідси, тепер працює тільки handleSubmit форми */}
                            <button type="submit" className="save-btn" style={{padding: '14px 32px', fontSize: '16px'}}>
                                💾 Зберегти зміни
                            </button>
    
                            <button type="button" onClick={() => navigate(`/doctors/${id}`)} className="cancel-btn" style={{padding: '14px 32px', fontSize: '16px'}}>
                                Скасувати
                            </button>
                        </div>
                    </form>

                </div>
            </main>

            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`custom-toast toast-${toast.type}`}>
                        {toast.message}
                    </div>
                ))}
            </div>
            <Footer t={t} toggleLang={toggleLang} lang={lang}/>
        </>
    );
}

export default EditDoctorProfile;