import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import EditBookModal from './EditBookModal';
import DeleteBookModal from './DeleteBookModal';
import {LanguageProvider} from '../../LanguageContext';
import authorReducer from '../../features/authorReducer';
import * as api from '../../api/api';

jest.mock('../../api/api', () => ({
    fetchAuthors: jest.fn()
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

describe('EditBookModal Component', () => {
    const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        publishedDate: '2024-01-01'
    };

    const mockProps = {
        book: mockBook,
        onSave: jest.fn(),
        onClose: jest.fn()
    };

    beforeEach(() => {
        (api.fetchAuthors as jest.Mock).mockResolvedValue([{id: 1, name: 'Test Author'}]);
    });

    test('renders edit modal', async () => {
        renderWithProviders(<EditBookModal {...mockProps} />);
        expect(await screen.findByTestId('edit-book-modal')).toBeInTheDocument();
        expect(screen.getByTestId('edit-title-input')).toBeInTheDocument();
        expect(screen.getByTestId('edit-date-input')).toBeInTheDocument();
    });

    test('displays book data', async () => {
        renderWithProviders(<EditBookModal {...mockProps} />);
        const titleInput = await screen.findByTestId('edit-title-input') as HTMLInputElement;
        expect(titleInput.value).toBe('Test Book');
    });

    test('allows editing title', async () => {
        renderWithProviders(<EditBookModal {...mockProps} />);
        const titleInput = await screen.findByTestId('edit-title-input') as HTMLInputElement;
        fireEvent.change(titleInput, {target: {value: 'Updated Book'}});
        expect(titleInput.value).toBe('Updated Book');
    });

    test('save button is disabled when no changes', async () => {
        renderWithProviders(<EditBookModal {...mockProps} />);
        expect(await screen.findByTestId('edit-save-button')).toBeDisabled();
    });

    test('shows error popup when fetching authors fails', async () => {
        (api.fetchAuthors as jest.Mock).mockRejectedValue(new Error('Authors fetch failed'));
        renderWithProviders(<EditBookModal {...mockProps} />);
        const errors = await screen.findAllByText(/Authors fetch failed/i);
        expect(errors.length).toBeGreaterThan(0);
    });
});

describe('DeleteBookModal Component', () => {
    const mockProps = {
        onConfirm: jest.fn(),
        onClose: jest.fn()
    };

    test('renders delete modal', () => {
        renderWithProviders(<DeleteBookModal {...mockProps} />);
        expect(screen.getByTestId('delete-book-modal')).toBeInTheDocument();
        expect(screen.getByTestId('delete-confirm-input')).toBeInTheDocument();
    });

    test('confirm button is disabled without correct text', () => {
        renderWithProviders(<DeleteBookModal {...mockProps} />);
        expect(screen.getByTestId('delete-confirm-button')).toBeDisabled();
    });

    test('allows typing confirmation text', () => {
        renderWithProviders(<DeleteBookModal {...mockProps} />);
        const input = screen.getByTestId('delete-confirm-input') as HTMLInputElement;
        fireEvent.change(input, {target: {value: 'delete'}});
        expect(input.value).toBe('delete');
    });
});
