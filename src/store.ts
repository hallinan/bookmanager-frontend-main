import {configureStore} from '@reduxjs/toolkit';
import bookReducer from './features/bookReducer';
import authorReducer from './features/authorReducer';

const store = configureStore({
    reducer: {
        books: bookReducer,
        authors: authorReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
