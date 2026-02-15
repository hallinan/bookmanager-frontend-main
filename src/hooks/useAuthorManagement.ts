import {useState, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {findAuthorsByName, createAuthor} from '../api/api';
import {addAuthor} from '../features/authorReducer';
import {validateAuthorName, sanitizeString} from '../utils/validation';

export const useAuthorManagement = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const searchAuthors = useCallback(async (name: string) => {
        try {
            const data = await findAuthorsByName(name);
            return data;
        } catch (err) {
            throw err;
        }
    }, []);

    const createNewAuthor = async (name: string) => {
        const nameError = validateAuthorName(name);
        if (nameError) throw new Error(nameError);
        
        setLoading(true);
        try {
            const newAuthor = await createAuthor(sanitizeString(name));
            dispatch(addAuthor(newAuthor));
            return newAuthor;
        } finally {
            setLoading(false);
        }
    };

    return { searchAuthors, loading, createNewAuthor };
};