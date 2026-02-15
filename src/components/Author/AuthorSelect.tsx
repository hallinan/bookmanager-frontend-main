import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import ErrorPopup from '../Modals/ErrorPopup';
import SuccessNotification from '../Modals/SuccessNotification';
import {useLanguage} from '../../LanguageContext';
import {useAuthorManagement} from '../../hooks/useAuthorManagement';
import {useErrorHandler} from '../../hooks/useErrorHandler';
import {Author} from '../../api/api';
import {debounce} from '../../utils/debounce';

interface AuthorSelectProps {
    value: string;
    onChange: (authorId: number, authorName: string) => void;
    allowAddNew?: boolean;
}

const AuthorSelect: React.FC<AuthorSelectProps> = React.memo(({value, onChange, allowAddNew = true}) => {
    const {searchAuthors, loading, createNewAuthor} = useAuthorManagement();
    const {error, success, handleError, handleSuccess, clearMessages} = useErrorHandler();
    const [searchTerm, setSearchTerm] = useState(value);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [isAuthorSelected, setIsAuthorSelected] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});
    const [showModal, setShowModal] = useState(false);
    const [newAuthorName, setNewAuthorName] = useState('');
    const lastSearchedTerm = useRef<string>('');
    const {t} = useLanguage();

    const searchFunction = useCallback(async (term: string) => {
        if (term.trim().length >= 2 && term !== lastSearchedTerm.current) {
            lastSearchedTerm.current = term;
            try {
                const results = await searchAuthors(term);
                setAuthors(results);
            } catch (err) {
                handleError(err, 'Failed to search authors');
            }
        } else if (term.trim().length < 2) {
            setAuthors([]);
            lastSearchedTerm.current = '';
        }
    }, [searchAuthors, handleError]);

    const debouncedSearch = useMemo(
        () => debounce(searchFunction, 300),
        [searchFunction]
    );

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        if (value === '') {
            setSearchTerm('');
            setAuthors([]);
        }
    }, [value]);

    useEffect(() => {
        if (!isAuthorSelected) {
            debouncedSearch(searchTerm);
        }
    }, [searchTerm, debouncedSearch, isAuthorSelected]);

    const handleAuthorSelect = (author: Author | 'new') => {
        if (author === 'new') {
            setShowModal(true);
            setShowDropdown(false);
        } else {
            onChange(author.id, author.name);
            setSearchTerm(author.name);
            setIsAuthorSelected(true);
            setShowDropdown(false);
        }
    };

    const handleCreateAuthor = async () => {
        try {
            const newAuthor = await createNewAuthor(newAuthorName);
            onChange(newAuthor.id, newAuthor.name);
            setSearchTerm(newAuthor.name);
            setNewAuthorName('');
            setShowModal(false);
            handleSuccess(t.addAuthor.successCreating);
        } catch (err) {
            handleError(err, t.addAuthor.errorCreating);
        }
    };

    return (
        <>
            <div className="dropdown" data-testid="author-select">
                <input
                    className="input"
                    type="text"
                    placeholder={t.search.authorPlaceholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsAuthorSelected(false);
                    }}
                    onFocus={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdownPosition({top: rect.bottom, left: rect.left, width: rect.width});
                        setShowDropdown(true);
                    }}
                    data-testid="author-input"
                />
                {showDropdown && (
                    <div className="dropdown-menu" style={{
                        top: dropdownPosition.top + 'px',
                        left: dropdownPosition.left + 'px',
                        width: dropdownPosition.width + 'px'
                    }} data-testid="author-dropdown">
                        {authors.map(author => (
                            <div key={author.id} onClick={() => handleAuthorSelect(author)} className="dropdown-item">
                                {author.name}
                            </div>
                        ))}
                        {allowAddNew && (
                            <div onClick={() => handleAuthorSelect('new')} className="dropdown-item dropdown-item-add">
                                {t.addAuthor.addNewOption}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{t.addAuthor.title}</h3>
                        <div className="form-group">
                            <label>{t.addAuthor.nameLabel}</label>
                            <input
                                className="input"
                                type="text"
                                placeholder={t.addAuthor.namePlaceholder}
                                value={newAuthorName}
                                onChange={(e) => setNewAuthorName(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={handleCreateAuthor} disabled={loading}>
                            {loading ? 'Creating...' : t.addAuthor.createButton}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{t.addAuthor.cancelButton}</button>
                    </div>
                </div>
            )}
            {error && <ErrorPopup message={error} onClose={clearMessages} />}
            {success && <SuccessNotification message={success} onClose={clearMessages} />}
        </>
    );
});

export default AuthorSelect;
