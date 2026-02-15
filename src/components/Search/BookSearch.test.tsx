import {render, screen, fireEvent} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import BookSearch from './BookSearch';
import {LanguageProvider} from '../../LanguageContext';
import authorReducer from '../../features/authorReducer';

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

describe('BookSearch Component', () => {
    const mockProps = {
        onSearch: jest.fn(),
        onSearchByTitle: jest.fn(),
        onSearchByAuthor: jest.fn(),
        onClear: jest.fn()
    };

    test('renders search accordion', () => {
        renderWithProviders(<BookSearch {...mockProps} />);
        expect(screen.getByTestId('book-search')).toBeInTheDocument();
        expect(screen.getByTestId('search-accordion-header')).toBeInTheDocument();
    });

    test('expands accordion on click', () => {
        renderWithProviders(<BookSearch {...mockProps} />);
        const header = screen.getByTestId('search-accordion-header');
        fireEvent.click(header);
        expect(screen.getByTestId('search-title-input')).toBeInTheDocument();
    });

    test('allows title search input', () => {
        renderWithProviders(<BookSearch {...mockProps} />);
        fireEvent.click(screen.getByTestId('search-accordion-header'));
        const titleInput = screen.getByTestId('search-title-input') as HTMLInputElement;
        fireEvent.change(titleInput, {target: {value: 'Test'}});
        expect(titleInput.value).toBe('Test');
    });

    test('allows date range input', () => {
        renderWithProviders(<BookSearch {...mockProps} />);
        fireEvent.click(screen.getByTestId('search-accordion-header'));
        const startDate = screen.getByTestId('search-start-date') as HTMLInputElement;
        const endDate = screen.getByTestId('search-end-date') as HTMLInputElement;
        fireEvent.change(startDate, {target: {value: '2024-01-01'}});
        fireEvent.change(endDate, {target: {value: '2024-12-31'}});
        expect(startDate.value).toBe('2024-01-01');
        expect(endDate.value).toBe('2024-12-31');
    });

    test('search buttons are disabled when inputs are empty', () => {
        renderWithProviders(<BookSearch {...mockProps} />);
        fireEvent.click(screen.getByTestId('search-accordion-header'));
        expect(screen.getByTestId('search-date-button')).toBeDisabled();
    });
});
