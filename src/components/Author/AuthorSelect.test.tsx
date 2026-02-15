import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import AuthorSelect from './AuthorSelect';
import {LanguageProvider} from '../../LanguageContext';
import authorReducer from '../../features/authorReducer';
import * as api from '../../api/api';

jest.mock('../../api/api', () => ({
    findAuthorsByName: jest.fn(),
    createAuthor: jest.fn()
}));

jest.mock('../../utils/debounce', () => ({
    debounce: (fn: any) => fn
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

describe('AuthorSelect Component', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (api.findAuthorsByName as jest.Mock).mockResolvedValue([{id: 1, name: 'Test Author'}]);
    });

    test('searches authors when typing', async () => {
        renderWithProviders(<AuthorSelect value="" onChange={mockOnChange} />);
        const input = screen.getByTestId('author-input');
        fireEvent.change(input, {target: {value: 'Test'}});
        await waitFor(() => {
            expect(api.findAuthorsByName).toHaveBeenCalledWith('Test');
        });
    });

    test('does not search when author is selected', async () => {
        (api.findAuthorsByName as jest.Mock).mockResolvedValue([{id: 1, name: 'Test Author'}]);
        renderWithProviders(<AuthorSelect value="" onChange={mockOnChange} />);
        const input = screen.getByTestId('author-input');
        
        fireEvent.change(input, {target: {value: 'Test'}});
        fireEvent.focus(input);
        
        await screen.findByText('Test Author');
        fireEvent.click(screen.getByText('Test Author'));
        
        jest.clearAllMocks();
        expect(api.findAuthorsByName).not.toHaveBeenCalled();
    });

    test('resumes search when user types after selection', async () => {
        (api.findAuthorsByName as jest.Mock).mockResolvedValue([{id: 1, name: 'Test Author'}]);
        renderWithProviders(<AuthorSelect value="" onChange={mockOnChange} />);
        const input = screen.getByTestId('author-input');
        
        fireEvent.change(input, {target: {value: 'Test'}});
        fireEvent.focus(input);
        await screen.findByText('Test Author');
        fireEvent.click(screen.getByText('Test Author'));
        
        jest.clearAllMocks();
        fireEvent.change(input, {target: {value: 'New Search'}});
        
        await waitFor(() => {
            expect(api.findAuthorsByName).toHaveBeenCalledWith('New Search');
        });
    });

    test('renders author select input', async () => {
        renderWithProviders(<AuthorSelect value="" onChange={mockOnChange} />);
        expect(screen.getByTestId('author-select')).toBeInTheDocument();
        expect(screen.getByTestId('author-input')).toBeInTheDocument();
    });

    test('shows error popup when searching authors fails', async () => {
        (api.findAuthorsByName as jest.Mock).mockRejectedValue(new Error('Authors search failed'));
        renderWithProviders(<AuthorSelect value="" onChange={mockOnChange} />);
        const input = screen.getByTestId('author-input');
        fireEvent.change(input, {target: {value: 'Test'}});
        expect(await screen.findByText(/Failed to search authors/i)).toBeInTheDocument();
    });

    test('shows error popup when creating author fails', async () => {
        (api.createAuthor as jest.Mock).mockRejectedValue(new Error('Author creation failed'));
        renderWithProviders(<AuthorSelect value="" onChange={mockOnChange} />);
        await screen.findByTestId('author-input');
        fireEvent.focus(screen.getByTestId('author-input'));
        await screen.findByText(/Add New Author/i);
        fireEvent.click(screen.getByText(/Add New Author/i));
        const nameInput = await screen.findByPlaceholderText(/Enter author name/i);
        fireEvent.change(nameInput, {target: {value: 'New Author'}});
        fireEvent.click(screen.getByText(/Create Author/i));
        expect(await screen.findByText(/Author creation failed/i)).toBeInTheDocument();
    });

    test('shows success notification when author is created', async () => {
        (api.createAuthor as jest.Mock).mockResolvedValue({id: 2, name: 'New Author'});
        renderWithProviders(<AuthorSelect value="" onChange={mockOnChange} />);
        await screen.findByTestId('author-input');
        fireEvent.focus(screen.getByTestId('author-input'));
        await screen.findByText(/Add New Author/i);
        fireEvent.click(screen.getByText(/Add New Author/i));
        const nameInput = await screen.findByPlaceholderText(/Enter author name/i);
        fireEvent.change(nameInput, {target: {value: 'New Author'}});
        fireEvent.click(screen.getByText(/Create Author/i));
        expect(await screen.findByText(/Author created successfully/i)).toBeInTheDocument();
    });
});