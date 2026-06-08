import { Link } from 'react-router-dom';
import './Breadcrumb.css';

function Breadcrumb({ items }) {
    return (
        <nav className="breadcrumb">
            {items.map((item, index) => (
                <span key={index} className="breadcrumb-item">
                    {index < items.length - 1 ? (
                        <>
                            <Link to={item.path} className="breadcrumb-link">{item.label}</Link>
                            <span className="breadcrumb-sep">›</span>
                        </>
                    ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}

export default Breadcrumb;