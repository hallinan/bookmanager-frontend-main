import {render, screen, fireEvent} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import App from './App';
import bookReducer from './features/bookReducer';
import authorReducer from './features/authorReducer';
import {LanguageProvider} from './LanguageContext';
import * as api from './api/api';

jest.mock('./api/api', () => ({
    fetchBooks: jest.fn(),
    fetchAuthors: jest.fn()
}));

const createMockStore = () => {
    return configureStore({
        reducer: {books: bookReducer, authors: authorReducer}
    });
};

const renderWithProviders = (component: React.ReactElement) => {
    const store = createMockStore();
    return render(
        <Provider store={store}>
            <LanguageProvider>
                {component}
            </LanguageProvider>
        </Provider>
    );
};

describe('App Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (api.fetchBooks as jest.Mock).mockResolvedValue({books: [], totalPages: 0});
        (api.fetchAuthors as jest.Mock).mockResolvedValue([]);
    });
    test('renders app with tabs', async () => {
        renderWithProviders(<App />);
        expect(await screen.findByTestId('library-tab')).toBeInTheDocument();
        expect(screen.getByTestId('add-tab')).toBeInTheDocument();
    });

    test('library tab is active by default', async () => {
        renderWithProviders(<App />);
        const libraryTab = await screen.findByTestId('library-tab');
        expect(libraryTab).toHaveClass('active');
    });

    test('switches to add book tab', async () => {
        renderWithProviders(<App />);
        const addTab = await screen.findByTestId('add-tab');
        fireEvent.click(addTab);
        expect(addTab).toHaveClass('active');
        expect(await screen.findByTestId('add-book-form')).toBeInTheDocument();
    });

    test('switches back to library tab', async () => {
        renderWithProviders(<App />);
        const addTab = await screen.findByTestId('add-tab');
        fireEvent.click(addTab);
        
        const libraryTab = screen.getByTestId('library-tab');
        fireEvent.click(libraryTab);
        
        expect(libraryTab).toHaveClass('active');
        expect(await screen.findByTestId('books-list')).toBeInTheDocument();
    });
});