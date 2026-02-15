import React, {useState} from 'react';
import {useLanguage} from '../../LanguageContext';
import {useDebounce} from '../../hooks/useDebounce';

interface BookSearchProps {
    onSearch: (startDate: string, endDate: string) => void;
    onSearchByTitle: (title: string) => void;
    onSearchByAuthor: (authorName: string) => void;
    onClear: () => void;
}

const BookSearch: React.FC<BookSearchProps> = React.memo(({onSearch, onSearchByTitle, onSearchByAuthor, onClear}) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookTitle, setBookTitle] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const {t} = useLanguage();
    
    const debouncedTitle = useDebounce(bookTitle, 300);
    
    React.useEffect(() => {
        if (debouncedTitle && debouncedTitle.trim()) {
            setStartDate('');
            setAuthorName('');
            onSearchByTitle(debouncedTitle);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedTitle]);

    const handleSearch = () => {
        if (startDate) {
            setBookTitle('');
            setAuthorName('');
            onSearch(startDate, endDate);
        }
    };



    const handleClear = () => {
        setStartDate('');
        setEndDate(new Date().toISOString().split('T')[0]);
        setBookTitle('');
        setAuthorName('');
        onClear();
    };

    return (
        <div className="accordion" data-testid="book-search">
            <div className="accordion-header" onClick={() => setIsOpen(!isOpen)} data-testid="search-accordion-header">
                <span>{t.search.filtersTitle}</span>
                <span>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
                <div className="accordion-content">
                    <div className="search-form-group">
                        <div className="form-group form-group-no-margin">
                            <label>{t.search.bookTitleLabel}</label>
                            <div className="search-form-group">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder={t.search.bookTitlePlaceholder}
                                    value={bookTitle}
                                    onChange={(e) => setBookTitle(e.target.value)}
                                    data-testid="search-title-input"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="search-form-group">
                        <div className="form-group form-group-no-margin">
                            <label>{t.search.authorLabel}</label>
                            <div className="search-form-group">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder={t.search.authorPlaceholder}
                                    value={authorName}
                                    onChange={(e) => {
                                        setAuthorName(e.target.value);
                                        if (e.target.value) {
                                            setStartDate('');
                                            setBookTitle('');
                                            onSearchByAuthor(e.target.value);
                                        }
                                    }}
                                    data-testid="author-input"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="search-date-container">
                        <div className="form-group form-group-no-margin">
                            <label>{t.search.startDateLabel}</label>
                            <input
                                className="input"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                data-testid="search-start-date"
                            />
                        </div>
                        <div className="form-group form-group-no-margin">
                            <label>{t.search.endDateLabel}</label>
                            <input
                                className="input"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                data-testid="search-end-date"
                            />
                        </div>
                        <button className="btn btn-primary" onClick={handleSearch} disabled={!startDate} data-testid="search-date-button">
                            {t.search.searchButton}
                        </button>
                        <button className="btn btn-secondary" onClick={handleClear} data-testid="search-clear-button">
                            {t.search.clearButton}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BookSearch;