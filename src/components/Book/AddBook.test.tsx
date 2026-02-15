import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import AddBook from './AddBook';
import {LanguageProvider} from '../../LanguageContext';
import authorReducer from '../../features/authorReducer';
import * as api from '../../api/api';

jest.mock('../../api/api', () => ({
    findAuthorsByName: jest.fn(),
    createBook: jest.fn(),
    createAuthor: jest.fn()
}));

const renderWithProviders = (component: React.ReactElement) => {
    const store = configureStore({
        reducer: {
            authors: authorReducer,
        },
    });
    return render(
        <Provider store={store}>
            <LanguageProvider>{component}</LanguageProvider>
        </Provider>
    );
};

describe('AddBook Component', () => {
    beforeEach(() => {
        (api.findAuthorsByName as jest.Mock).mockResolvedValue([{id: 1, name: 'Test Author'}]);
        (api.createBook as jest.Mock).mockResolvedValue({id: 1, title: 'Test', author: 'Author', publishedDate: '2024-01-01'});
        (api.createAuthor as jest.Mock).mockResolvedValue({id: 1, name: 'Test Author'});
    });
    test('renders add book form', async () => {
        renderWithProviders(<AddBook />);
        await waitFor(() => {
            expect(screen.getByTestId('add-book-form')).toBeInTheDocument();
        });
        expect(screen.getByTestId('book-title-input')).toBeInTheDocument();
        expect(screen.getByTestId('book-date-input')).toBeInTheDocument();
        expect(screen.getByTestId('add-book-button')).toBeInTheDocument();
    });

    test('allows input in title field', async () => {
        renderWithProviders(<AddBook />);
        await screen.findByTestId('book-title-input');
        const titleInput = screen.getByTestId('book-title-input') as HTMLInputElement;
        fireEvent.change(titleInput, {target: {value: 'Test Book'}});
        expect(titleInput.value).toBe('Test Book');
    });

    test('allows input in date field', async () => {
        renderWithProviders(<AddBook />);
        await screen.findByTestId('book-date-input');
        const dateInput = screen.getByTestId('book-date-input') as HTMLInputElement;
        fireEvent.change(dateInput, {target: {value: '2024-01-01'}});
        expect(dateInput.value).toBe('2024-01-01');
    });

    test('shows error popup when book creation fails', async () => {
        renderWithProviders(<AddBook />);
        await screen.findByTestId('add-book-button');
        fireEvent.click(screen.getByTestId('add-book-button'));
        expect(await screen.findByText(/Book title is required and cannot be empty/i)).toBeInTheDocument();
    });
});