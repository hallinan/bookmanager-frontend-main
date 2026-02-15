import {useDispatch} from 'react-redux';
import {setBooks} from '../features/bookReducer';
import {searchBooksByDateRange, searchBooksByAuthorName, fetchBooks, searchBooksByTitle} from '../api/api';

export const useBookSearch = (onSearchPerformed: (searchType: any, totalPages: number) => void) => {
    const dispatch = useDispatch();

    const searchByDateRange = async (startDate: string, endDate: string) => {
        try {
            const {books, totalPages} = await searchBooksByDateRange(startDate, endDate, 0, 10);
            dispatch(setBooks(books));
            onSearchPerformed({type: 'date', startDate, endDate}, totalPages);
        } catch (error) {
            console.error('Date range search failed:', error);
            throw error;
        }
    };

    const searchByTitle = async (title: string) => {
        if (!title.trim()) {
            return;
        }
        
        try {
            const sanitizedTitle = title.trim();
            const {books: searchResults, totalPages} = await searchBooksByTitle(sanitizedTitle, 0, 10);
            dispatch(setBooks(searchResults));
            onSearchPerformed({type: 'title', title: sanitizedTitle}, totalPages);
        } catch (error) {
            console.error('Title search failed:', error);
            throw error;
        }
    };

    const searchByAuthor = async (authorName: string) => {
        if (!authorName.trim()) return;
        
        try {
            const {books: searchResults, totalPages} = await searchBooksByAuthorName(authorName, 0, 10);
            dispatch(setBooks(searchResults));
            onSearchPerformed({type: 'author', authorName}, totalPages);
        } catch (error) {
            console.error('Author search failed:', error);
            throw error;
        }
    };

    const clearSearch = async () => {
        try {
            const {books, totalPages} = await fetchBooks(0, 100);
            dispatch(setBooks(books));
            onSearchPerformed(null, totalPages);
        } catch (error) {
            console.error('Clear search failed:', error);
            throw error;
        }
    };

    return {
        searchByDateRange,
        searchByTitle,
        searchByAuthor,
        clearSearch
    };
};