import React, {useState} from 'react';
import {Book} from '../../features/bookReducer';
import BookSearch from '../Search/BookSearch';
import BooksTable from './BooksTable';
import EditBookModal from '../Modals/EditBookModal';
import DeleteBookModal from '../Modals/DeleteBookModal';
import ErrorPopup from '../Modals/ErrorPopup';
import SuccessNotification from '../Modals/SuccessNotification';
import {useLanguage} from '../../LanguageContext';
import {useBookManagement} from '../../hooks/useBookManagement';
import {useBookSearch} from '../../hooks/useBookSearch';
import {useErrorHandler} from '../../hooks/useErrorHandler';

interface BooksListProps {
    onLoadMore: () => void;
    onSearchPerformed: (searchType: {type: 'author', authorName: string} | {type: 'date', startDate: string, endDate: string} | {type: 'title', title: string} | null, totalPages: number) => void;
    currentPage: number;
    totalPages: number;
}

const BooksList: React.FC<BooksListProps> = ({onLoadMore, onSearchPerformed, currentPage, totalPages}) => {
    const {
        books,
        loading,
        handleSaveBook: saveBook,
        handleConfirmDelete: confirmDelete
    } = useBookManagement(onSearchPerformed);
    
    const {
        searchByDateRange,
        searchByTitle,
        searchByAuthor,
        clearSearch
    } = useBookSearch(onSearchPerformed);
    
    const {error, success, handleError, handleSuccess, clearMessages} = useErrorHandler();
    const [editBook, setEditBook] = useState<Book | null>(null);
    const [deleteBookId, setDeleteBookId] = useState<number | null>(null);
    const {t} = useLanguage();



    const handleSaveBook = async (updatedBook: Book, authorId: number) => {
        try {
            await saveBook(updatedBook, authorId);
            setEditBook(null);
            handleSuccess(t.booksList.successUpdating);
        } catch (err) {
            handleError(err, t.booksList.errorUpdating);
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteBookId) {
            try {
                await confirmDelete(deleteBookId);
                setDeleteBookId(null);
                handleSuccess(t.booksList.successDeleting);
            } catch (err) {
                handleError(err, t.booksList.errorDeleting);
            }
        }
    };



    return (
        <div className="card" data-testid="books-list">
            <h2>{t.booksList.title}</h2>
            <p className="book-count" data-testid="book-count">{t.booksList.totalBooks} {books.length}</p>
            <BookSearch 
                onSearch={React.useCallback((startDate, endDate) => searchByDateRange(startDate, endDate).catch(err => handleError(err, t.booksList.errorSearching)), [searchByDateRange, handleError, t.booksList.errorSearching])} 
                onSearchByTitle={React.useCallback((title) => searchByTitle(title).catch(err => handleError(err, t.booksList.errorSearching)), [searchByTitle, handleError, t.booksList.errorSearching])} 
                onSearchByAuthor={React.useCallback((authorName) => searchByAuthor(authorName).catch(err => handleError(err, t.booksList.errorSearching)), [searchByAuthor, handleError, t.booksList.errorSearching])} 
                onClear={React.useCallback(() => clearSearch().catch(err => handleError(err, t.booksList.errorSearching)), [clearSearch, handleError, t.booksList.errorSearching])} 
            />
            <BooksTable 
                books={books}
                onEdit={setEditBook}
                onDelete={setDeleteBookId}
            />

            {currentPage < totalPages - 1 && (
                <div className="load-more-container">
                    <button className="btn btn-primary" onClick={onLoadMore} disabled={loading} data-testid="load-more-button">
                        {loading ? 'Loading...' : t.booksList.loadMore}
                    </button>
                </div>
            )}

            {editBook && <EditBookModal book={editBook} onSave={handleSaveBook} onClose={() => setEditBook(null)} />}

            {deleteBookId && <DeleteBookModal onConfirm={handleConfirmDelete} onClose={() => setDeleteBookId(null)} />}

            {error && <ErrorPopup message={error} onClose={clearMessages} />}
            {success && <SuccessNotification message={success} onClose={clearMessages} />}
        </div>
    );
};

export default BooksList;