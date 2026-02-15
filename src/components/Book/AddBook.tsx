import React, {useState} from 'react';
import AuthorSelect from '../Author/AuthorSelect';
import {useLanguage} from '../../LanguageContext';
import ErrorPopup from '../Modals/ErrorPopup';
import SuccessNotification from '../Modals/SuccessNotification';
import {useAddBook} from '../../hooks/useAddBook';
import {useErrorHandler} from '../../hooks/useErrorHandler';

const AddBook = () => {
    const {addBook, loading} = useAddBook();
    const {error, success, handleError, handleSuccess, clearMessages} = useErrorHandler();
    const [title, setTitle] = useState('');
    const [authorId, setAuthorId] = useState<number>(0);
    const [authorName, setAuthorName] = useState('');
    const [publishedDate, setPublishedDate] = useState('');
    const {t} = useLanguage();

    const handleAddBook = async () => {
        try {
            await addBook(title, authorId, publishedDate);
            setTitle('');
            setPublishedDate('');
            setAuthorName('');
            setAuthorId(0);
            handleSuccess(t.addBook.successCreating);
        } catch (err) {
            handleError(err, t.addBook.errorCreating);
        }
    };

    return (
        <div className="card" data-testid="add-book-form">
            <h2>{t.addBook.title}</h2>
            <div className="form-group">
                <label>{t.addBook.titleLabel}</label>
                <input
                    className="input"
                    type="text"
                    placeholder={t.addBook.titlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="book-title-input"
                />
            </div>
            <div className="form-group">
                <label>{t.addBook.authorLabel}</label>
                <AuthorSelect 
                    value={authorName} 
                    onChange={(id, name) => {
                        setAuthorId(id);
                        setAuthorName(name);
                    }} 
                />
            </div>
            <div className="form-group">
                <label>{t.addBook.publishedDateLabel}</label>
                <input
                    className="input"
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    data-testid="book-date-input"
                />
            </div>
            <button className="btn btn-primary" onClick={handleAddBook} disabled={loading} data-testid="add-book-button">
                {loading ? 'Adding...' : t.addBook.addButton}
            </button>
            {error && <ErrorPopup message={error} onClose={clearMessages} />}
            {success && <SuccessNotification message={success} onClose={clearMessages} />}
        </div>
    );
};

export default AddBook;
