import {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store';
import {Book, deleteBook as deleteBookAction, setBooks} from '../features/bookReducer';
import {deleteBook, updateBook} from '../api/api';

export const useBookManagement = (onSearchPerformed: (searchType: any, totalPages: number) => void) => {
    const books = useSelector((state: RootState) => state.books.books);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleSaveBook = async (updatedBook: Book, authorId: number) => {
        setLoading(true);
        try {
            await updateBook(updatedBook.id, updatedBook.title, authorId, updatedBook.publishedDate);
            const updatedBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
            dispatch(setBooks(updatedBooks));
            return true;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async (deleteBookId: number) => {
        setLoading(true);
        try {
            await deleteBook(deleteBookId);
            dispatch(deleteBookAction(deleteBookId));
            return true;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };



    return {
        books,
        loading,
        handleSaveBook,
        handleConfirmDelete
    };
};