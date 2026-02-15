import React, {useState, useEffect} from 'react';
import {Book} from '../../features/bookReducer';
import AuthorSelect from '../Author/AuthorSelect';
import ErrorPopup from './ErrorPopup';
import {fetchAuthors} from '../../api/api';
import {useLanguage} from '../../LanguageContext';

interface EditBookModalProps {
    book: Book;
    onSave: (book: Book, authorId: number) => void;
    onClose: () => void;
}

const EditBookModal: React.FC<EditBookModalProps> = ({book, onSave, onClose}) => {
    const [editedBook, setEditedBook] = useState(book);
    const [authorId, setAuthorId] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const {t} = useLanguage();

    useEffect(() => {
        const loadAuthorId = async () => {
            try {
                const authors = await fetchAuthors();
                const author = authors.find(a => a.name === book.author);
                if (author) setAuthorId(author.id);
            } catch (err) {
                setError(err instanceof Error ? err.message : t.editBook.errorLoadingAuthors);
            }
        };
        loadAuthorId();
    }, [book.author, t.editBook.errorLoadingAuthors]);

    const hasChanges = editedBook.title !== book.title || 
                       editedBook.author !== book.author || 
                       editedBook.publishedDate !== book.publishedDate;

    return (
        <div className="modal-overlay" onClick={onClose} data-testid="edit-book-modal">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>{t.editBook.title}</h3>
                <div className="form-group">
                    <label>{t.editBook.titleLabel}</label>
                    <input
                        className="input"
                        type="text"
                        value={editedBook.title}
                        onChange={(e) => setEditedBook({...editedBook, title: e.target.value})}
                        data-testid="edit-title-input"
                    />
                </div>
                <div className="form-group">
                    <label>{t.editBook.authorLabel}</label>
                    <AuthorSelect 
                        value={editedBook.author} 
                        onChange={(id, name) => {
                            setEditedBook({...editedBook, author: name});
                            setAuthorId(id);
                        }} 
                    />
                </div>
                <div className="form-group">
                    <label>{t.editBook.publishedDateLabel}</label>
                    <input
                        className="input"
                        type="date"
                        value={editedBook.publishedDate}
                        onChange={(e) => setEditedBook({...editedBook, publishedDate: e.target.value})}
                        data-testid="edit-date-input"
                    />
                </div>
                <button className="btn btn-primary" disabled={!hasChanges} onClick={() => onSave(editedBook, authorId)} data-testid="edit-save-button">
                    {t.editBook.saveButton}
                </button>
                <button className="btn btn-secondary" onClick={onClose} data-testid="edit-cancel-button">
                    {t.editBook.cancelButton}
                </button>
                {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
            </div>
        </div>
    );
};

export default EditBookModal;
