import React, {useState} from 'react';
import {useLanguage} from '../../LanguageContext';

interface DeleteBookModalProps {
    onConfirm: () => void;
    onClose: () => void;
}

const DeleteBookModal: React.FC<DeleteBookModalProps> = ({onConfirm, onClose}) => {
    const [confirmText, setConfirmText] = useState('');
    const {t} = useLanguage();

    const handleConfirm = () => {
        if (confirmText === t.deleteBook.confirmWord) {
            onConfirm();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} data-testid="delete-book-modal">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>{t.deleteBook.title}</h3>
                <p>{t.deleteBook.confirmMessage}</p>
                <div className="form-group">
                    <input
                        className="input"
                        type="text"
                        placeholder={t.deleteBook.placeholder}
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        data-testid="delete-confirm-input"
                    />
                </div>
                <button 
                    className="btn btn-primary" 
                    onClick={handleConfirm}
                    disabled={confirmText !== t.deleteBook.confirmWord}
                    data-testid="delete-confirm-button"
                >
                    {t.deleteBook.deleteButton}
                </button>
                <button className="btn btn-secondary" onClick={onClose} data-testid="delete-cancel-button">
                    {t.deleteBook.cancelButton}
                </button>
            </div>
        </div>
    );
};

export default DeleteBookModal;
