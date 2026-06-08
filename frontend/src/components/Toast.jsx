import './Toast.css';

const ICONS = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
};

function Toast({ toasts }) {
    if (!toasts.length) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast--${toast.type}`}>
                    <span className="toast-icon">{ICONS[toast.type]}</span>
                    <span className="toast-message">{toast.message}</span>
                </div>
            ))}
        </div>
    );
}

export default Toast;