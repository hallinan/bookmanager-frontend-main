import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface Author {
    id: number;
    name: string;
}

interface AuthorState {
    authors: Author[];
}

const initialState: AuthorState = {
    authors: [],
};

const authorReducer = createSlice({
    name: 'authors',
    initialState,
    reducers: {
        setAuthors(state, action: PayloadAction<Author[]>) {
            state.authors = action.payload;
        },
        addAuthor(state, action: PayloadAction<Author>) {
            if (!state.authors.some(author => author.id === action.payload.id)) {
                state.authors.push(action.payload);
            }
        },
    },
});

export const {setAuthors, addAuthor} = authorReducer.actions;

export default authorReducer.reducer;
