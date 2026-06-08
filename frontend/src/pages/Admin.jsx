import React, { useEffect, useState, useMemo, useCallback } from 'react';
import './Admin.css';
import { Link } from "react-router-dom";

const API = 'http://localhost:5000/api/admin';
const REHAB_API = 'http://localhost:5000/api/rehabilitation-types';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const STATUS_LABELS = { confirmed: 'Підтверджено', pending: 'Очікує', cancelled: 'Скасовано', completed: 'Завершено' };
const STATUS_CLASS  = { confirmed: 'badge--confirmed', pending: 'badge--pending', cancelled: 'badge--cancelled', completed: 'badge--completed' };
const ROLE_UA = { patient: 'Пацієнт', doctor: 'Лікар', admin: 'Адмін' };

const EMPTY_SERVICE = { name: '', description: '', duration_minutes: '', price: '', category: '' };
const EMPTY_SPEC = {
  first_name: '', last_name: '', middle_name: '',
  email: '', phone: '', password: '',
  specialization: '', qualification: '', years_of_experience: '', bio: '', price: ''
};

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`adm-stat-card ${accent ? 'adm-stat-card--accent' : ''}`}>
      <span className="adm-stat-icon">{icon}</span>
      <div className="adm-stat-body">
        <p className="adm-stat-value">{value ?? '—'}</p>
        <p className="adm-stat-label">{label}</p>
        {sub && <p className="adm-stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="adm-section-title"><span>{children}</span></h2>;
}

