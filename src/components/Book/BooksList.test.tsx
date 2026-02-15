import {render, screen, fireEvent} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import BooksList from './BooksList';
import bookReducer from '../../features/bookReducer';
import authorReducer from '../../features/authorReducer';
import {LanguageProvider} from '../../LanguageContext';
import * as api from '../../api/api';
import React from "react";

jest.mock('../../api/api', () => ({
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
    searchBooksByDateRange: jest.fn(),
    searchBooksByAuthorId: jest.fn()
}));

const createMockStore = (initialState?: any) => {
    return configureStore({
        reducer: {books: bookReducer, authors: authorReducer} as any,
        preloadedState: initialState
    });
};

const renderWithProviders = (component: React.ReactElement, store: any) => {
    return render(
        <Provider store={store}>
            <LanguageProvider>
                {component}
            </LanguageProvider>
        </Provider>
    );
};

describe('BooksList Component', () => {
    const mockProps = {
        onLoadMore: jest.fn(),
        onSearchPerformed: jest.fn(),
        currentPage: 0,
        totalPages: 1
    };

    test('renders books list', () => {
        const store = createMockStore();
        renderWithProviders(<BooksList {...mockProps} />, store);
        expect(screen.getByTestId('books-list')).toBeInTheDocument();
        expect(screen.getByTestId('books-table')).toBeInTheDocument();
    });

    test('displays book count', () => {
        const store = createMockStore({
            books: {
                books: [
                    {id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2024-01-01'}
                ]
            },
            authors: {
                authors: []
            }
        });
        renderWithProviders(<BooksList {...mockProps} />, store);
        expect(screen.getByTestId('book-count')).toHaveTextContent('1');
    });

    test('renders book rows', () => {
        const store = createMockStore({
            books: {
                books: [
                    {id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2024-01-01'},
                    {id: 2, title: 'Book 2', author: 'Author 2', publishedDate: '2024-01-02'}
                ]
            },
            authors: {
                authors: []
            }
        });
        renderWithProviders(<BooksList {...mockProps} />, store);
        expect(screen.getByTestId('book-row-1')).toBeInTheDocument();
        expect(screen.getByTestId('book-row-2')).toBeInTheDocument();
    });

    test('shows load more button when more pages available', () => {
        const store = createMockStore();
        renderWithProviders(<BooksList {...mockProps} currentPage={0} totalPages={2} />, store);
        expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
    });

    test('hides load more button on last page', () => {
        const store = createMockStore();
        renderWithProviders(<BooksList {...mockProps} currentPage={1} totalPages={2} />, store);
        expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
    });

    test('shows error popup when update fails', async () => {
        (api.updateBook as jest.Mock).mockRejectedValue(new Error('Update failed'));
        const store = createMockStore({
            books: {
                books: [{id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2024-01-01'}]
            },
            authors: {
                authors: []
            }
        });
        renderWithProviders(<BooksList {...mockProps} />, store);
        fireEvent.click(screen.getByTestId('kebab-menu-1'));
        fireEvent.click(screen.getByText(/Edit/i));
        const titleInput = await screen.findByTestId('edit-title-input') as HTMLInputElement;
        fireEvent.change(titleInput, {target: {value: 'Updated'}});
        fireEvent.click(screen.getByTestId('edit-save-button'));
        expect(await screen.findByText(/Update failed/i)).toBeInTheDocument();
    });

    test('shows error popup when delete fails', async () => {
        (api.deleteBook as jest.Mock).mockRejectedValue(new Error('Delete failed'));
        const store = createMockStore({
            books: {
                books: [{id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2024-01-01'}]
            },
            authors: {
                authors: []
            }
        });
        renderWithProviders(<BooksList {...mockProps} />, store);
        fireEvent.click(screen.getByTestId('kebab-menu-1'));
        fireEvent.click(screen.getByText(/Delete/i));
        const input = await screen.findByTestId('delete-confirm-input') as HTMLInputElement;
        fireEvent.change(input, {target: {value: 'delete'}});
        fireEvent.click(screen.getByTestId('delete-confirm-button'));
        expect(await screen.findByText(/Delete failed/i)).toBeInTheDocument();
    });

    test('shows success notification when book is updated', async () => {
        (api.updateBook as jest.Mock).mockResolvedValue({});
        const store = createMockStore({
            books: {
                books: [{id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2024-01-01'}]
            },
            authors: {
                authors: []
            }
        });
        renderWithProviders(<BooksList {...mockProps} />, store);
        fireEvent.click(screen.getByTestId('kebab-menu-1'));
        fireEvent.click(screen.getByText(/Edit/i));
        const titleInput = await screen.findByTestId('edit-title-input') as HTMLInputElement;
        fireEvent.change(titleInput, {target: {value: 'Updated'}});
        fireEvent.click(screen.getByTestId('edit-save-button'));
        expect(await screen.findByText(/Book updated successfully/i)).toBeInTheDocument();
    });

    test('shows success notification when book is deleted', async () => {
        (api.deleteBook as jest.Mock).mockResolvedValue(1);
        const store = createMockStore({
            books: {
                books: [{id: 1, title: 'Book 1', author: 'Author 1', publishedDate: '2024-01-01'}]
            },
            authors: {
                authors: []
            }
        });
        renderWithProviders(<BooksList {...mockProps} />, store);
        fireEvent.click(screen.getByTestId('kebab-menu-1'));
        fireEvent.click(screen.getByText(/Delete/i));
        const input = await screen.findByTestId('delete-confirm-input') as HTMLInputElement;
        fireEvent.change(input, {target: {value: 'delete'}});
        fireEvent.click(screen.getByTestId('delete-confirm-button'));
        expect(await screen.findByText(/Book deleted successfully/i)).toBeInTheDocument();
    });
});