import {useState} from 'react';
import {createBook} from '../api/api';
import {validateBookTitle, validateDate, sanitizeString} from '../utils/validation';

export const useAddBook = () => {
    const [loading, setLoading] = useState(false);

    const addBook = async (title: string, authorId: number, publishedDate: string) => {
        const titleError = validateBookTitle(title);
        const dateError = validateDate(publishedDate);
        
        if (titleError) throw new Error(titleError);
        if (dateError) throw new Error(dateError);
        if (!authorId) {
            throw new Error('Please select an author from the dropdown or create a new one');
        }
        
        setLoading(true);
        try {
            await createBook({
                title: sanitizeString(title),
                authorId,
                publishedDate
            });
            return true;
        } finally {
            setLoading(false);
        }
    };

    return { addBook, loading };
};