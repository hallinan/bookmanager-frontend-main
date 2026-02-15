import React from 'react';

interface ErrorPopupProps {
    message: string;
    onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = React.memo(({message, onClose}) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal error-popup" onClick={(e) => e.stopPropagation()}>
                <h3>⚠️ Error</h3>
                <p>{message}</p>
                <button className="btn btn-primary" onClick={onClose}>OK</button>
            </div>
        </div>
    );
});

export default ErrorPopup;