function FilterBar({ children, count, label, hasFilters, onReset, actions }) {
  return (
    <div className="adm-filterbar">
      <div className="adm-filterbar-row">
        {children}
        <div className="adm-filterbar-end">
          {hasFilters && (
            <button className="adm-btn adm-btn--reset" onClick={onReset}>
              ✕ Скинути фільтри
            </button>
          )}
          {actions}
          {count !== undefined && (
            <span className="adm-total">Всього: <strong>{count}</strong></span>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, hint, hintColor = 'var(--adm-red)', confirmLabel = 'Підтвердити', confirmColor, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="adm-modal-overlay" onClick={onCancel}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h3 className="adm-modal-title" style={confirmColor ? { color: confirmColor } : {}}>{title}</h3>
          <button className="adm-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="adm-modal-body">
          <p style={{ fontSize: 14, color: 'var(--adm-text)', lineHeight: 1.6 }}>{message}</p>
          {hint && (
            <p style={{ marginTop: 12, padding: '10px 14px', background: hintColor === 'var(--adm-red)' ? 'var(--adm-red-light)' : 'var(--adm-blue-soft)', color: hintColor, borderRadius: 8, fontSize: 13 }}>
              {hint}
            </p>
          )}
        </div>
        <div className="adm-modal-footer">
          <button className="adm-btn adm-btn--ghost" onClick={onCancel}>Скасувати</button>
          <button className="adm-btn adm-btn--primary" style={confirmColor ? { background: confirmColor, borderColor: confirmColor } : {}} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin({ t, toggleLang, lang }) {
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [appointments, setAppointments] = useState({ data: [], total: 0, totalPages: 1 });
  const [users, setUsers] = useState({ data: [], total: 0, totalPages: 1 });
  const [specialists, setSpecialists] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // ── APPOINTMENTS FILTERS ──
  const [apptPage, setApptPage] = useState(1);
  const [apptStatus, setApptStatus] = useState('');
  const [apptSearch, setApptSearch] = useState('');
  const [apptDateFrom, setApptDateFrom] = useState('');
  const [apptDateTo, setApptDateTo] = useState('');
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptPriceMin, setApptPriceMin] = useState('');
  const [apptPriceMax, setApptPriceMax] = useState('');
  const [apptSort, setApptSort] = useState('date_desc');

  // ── USERS FILTERS ──
  const [userPage, setUserPage] = useState(1);
  const [userRole, setUserRole] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userDateFrom, setUserDateFrom] = useState('');
  const [userDateTo, setUserDateTo] = useState('');
  const [userSort, setUserSort] = useState('newest');

  // ── SPECIALISTS FILTERS ──
  const [specSearch, setSpecSearch] = useState('');
  const [specCategory, setSpecCategory] = useState('');
  const [specStatus, setSpecStatus] = useState('');
  const [specExpMin, setSpecExpMin] = useState('');
  const [specExpMax, setSpecExpMax] = useState('');
  const [specPriceMin, setSpecPriceMin] = useState('');
  const [specPriceMax, setSpecPriceMax] = useState('');
  const [specSort, setSpecSort] = useState('');

  // ── SERVICES FILTERS ──
  const [srvSearch, setSrvSearch] = useState('');
  const [srvCategory, setSrvCategory] = useState('');
  const [srvDurMin, setSrvDurMin] = useState('');
  const [srvDurMax, setSrvDurMax] = useState('');
  const [srvPriceMin, setSrvPriceMin] = useState('');
  const [srvPriceMax, setSrvPriceMax] = useState('');
  const [srvSort, setSrvSort] = useState('');

  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [servicePhoto, setServicePhoto] = useState(null);
  const [servicePhotoPreview, setServicePhotoPreview] = useState(null);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);

  const [showSpecModal, setShowSpecModal] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [specForm, setSpecForm] = useState(EMPTY_SPEC);
  const [specSubmitting, setSpecSubmitting] = useState(false);

  const [roleConfirm, setRoleConfirm] = useState({ isOpen: false, userId: null, newRole: '', userName: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, type: '', name: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/dashboard`, { headers: authHeaders() });
      const d = await res.json();
      if (d.success) setDashboard(d.data);
    } finally { setLoading(false); }
  };

  // ── debounced search values (400ms) ──
  const [apptSearchD, setApptSearchD] = useState('');
  const [userSearchD, setUserSearchD] = useState('');
  useEffect(() => { const t = setTimeout(() => setApptSearchD(apptSearch), 400); return () => clearTimeout(t); }, [apptSearch]);
  useEffect(() => { const t = setTimeout(() => setUserSearchD(userSearch), 400); return () => clearTimeout(t); }, [userSearch]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: apptPage, limit: 15 });
      if (apptStatus)   params.set('status',    apptStatus);
      if (apptSearchD)  params.set('search',    apptSearchD);
      if (apptDateFrom) params.set('date_from', apptDateFrom);
      if (apptDateTo)   params.set('date_to',   apptDateTo);
      if (apptDoctor)   params.set('doctor',    apptDoctor);
      if (apptSort)     params.set('sort',      apptSort);
      if (apptPriceMin) params.set('price_min', apptPriceMin);
      if (apptPriceMax) params.set('price_max', apptPriceMax);
      const res = await fetch(`${API}/appointments?${params}`, { headers: authHeaders() });
      const d = await res.json();
      if (d.success) setAppointments({ data: d.data, total: d.total, totalPages: d.totalPages });
    } finally { setLoading(false); }
  }, [apptPage, apptStatus, apptSearchD, apptDateFrom, apptDateTo, apptDoctor, apptSort, apptPriceMin, apptPriceMax]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: userPage, limit: 15 });
      if (userRole)     params.set('role',      userRole);
      if (userSearchD)  params.set('search',    userSearchD);
      if (userDateFrom) params.set('date_from', userDateFrom);
      if (userDateTo)   params.set('date_to',   userDateTo);
      if (userSort)     params.set('sort',      userSort);
      const res = await fetch(`${API}/users?${params}`, { headers: authHeaders() });
      const d = await res.json();
      if (d.success) setUsers({ data: d.data, total: d.total, totalPages: d.totalPages });
    } finally { setLoading(false); }
  }, [userPage, userRole, userSearchD, userDateFrom, userDateTo, userSort]);

  const fetchSpecialists = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/specialists`, { headers: authHeaders() });
      const d = await res.json();
      if (d.success) {
        setSpecialists(d.data);
        const unique = [...new Set(d.data.map(s => s.specialization).filter(Boolean))];
        setSpecializations(unique);
      }
    } finally { setLoading(false); }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(REHAB_API, { headers: authHeaders() });
      const d = await res.json();
      if (d.success) setServices(d.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (tab === 'dashboard')    fetchDashboard(); }, [tab]);
  useEffect(() => { if (tab === 'appointments') fetchAppointments(); }, [tab, fetchAppointments]);
  useEffect(() => { if (tab === 'users')        fetchUsers();        }, [tab, fetchUsers]);
  useEffect(() => { if (tab === 'specialists')  fetchSpecialists();  }, [tab]);
  useEffect(() => { if (tab === 'services') { fetchServices(); fetchSpecialists(); } }, [tab]);

  const handleRoleChangeRequest = (userId, userName, newRole) => setRoleConfirm({ isOpen: true, userId, userName, newRole });

  const executeRoleChange = async () => {
    const { userId, newRole } = roleConfirm;
    setRoleConfirm({ isOpen: false, userId: null, newRole: '', userName: '' });
    const res = await fetch(`${API}/users/${userId}/role`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ role: newRole }) });
    const d = await res.json();
    if (d.success) { showToast('Роль успішно змінено'); fetchUsers(); if (newRole === 'doctor') fetchSpecialists(); }
    else showToast(d.message, 'error');
  };

  const handleDeleteRequest = (id, type, name) => setDeleteConfirm({ isOpen: true, id, type, name });

  const executeDelete = async () => {
    const { id, type } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, id: null, type: '', name: '' });
    let res;
    if (type === 'appointment') res = await fetch(`${API}/appointments/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (type === 'service')     res = await fetch(`${REHAB_API}/${id}`, { method: 'DELETE', headers: authHeaders() });
    const d = await res.json();
    if (d.success) {
      showToast('Видалено успішно');
      if (type === 'appointment') fetchAppointments();
      if (type === 'service')     fetchServices();
    } else showToast(d.message, 'error');
  };

  const handleChangeApptStatus = async (id, status) => {
    const res = await fetch(`${API}/appointments/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    const d = await res.json();
    if (d.success) { showToast('Статус оновлено'); fetchAppointments(); }
    else showToast(d.message, 'error');
  };

  const handleToggleSpecialist = async (id, current) => {
    const res = await fetch(`${API}/specialists/${id}/toggle`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ is_active: !current }) });
    const d = await res.json();
    if (d.success) { showToast(current ? 'Деактивовано' : 'Активовано'); fetchSpecialists(); }
    else showToast(d.message, 'error');
  };

  // ── SERVICES ──
  const openCreateModal = () => { setEditingService(null); setServiceForm(EMPTY_SERVICE); setServicePhoto(null); setServicePhotoPreview(null); setShowServiceModal(true); };
  const openEditModal = (s) => {
    setEditingService(s);
    setServiceForm({ name: s.name || '', description: s.description || '', duration_minutes: s.duration_minutes || '', price: s.price || '', category: s.category || '' });
    setServicePhoto(null); setServicePhotoPreview(s.photo_url_rehab || null); setShowServiceModal(true);
  };
  const handleServicePhotoChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setServicePhoto(file); setServicePhotoPreview(URL.createObjectURL(file));
  };
  const handleServiceSubmit = async () => {
    if (!serviceForm.name.trim()) { showToast("Назва обов'язкова", 'error'); return; }
    if (!serviceForm.price)       { showToast("Ціна обов'язкова", 'error'); return; }
    setServiceSubmitting(true);
    try {
      const url = editingService ? `${REHAB_API}/${editingService.id}` : REHAB_API;
      const method = editingService ? 'PATCH' : 'POST';
      let res;
      if (servicePhoto) {
        const fd = new FormData();
        fd.append('name', serviceForm.name.trim()); fd.append('description', serviceForm.description || '');
        fd.append('duration_minutes', Number(serviceForm.duration_minutes) || ''); fd.append('price', Number(serviceForm.price));
        fd.append('category', serviceForm.category || ''); fd.append('is_active', 'true'); fd.append('photo', servicePhoto);
        res = await fetch(url, { method, headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
      } else {
        res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify({ ...serviceForm, duration_minutes: Number(serviceForm.duration_minutes) || null, price: Number(serviceForm.price), is_active: true }) });
      }
      const d = await res.json();
      if (d.success) { showToast(editingService ? 'Послугу оновлено' : 'Послугу створено'); setShowServiceModal(false); fetchServices(); }
      else showToast(d.message, 'error');
    } finally { setServiceSubmitting(false); }
  };

  // ── SPECIALISTS ──
  const openCreateSpecModal = () => { setEditingSpec(null); setSpecForm(EMPTY_SPEC); setShowSpecModal(true); };
  const openEditSpecModal = (s) => {
    setEditingSpec(s);
    setSpecForm({ specialization: s.specialization || '', qualification: s.qualification || '', years_of_experience: s.years_of_experience || '', bio: s.bio || '', price: s.price || '', first_name: '', last_name: '', middle_name: '', email: '', phone: '', password: '' });
    setShowSpecModal(true);
  };
  const handleSpecSubmit = async () => {
    if (!specForm.specialization.trim()) return showToast('Спеціалізація обов\'язкова', 'error');
    if (!specForm.price || Number(specForm.price) <= 0) return showToast('Ціна має бути більше нуля', 'error');
    if (!editingSpec) {
      if (!specForm.last_name.trim()) return showToast('Прізвище обов\'язкове', 'error');
      if (!specForm.first_name.trim()) return showToast('Ім\'я обов\'язкове', 'error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(specForm.email)) return showToast('Некоректний email', 'error');
      if (specForm.password.length < 8) return showToast('Пароль мінімум 8 символів', 'error');
      if (!/[A-Z]/.test(specForm.password)) return showToast('Пароль має містити велику літеру', 'error');
      if (!/[0-9]/.test(specForm.password)) return showToast('Пароль має містити цифру', 'error');
    }
    setSpecSubmitting(true);
    try {
      if (editingSpec) {
        const res = await fetch(`http://localhost:5000/api/specialists/${editingSpec.specialist_id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ specialization: specForm.specialization, qualification: specForm.qualification, years_of_experience: Number(specForm.years_of_experience) || 0, bio: specForm.bio, price: Number(specForm.price) || 0 }) });
        const d = await res.json();
        if (d.success) { showToast('Профіль оновлено'); setShowSpecModal(false); fetchSpecialists(); }
        else showToast(d.message || 'Помилка', 'error');
      } else {
        const res = await fetch('http://localhost:5000/api/auth/register-staff', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ firstName: specForm.first_name.trim(), lastName: specForm.last_name.trim(), middleName: specForm.middle_name.trim() || undefined, email: specForm.email.trim(), phone: specForm.phone.trim() || undefined, password: specForm.password, role: 'doctor', specialization: specForm.specialization.trim(), qualification: specForm.qualification.trim() || undefined, yearsOfExperience: Number(specForm.years_of_experience) || 0, bio: specForm.bio.trim() || undefined, price: Number(specForm.price) }) });
        const d = await res.json();
        if (res.ok) { showToast('Фахівця створено'); setShowSpecModal(false); fetchSpecialists(); fetchUsers(); }
        else showToast(d.message || 'Помилка', 'error');
      }
    } catch { showToast('Помилка сервера', 'error'); }
    finally { setSpecSubmitting(false); }
  };

  // ── CLIENT-SIDE FILTERED DATA ──

  const filteredSpecialists = useMemo(() => {
    let result = specialists.filter(s => {
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const matchSearch = !specSearch || fullName.includes(specSearch.toLowerCase());
      const matchCat = !specCategory || s.specialization === specCategory;
      const matchStatus = !specStatus || (specStatus === 'active' ? s.is_active : !s.is_active);
      const exp = Number(s.years_of_experience ?? 0);
      const matchExpMin = !specExpMin || exp >= Number(specExpMin);
      const matchExpMax = !specExpMax || exp <= Number(specExpMax);
      const price = Number(s.price ?? 0);
      const matchPriceMin = !specPriceMin || price >= Number(specPriceMin);
      const matchPriceMax = !specPriceMax || price <= Number(specPriceMax);
      return matchSearch && matchCat && matchStatus && matchExpMin && matchExpMax && matchPriceMin && matchPriceMax;
    });
    if (specSort === 'price_asc')    result = [...result].sort((a,b) => Number(a.price||0) - Number(b.price||0));
    if (specSort === 'price_desc')   result = [...result].sort((a,b) => Number(b.price||0) - Number(a.price||0));
    if (specSort === 'exp_asc')      result = [...result].sort((a,b) => Number(a.years_of_experience||0) - Number(b.years_of_experience||0));
    if (specSort === 'exp_desc')     result = [...result].sort((a,b) => Number(b.years_of_experience||0) - Number(a.years_of_experience||0));
    if (specSort === 'revenue_desc') result = [...result].sort((a,b) => Number(b.revenue||0) - Number(a.revenue||0));
    if (specSort === 'appts_desc')   result = [...result].sort((a,b) => Number(b.confirmed_appointments||0) - Number(a.confirmed_appointments||0));
    return result;
  }, [specialists, specSearch, specCategory, specStatus, specExpMin, specExpMax, specPriceMin, specPriceMax, specSort]);

  const filteredServices = useMemo(() => {
    let result = services.filter(s => {
      const matchSearch = !srvSearch || s.name.toLowerCase().includes(srvSearch.toLowerCase()) || (s.description || '').toLowerCase().includes(srvSearch.toLowerCase());
      const matchCat = !srvCategory || s.category === srvCategory;
      const dur = Number(s.duration_minutes ?? 0);
      const matchDurMin = !srvDurMin || dur >= Number(srvDurMin);
      const matchDurMax = !srvDurMax || dur <= Number(srvDurMax);
      const price = Number(s.price ?? 0);
      const matchPriceMin = !srvPriceMin || price >= Number(srvPriceMin);
      const matchPriceMax = !srvPriceMax || price <= Number(srvPriceMax);
      return matchSearch && matchCat && matchDurMin && matchDurMax && matchPriceMin && matchPriceMax;
    });
    if (srvSort === 'price_asc')  result = [...result].sort((a,b) => Number(a.price||0) - Number(b.price||0));
    if (srvSort === 'price_desc') result = [...result].sort((a,b) => Number(b.price||0) - Number(a.price||0));
    if (srvSort === 'dur_asc')    result = [...result].sort((a,b) => Number(a.duration_minutes||0) - Number(b.duration_minutes||0));
    if (srvSort === 'dur_desc')   result = [...result].sort((a,b) => Number(b.duration_minutes||0) - Number(a.duration_minutes||0));
    if (srvSort === 'name_asc')   result = [...result].sort((a,b) => a.name.localeCompare(b.name));
    return result;
  }, [services, srvSearch, srvCategory, srvDurMin, srvDurMax, srvPriceMin, srvPriceMax, srvSort]);

  const srvCategories = [...new Set(services.map(s => s.category).filter(Boolean))];

  const apptHasFilters = apptStatus || apptSearch || apptDateFrom || apptDateTo || apptDoctor || apptPriceMin || apptPriceMax || apptSort !== 'date_desc';
  const userHasFilters = userRole || userSearch || userDateFrom || userDateTo || userSort !== 'newest';
  const specHasFilters = specSearch || specCategory || specStatus || specExpMin || specExpMax || specPriceMin || specPriceMax || specSort;
  const srvHasFilters  = srvSearch || srvCategory || srvDurMin || srvDurMax || srvPriceMin || srvPriceMax || srvSort;

  const resetApptFilters = () => { setApptStatus(''); setApptSearch(''); setApptDateFrom(''); setApptDateTo(''); setApptDoctor(''); setApptPriceMin(''); setApptPriceMax(''); setApptSort('date_desc'); setApptPage(1); };
  const resetUserFilters = () => { setUserRole(''); setUserSearch(''); setUserDateFrom(''); setUserDateTo(''); setUserSort('newest'); setUserPage(1); };
  const resetSpecFilters = () => { setSpecSearch(''); setSpecCategory(''); setSpecStatus(''); setSpecExpMin(''); setSpecExpMax(''); setSpecPriceMin(''); setSpecPriceMax(''); setSpecSort(''); };
  const resetSrvFilters  = () => { setSrvSearch(''); setSrvCategory(''); setSrvDurMin(''); setSrvDurMax(''); setSrvPriceMin(''); setSrvPriceMax(''); setSrvSort(''); };

  const st = dashboard?.stats;
  const formatMoney = (v) => Number(v || 0).toLocaleString('uk-UA') + ' ₴';
  const formatDate  = (d) => d ? new Date(d).toLocaleDateString('uk-UA') : '—';

  const TAB_TITLES = { dashboard: 'Дашборд', appointments: 'Записи', users: 'Користувачі', specialists: 'Спеціалісти', services: 'Послуги' };

  // unique doctors from appointments for filter
  const apptDoctors = [...new Set(appointments.data.map(a => `${a.doctor_last_name} ${a.doctor_first_name}`).filter(Boolean))];

  return (
    <div className="adm-root">
      {toast && <div className={`adm-toast adm-toast--${toast.type}`}>{toast.msg}</div>}

      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <span className="adm-logo-icon">⚕</span>
          <span className="adm-logo-text">Адмін панель</span>
        </div>
        <nav className="adm-nav">
          {[
            { key: 'dashboard',    icon: '◈', label: 'Дашборд' },
            { key: 'appointments', icon: '◷', label: 'Записи' },
            { key: 'users',        icon: '◉', label: 'Користувачі' },
            { key: 'specialists',  icon: '✦', label: 'Спеціалісти' },
            { key: 'services',     icon: '🩹', label: 'Послуги' },
          ].map(({ key, icon, label }) => (
            <button key={key} className={`adm-nav-item ${tab === key ? 'adm-nav-item--active' : ''}`} onClick={() => setTab(key)}>
              <span className="adm-nav-icon">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="adm-main">
        <header className="adm-topbar">
          <h1 className="adm-topbar-title">{TAB_TITLES[tab]}</h1>
          <div className="adm-topbar-meta">
            <span className="adm-topbar-date">{new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <Link to="/" className="adm-btn adm-btn--ghost adm-btn--sm" style={{ marginLeft: 12 }}>← Головна</Link>
          </div>
        </header>

        <div className="adm-content">
          {loading && <div className="adm-loader"><span className="adm-spinner" /></div>}

          {/* ─── DASHBOARD ─── */}
          {tab === 'dashboard' && dashboard && (
            <>
              <div className="adm-stat-grid">
                <StatCard icon="👤" label="Пацієнтів" value={st.total_patients} accent />
                <StatCard icon="🩺" label="Лікарів" value={st.total_doctors} />
                <StatCard icon="📅" label="Всього записів" value={st.total_appointments} />
                <StatCard icon="✅" label="Підтверджено" value={st.confirmed_appointments} />
                <StatCard icon="⏳" label="Очікує" value={st.pending_appointments} />
                <StatCard icon="❌" label="Скасовано" value={st.cancelled_appointments} />
                <StatCard icon="✅📆" label="Завершено" value={st.completed_appointments} />
                <StatCard icon="📆" label="Сьогодні" value={st.today_appointments} sub="записів" />
                <StatCard icon="💰" label="Дохід сьогодні" value={formatMoney(st.today_revenue)} accent />
                <StatCard icon="📊" label="Дохід за місяць" value={formatMoney(st.monthly_revenue)} />
                <StatCard icon="💎" label="Загальний дохід" value={formatMoney(st.total_revenue)} accent />
              </div>
              <div className="adm-two-col">
                <div className="adm-card">
                  <SectionTitle>Топ спеціалісти</SectionTitle>
                  <table className="adm-table">
                    <thead><tr><th>Лікар</th><th>Спеціалізація</th><th>Записів</th><th>Дохід</th></tr></thead>
                    <tbody>
                      {dashboard.topSpecialists.map(sp => (
                        <tr key={sp.specialist_id}>
                          <td>{sp.last_name} {sp.first_name}</td>
                          <td><span className="badge badge--info">{sp.specialization}</span></td>
                          <td><strong>{sp.confirmed_appointments}</strong></td>
                          <td className="adm-money">{formatMoney(sp.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="adm-card">
                  <SectionTitle>Останні записи</SectionTitle>
                  <div className="adm-recent-list">
                    {dashboard.recentAppointments.map(a => (
                      <div key={a.id} className="adm-recent-item">
                        <div className="adm-recent-left">
                          <span className="adm-recent-name">{a.guest_name || `${a.patient_last_name ?? ''} ${a.patient_first_name ?? ''}`.trim() || '—'}</span>
                          <span className="adm-recent-meta">{a.doctor_last_name} · {a.specialization}</span>
                        </div>
                        <div className="adm-recent-right">
                          <span className="adm-recent-date">{formatDate(a.appointment_date)} {String(a.appointment_time).slice(0,5)}</span>
                          <span className={`badge ${STATUS_CLASS[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="adm-card">
                <SectionTitle>Записи по місяцях</SectionTitle>
                {dashboard.appointmentsChart.length === 0 ? (
                  <p style={{ color: 'var(--adm-muted)', fontSize: 13 }}>Даних поки немає</p>
                ) : (
                  <table className="adm-table">
                    <thead><tr><th>Місяць</th><th>Всього</th><th>Підтверджено</th><th>Очікує</th><th>Скасовано</th></tr></thead>
                    <tbody>
                      {dashboard.appointmentsChart.map((m, i) => (
                        <tr key={i}>
                          <td className="adm-td-name">{m.month}</td>
                          <td><strong>{m.total}</strong></td>
                          <td><span className="badge badge--confirmed">{m.confirmed}</span></td>
                          <td><span className="badge badge--pending">{m.pending}</span></td>
                          <td><span className="badge badge--cancelled">{m.cancelled}</span></td>
                          <td><span className="badge badge--cancelled">{m.completed}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ─── APPOINTMENTS ─── */}
          {tab === 'appointments' && (
            <div className="adm-card">
              <FilterBar
                count={appointments.total}
                hasFilters={apptHasFilters}
                onReset={resetApptFilters}
              >
                <div className="adm-filter-grid">
                  <input className="adm-input" placeholder="🔍 Пошук за ім'ям або email" value={apptSearch}
                    onChange={e => { setApptSearch(e.target.value); setApptPage(1); }} />
                  <select className="adm-select" value={apptStatus} onChange={e => { setApptStatus(e.target.value); setApptPage(1); }}>
                    <option value="">Всі статуси</option>
                    <option value="pending">Очікує</option>
                    <option value="confirmed">Підтверджено</option>
                    <option value="cancelled">Скасовано</option>
                    <option value="completed">Завершено</option>
                  </select>
                  <select className="adm-select" value={apptSort} onChange={e => { setApptSort(e.target.value); setApptPage(1); }}>
                    <option value="date_desc">Дата: нові спочатку</option>
                    <option value="date_asc">Дата: старі спочатку</option>
                    <option value="price_desc">Ціна: від високої</option>
                    <option value="price_asc">Ціна: від низької</option>
                  </select>
                </div>
                <div className="adm-filter-ranges">
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Дата від</label>
                    <input className="adm-input adm-input--date" type="date" value={apptDateFrom} onChange={e => { setApptDateFrom(e.target.value); setApptPage(1); }} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Дата до</label>
                    <input className="adm-input adm-input--date" type="date" value={apptDateTo} onChange={e => { setApptDateTo(e.target.value); setApptPage(1); }} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Ціна від (₴)</label>
                    <input className="adm-input" type="number" placeholder="0" value={apptPriceMin} onChange={e => setApptPriceMin(e.target.value)} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Ціна до (₴)</label>
                    <input className="adm-input" type="number" placeholder="∞" value={apptPriceMax} onChange={e => setApptPriceMax(e.target.value)} />
                  </div>
                </div>
              </FilterBar>
              <table className="adm-table adm-table--full">
                <thead><tr><th>#</th><th>Пацієнт</th><th>Лікар</th><th>Дата</th><th>Час</th><th>Ціна</th><th>Статус</th><th>Дії</th></tr></thead>
                <tbody>
                  {appointments.data.map(a => (
                    <tr key={a.id}>
                      <td className="adm-td-muted">{a.id}</td>
                      <td>
                        <div className="adm-td-name">{a.guest_name || `${a.patient_last_name ?? ''} ${a.patient_first_name ?? ''}`.trim() || '—'}</div>
                        <div className="adm-td-sub">{a.guest_email || a.patient_email || ''}</div>
                      </td>
                      <td>
                        <div className="adm-td-name">{a.doctor_last_name} {a.doctor_first_name}</div>
                        <div className="adm-td-sub">{a.specialization}</div>
                      </td>
                      <td>{formatDate(a.appointment_date)}</td>
                      <td>{String(a.appointment_time).slice(0,5)}</td>
                      <td className="adm-money">{formatMoney(a.price)}</td>
                      <td>
                        <select className={`adm-status-select badge ${STATUS_CLASS[a.status]}`} value={a.status}
                          onChange={e => handleChangeApptStatus(a.id, e.target.value)}>
                          <option value="pending">Очікує</option>
                          <option value="confirmed">Підтверджено</option>
                          <option value="cancelled">Скасовано</option>
                          <option value="completed">Завершено</option>
                        </select>
                      </td>
                      <td>
                        <button className="adm-btn adm-btn--danger adm-btn--sm"
                          onClick={() => handleDeleteRequest(a.id, 'appointment', `Запис #${a.id}`)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="adm-pagination">
                <button className="adm-btn adm-btn--ghost" disabled={apptPage <= 1} onClick={() => setApptPage(p => p - 1)}>‹ Назад</button>
                <span>{apptPage} / {appointments.totalPages}</span>
                <button className="adm-btn adm-btn--ghost" disabled={apptPage >= appointments.totalPages} onClick={() => setApptPage(p => p + 1)}>Далі ›</button>
              </div>
            </div>
          )}

          {/* ─── USERS ─── */}
          {tab === 'users' && (
            <div className="adm-card">
              <FilterBar
                count={users.total}
                hasFilters={userHasFilters}
                onReset={resetUserFilters}
              >
                <div className="adm-filter-grid">
                  <input className="adm-input" placeholder="🔍 Пошук за ім'ям, email, телефоном" value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
                  <select className="adm-select" value={userRole} onChange={e => { setUserRole(e.target.value); setUserPage(1); }}>
                    <option value="">Всі ролі</option>
                    <option value="patient">Пацієнт</option>
                    <option value="doctor">Лікар</option>
                    <option value="admin">Адмін</option>
                  </select>
                  <select className="adm-select" value={userSort} onChange={e => { setUserSort(e.target.value); setUserPage(1); }}>
                    <option value="newest">Реєстрація: нові спочатку</option>
                    <option value="oldest">Реєстрація: старі спочатку</option>
                    <option value="name_asc">Ім'я: А → Я</option>
                    <option value="name_desc">Ім'я: Я → А</option>
                  </select>
                </div>
                <div className="adm-filter-ranges">
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Зареєстрований від</label>
                    <input className="adm-input adm-input--date" type="date" value={userDateFrom} onChange={e => { setUserDateFrom(e.target.value); setUserPage(1); }} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Зареєстрований до</label>
                    <input className="adm-input adm-input--date" type="date" value={userDateTo} onChange={e => { setUserDateTo(e.target.value); setUserPage(1); }} />
                  </div>
                </div>
              </FilterBar>
              <table className="adm-table adm-table--full">
                <thead><tr><th>#</th><th>Користувач</th><th>Email</th><th>Телефон</th><th>Роль</th><th>Зареєстрований</th></tr></thead>
                <tbody>
                  {users.data.map(u => (
                    <tr key={u.id}>
                      <td className="adm-td-muted">{u.id}</td>
                      <td className="adm-td-name">{u.last_name} {u.first_name} {u.middle_name ?? ''}</td>
                      <td className="adm-td-sub">{u.email}</td>
                      <td className="adm-td-sub">{u.phone || '—'}</td>
                      <td>
                        <select className="adm-role-select" value={u.role}
                          onChange={e => handleRoleChangeRequest(u.id, `${u.first_name} ${u.last_name}`, e.target.value)}>
                          <option value="patient">Пацієнт</option>
                          <option value="doctor">Лікар</option>
                          <option value="admin">Адмін</option>
                        </select>
                      </td>
                      <td>{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="adm-pagination">
                <button className="adm-btn adm-btn--ghost" disabled={userPage <= 1} onClick={() => setUserPage(p => p - 1)}>‹ Назад</button>
                <span>{userPage} / {users.totalPages}</span>
                <button className="adm-btn adm-btn--ghost" disabled={userPage >= users.totalPages} onClick={() => setUserPage(p => p + 1)}>Далі ›</button>
              </div>
            </div>
          )}

          {/* ─── SPECIALISTS ─── */}
          {tab === 'specialists' && (
            <div className="adm-card">
              <FilterBar
                count={filteredSpecialists.length}
                hasFilters={specHasFilters}
                onReset={resetSpecFilters}
                actions={<button className="adm-btn adm-btn--primary" onClick={openCreateSpecModal}>+ Додати фахівця</button>}
              >
                <div className="adm-filter-grid">
                  <input className="adm-input" placeholder="🔍 Пошук за ім'ям..." value={specSearch} onChange={e => setSpecSearch(e.target.value)} />
                  <select className="adm-select" value={specCategory} onChange={e => setSpecCategory(e.target.value)}>
                    <option value="">Усі спеціалізації</option>
                    {specializations.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                  </select>
                  <select className="adm-select" value={specStatus} onChange={e => setSpecStatus(e.target.value)}>
                    <option value="">Будь-який статус</option>
                    <option value="active">Активні</option>
                    <option value="inactive">Неактивні</option>
                  </select>
                  <select className="adm-select" value={specSort} onChange={e => setSpecSort(e.target.value)}>
                    <option value="">Сортування</option>
                    <option value="price_asc">Ціна: зростання</option>
                    <option value="price_desc">Ціна: спадання</option>
                    <option value="exp_asc">Досвід: менший</option>
                    <option value="exp_desc">Досвід: більший</option>
                    <option value="appts_desc">Записів: більше</option>
                    <option value="revenue_desc">Дохід: більший</option>
                  </select>
                </div>
                <div className="adm-filter-ranges">
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Досвід від (р.)</label>
                    <input className="adm-input" type="number" min="0" placeholder="0" value={specExpMin} onChange={e => setSpecExpMin(e.target.value)} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Досвід до (р.)</label>
                    <input className="adm-input" type="number" min="0" placeholder="∞" value={specExpMax} onChange={e => setSpecExpMax(e.target.value)} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Ціна від (₴)</label>
                    <input className="adm-input" type="number" min="0" placeholder="0" value={specPriceMin} onChange={e => setSpecPriceMin(e.target.value)} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Ціна до (₴)</label>
                    <input className="adm-input" type="number" min="0" placeholder="∞" value={specPriceMax} onChange={e => setSpecPriceMax(e.target.value)} />
                  </div>
                </div>
              </FilterBar>
              <table className="adm-table adm-table--full">
                <thead><tr><th>Лікар</th><th>Спеціалізація</th><th>Кваліфікація</th><th>Досвід</th><th>Ціна</th><th>Записів</th><th>Дохід</th><th>Статус</th><th>Дії</th></tr></thead>
                <tbody>
                  {filteredSpecialists.map(sp => (
                    <tr key={sp.specialist_id}>
                      <td>
                        <div className="adm-spec-row">
                          {sp.photo_url
                            ? <img src={sp.photo_url} className="adm-spec-avatar" alt="" />
                            : <div className="adm-spec-avatar adm-spec-avatar--placeholder">{sp.last_name?.[0]}</div>
                          }
                          <div>
                            <div className="adm-td-name">{sp.last_name} {sp.first_name} {sp.middle_name ?? ''}</div>
                            <div className="adm-td-sub">{sp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge--info">{sp.specialization}</span></td>
                      <td className="adm-td-sub">{sp.qualification || '—'}</td>
                      <td>{sp.years_of_experience ? `${sp.years_of_experience} р.` : '—'}</td>
                      <td className="adm-money">{sp.price ? formatMoney(sp.price) : '—'}</td>
                      <td><strong>{sp.confirmed_appointments}</strong></td>
                      <td className="adm-money">{formatMoney(sp.revenue)}</td>
                      <td>
                        <button className={`adm-toggle-btn ${sp.is_active ? 'adm-toggle-btn--on' : 'adm-toggle-btn--off'}`}
                          onClick={() => handleToggleSpecialist(sp.specialist_id, sp.is_active)}>
                          {sp.is_active ? 'Активний' : 'Неактивний'}
                        </button>
                      </td>
                      <td>
                        <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEditSpecModal(sp)}>✎</button>
                      </td>
                    </tr>
                  ))}
                  {filteredSpecialists.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--adm-muted)' }}>Спеціалістів не знайдено</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── SERVICES ─── */}
          {tab === 'services' && (
            <div className="adm-card">
              <FilterBar
                count={filteredServices.length}
                hasFilters={srvHasFilters}
                onReset={resetSrvFilters}
                actions={<button className="adm-btn adm-btn--primary" onClick={openCreateModal}>+ Додати послугу</button>}
              >
                <div className="adm-filter-grid">
                  <input className="adm-input" placeholder="🔍 Пошук за назвою або описом" value={srvSearch} onChange={e => setSrvSearch(e.target.value)} />
                  <select className="adm-select" value={srvCategory} onChange={e => setSrvCategory(e.target.value)}>
                    <option value="">Усі категорії</option>
                    {srvCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="adm-select" value={srvSort} onChange={e => setSrvSort(e.target.value)}>
                    <option value="">Сортування</option>
                    <option value="name_asc">Назва: А → Я</option>
                    <option value="price_asc">Ціна: зростання</option>
                    <option value="price_desc">Ціна: спадання</option>
                    <option value="dur_asc">Тривалість: менша</option>
                    <option value="dur_desc">Тривалість: більша</option>
                  </select>
                </div>
                <div className="adm-filter-ranges">
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Ціна від (₴)</label>
                    <input className="adm-input" type="number" min="0" placeholder="0" value={srvPriceMin} onChange={e => setSrvPriceMin(e.target.value)} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Ціна до (₴)</label>
                    <input className="adm-input" type="number" min="0" placeholder="∞" value={srvPriceMax} onChange={e => setSrvPriceMax(e.target.value)} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Тривалість від (хв)</label>
                    <input className="adm-input" type="number" min="0" placeholder="0" value={srvDurMin} onChange={e => setSrvDurMin(e.target.value)} />
                  </div>
                  <div className="adm-filter-range">
                    <label className="adm-filter-range-label">Тривалість до (хв)</label>
                    <input className="adm-input" type="number" min="0" placeholder="∞" value={srvDurMax} onChange={e => setSrvDurMax(e.target.value)} />
                  </div>
                </div>
              </FilterBar>
              <table className="adm-table adm-table--full">
                <thead><tr><th>Фото</th><th>Назва</th><th>Спеціалізація</th><th>Тривалість</th><th>Ціна</th><th>Дії</th></tr></thead>
                <tbody>
                  {filteredServices.map(s => (
                    <tr key={s.id}>
                      <td>
                        {s.photo_url_rehab
                          ? <img src={s.photo_url_rehab} alt={s.name} className="adm-srv-photo" />
                          : <div className="adm-srv-photo adm-srv-photo--empty">🖼</div>
                        }
                      </td>
                      <td>
                        <div className="adm-td-name">{s.name}</div>
                        {s.description && <div className="adm-td-sub">{s.description}</div>}
                      </td>
                      <td>{s.category ? <span className="badge badge--info">{s.category}</span> : <span className="adm-td-muted">—</span>}</td>
                      <td className="adm-td-muted">{s.duration_minutes ? `${s.duration_minutes} хв` : '—'}</td>
                      <td className="adm-money">{formatMoney(s.price)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => openEditModal(s)}>✎</button>
                          <button className="adm-btn adm-btn--danger adm-btn--sm" onClick={() => handleDeleteRequest(s.id, 'service', s.name)}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredServices.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--adm-muted)' }}>Послуги не знайдено</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={roleConfirm.isOpen}
        title="Зміна ролі користувача"
        message={`Ви дійсно хочете змінити роль користувача "${roleConfirm.userName}" на "${ROLE_UA[roleConfirm.newRole]}"?`}
        hint={roleConfirm.newRole === 'doctor' ? 'Користувач буде автоматично доданий до списку спеціалістів.' : undefined}
        hintColor="var(--adm-blue)"
        confirmLabel="Підтвердити"
        onConfirm={executeRoleChange}
        onCancel={() => setRoleConfirm({ isOpen: false, userId: null, newRole: '', userName: '' })}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Підтвердження видалення"
        message={`Ви дійсно хочете видалити "${deleteConfirm.name}"?`}
        hint="Ця дія незворотна. Всі пов'язані дані можуть бути втрачені."
        confirmLabel="Видалити"
        confirmColor="#dc2626"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null, type: '', name: '' })}
      />

      {showServiceModal && (
        <div className="adm-modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">{editingService ? 'Редагувати послугу' : 'Нова послуга'}</h3>
              <button className="adm-modal-close" onClick={() => setShowServiceModal(false)}>×</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-field"><label>Назва*</label>
                <input className="adm-input adm-input--full" value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))} placeholder="Масаж спини" /></div>
              <div className="adm-field"><label>Опис</label>
                <textarea className="adm-textarea" value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))} placeholder="Короткий опис..." rows={3} style={{ resize: 'none' }} /></div>
              <div className="adm-field-row">
                <div className="adm-field"><label>Тривалість (хв)</label>
                  <input className="adm-input adm-input--full" type="number" min="1" value={serviceForm.duration_minutes} onChange={e => setServiceForm(p => ({ ...p, duration_minutes: e.target.value }))} placeholder="60" /></div>
                <div className="adm-field"><label>Ціна (₴)*</label>
                  <input className="adm-input adm-input--full" type="number" min="0" value={serviceForm.price} onChange={e => setServiceForm(p => ({ ...p, price: e.target.value }))} placeholder="500" /></div>
              </div>
              <div className="adm-field"><label>Спеціалізація (категорія)</label>
                <select className="adm-select adm-input--full" value={serviceForm.category} onChange={e => setServiceForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">— Без категорії —</option>
                  {specializations.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                </select></div>
              <div className="adm-field"><label>Фото послуги</label>
                <div className="adm-photo-upload">
                  {servicePhotoPreview && (
                    <div className="adm-photo-preview">
                      <img src={servicePhotoPreview} alt="preview" className="adm-photo-img" />
                      <button type="button" className="adm-photo-remove" onClick={() => { setServicePhoto(null); setServicePhotoPreview(null); }}>✕</button>
                    </div>
                  )}
                  <label className="adm-photo-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    {servicePhotoPreview ? 'Змінити фото' : 'Завантажити фото'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleServicePhotoChange} />
                  </label>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--ghost" onClick={() => setShowServiceModal(false)}>Скасувати</button>
              <button className="adm-btn adm-btn--primary" onClick={handleServiceSubmit} disabled={serviceSubmitting}>
                {serviceSubmitting ? 'Збереження...' : editingService ? 'Зберегти' : 'Створити'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSpecModal && (
        <div className="adm-modal-overlay" onClick={() => setShowSpecModal(false)}>
          <div className="adm-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3 className="adm-modal-title">{editingSpec ? `Редагувати: ${editingSpec.last_name} ${editingSpec.first_name}` : 'Новий фахівець'}</h3>
              <button className="adm-modal-close" onClick={() => setShowSpecModal(false)}>×</button>
            </div>
            <div className="adm-modal-body">
              {!editingSpec && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-navy)', marginBottom: 10 }}>Особисті дані</p>
                  <div className="adm-field-row">
                    <div className="adm-field"><label>Прізвище*</label><input className="adm-input adm-input--full" value={specForm.last_name} onChange={e => setSpecForm(p => ({ ...p, last_name: e.target.value }))} /></div>
                    <div className="adm-field"><label>Ім'я*</label><input className="adm-input adm-input--full" value={specForm.first_name} onChange={e => setSpecForm(p => ({ ...p, first_name: e.target.value }))} /></div>
                  </div>
                  <div className="adm-field-row">
                    <div className="adm-field"><label>Email*</label><input className="adm-input adm-input--full" type="email" value={specForm.email} onChange={e => setSpecForm(p => ({ ...p, email: e.target.value }))} /></div>
                    <div className="adm-field"><label>Телефон</label><input className="adm-input adm-input--full" value={specForm.phone} onChange={e => setSpecForm(p => ({ ...p, phone: e.target.value }))} /></div>
                  </div>
                  <div className="adm-field"><label>Тимчасовий пароль*</label><input className="adm-input adm-input--full" value={specForm.password} placeholder="Мінімум 8 символів, велика літера, цифра" onChange={e => setSpecForm(p => ({ ...p, password: e.target.value }))} /></div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--adm-border)', margin: '16px 0' }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-navy)', marginBottom: 10 }}>Професійні дані</p>
                </>
              )}
              <div className="adm-field-row">
                <div className="adm-field"><label>Спеціалізація*</label><input className="adm-input adm-input--full" value={specForm.specialization} onChange={e => setSpecForm(p => ({ ...p, specialization: e.target.value }))} placeholder="Реабілітолог" /></div>
                <div className="adm-field"><label>Ціна (₴)*</label><input className="adm-input adm-input--full" type="number" value={specForm.price} onChange={e => setSpecForm(p => ({ ...p, price: e.target.value }))} /></div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field"><label>Кваліфікація</label><input className="adm-input adm-input--full" value={specForm.qualification} onChange={e => setSpecForm(p => ({ ...p, qualification: e.target.value }))} /></div>
                <div className="adm-field"><label>Досвід (років)</label><input className="adm-input adm-input--full" type="number" value={specForm.years_of_experience} onChange={e => setSpecForm(p => ({ ...p, years_of_experience: e.target.value }))} /></div>
              </div>
              <div className="adm-field"><label>Біо</label><textarea className="adm-textarea" rows={3} value={specForm.bio} onChange={e => setSpecForm(p => ({ ...p, bio: e.target.value }))} style={{ resize: 'none' }} /></div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--ghost" onClick={() => setShowSpecModal(false)}>Скасувати</button>
              <button className="adm-btn adm-btn--primary" onClick={handleSpecSubmit} disabled={specSubmitting}>
                {specSubmitting ? 'Збереження...' : editingSpec ? 'Зберегти' : 'Створити'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}