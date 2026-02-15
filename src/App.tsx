import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setBooks} from './features/bookReducer';
import BooksList from './components/Book/BooksList';
import AddBook from './components/Book/AddBook';
import {fetchBooks, searchBooksByAuthorName, searchBooksByDateRange, searchBooksByTitle} from './api/api';
import './App.css';
import {RootState} from './store';
import {useLanguage} from './LanguageContext';

const App: React.FC = () => {
    const dispatch = useDispatch();
    const books = useSelector((state: RootState) => state.books.books);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [activeSearch, setActiveSearch] = useState<{type: 'author', authorName: string} | {type: 'date', startDate: string, endDate: string} | {type: 'title', title: string} | null>(null);
    const [activeTab, setActiveTab] = useState<'library' | 'add'>('library');
    const {language, setLanguage, t} = useLanguage();

    useEffect(() => {
        loadBooks(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadBooks = async (page: number) => {
        try {
            const {books, totalPages} = await fetchBooks(page, 10);
            dispatch(setBooks(books));
            setCurrentPage(page);
            setTotalPages(totalPages);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : t.app.failedToLoadBooks);
        }
    };

    const loadMoreBooks = async () => {
        try {
            const nextPage = currentPage + 1;
            let newBooks, newTotalPages;
            
            if (activeSearch?.type === 'author') {
                const result = await searchBooksByAuthorName(activeSearch.authorName, nextPage, 10);
                newBooks = result.books;
                newTotalPages = result.totalPages;
            } else if (activeSearch?.type === 'date') {
                const result = await searchBooksByDateRange(activeSearch.startDate, activeSearch.endDate, nextPage, 10);
                newBooks = result.books;
                newTotalPages = result.totalPages;
            } else if (activeSearch?.type === 'title') {
                const result = await searchBooksByTitle(activeSearch.title, nextPage, 10);
                newBooks = result.books;
                newTotalPages = result.totalPages;
            } else {
                const result = await fetchBooks(nextPage, 10);
                newBooks = result.books;
                newTotalPages = result.totalPages;
            }
            
            dispatch(setBooks([...books, ...newBooks]));
            setCurrentPage(nextPage);
            setTotalPages(newTotalPages);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : t.app.failedToLoadMore);
        }
    };

    const handleSearchPerformed = (searchType: {type: 'author', authorName: string} | {type: 'date', startDate: string, endDate: string} | {type: 'title', title: string} | null, totalPages: number) => {
        setActiveSearch(searchType);
        setCurrentPage(0);
        setTotalPages(totalPages);
    };

    return (
        <div className="App">
            <div className="app-header">
                <div className="header-content">
                    <h1>{t.app.title}</h1>
                    <select 
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="language-select"
                    >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="ja">日本語</option>
                    </select>
                </div>
            </div>
            {error && (
                <div className="error-banner">
                    {t.app.errorPrefix} {error}
                </div>
            )}
            <div className="tabs">
                <button className={`tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')} data-testid="library-tab">
                    {t.app.tabLibrary}
                </button>
                <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')} data-testid="add-tab">
                    {t.app.tabAddBook}
                </button>
            </div>
            {activeTab === 'library' && (
                <BooksList onLoadMore={loadMoreBooks} onSearchPerformed={handleSearchPerformed} currentPage={currentPage} totalPages={totalPages} />
            )}
            {activeTab === 'add' && (
                <AddBook/>
            )}
        </div>
    );
};

export default App;

