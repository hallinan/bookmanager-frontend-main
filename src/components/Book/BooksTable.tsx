import React, {useState, useMemo} from 'react';
import {Book} from '../../features/bookReducer';
import {useLanguage} from '../../LanguageContext';

interface BooksTableProps {
    books: Book[];
    onEdit: (book: Book) => void;
    onDelete: (bookId: number) => void;
}

const BooksTable: React.FC<BooksTableProps> = React.memo(({books, onEdit, onDelete}) => {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{top: number, left: number}>({top: 0, left: 0});
    const [sortField, setSortField] = useState<'title' | 'author' | 'publishedDate' | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const {t} = useLanguage();

    const sortedBooks = useMemo(() => {
        if (!sortField) return books;
        
        return [...books].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [books, sortField, sortDirection]);

    const handleSort = (field: 'title' | 'author' | 'publishedDate') => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
    };

    return (
        <div className="books-table-container">
            <table className="table" data-testid="books-table">
                <thead>
                    <tr>
                        <th></th>
                        <th onClick={() => handleSort('title')} className="sortable-header">
                            {t.booksList.columnTitle} {sortField === 'title' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('author')} className="sortable-header">
                            {t.booksList.columnAuthor} {sortField === 'author' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('publishedDate')} className="sortable-header">
                            {t.booksList.columnPublishedDate} {sortField === 'publishedDate' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedBooks.map(book => (
                        <tr key={book.id} data-testid={`book-row-${book.id}`}>
                            <td>
                                <div className="kebab-menu">
                                    <button className="kebab-button" onClick={(e) => {
                                        e.stopPropagation();
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setMenuPosition({top: rect.bottom, left: rect.left});
                                        setOpenMenuId(openMenuId === book.id ? null : book.id);
                                    }} data-testid={`kebab-menu-${book.id}`}>
                                        ⋮
                                    </button>
                                    {openMenuId === book.id && (
                                        <div className="kebab-dropdown positioned-dropdown" style={{
                                            top: menuPosition.top + 'px',
                                            left: menuPosition.left + 'px'
                                        }}>
                                            <div className="kebab-dropdown-item" onClick={() => {
                                                onEdit(book);
                                                setOpenMenuId(null);
                                            }}>
                                                {t.booksList.editMenu}
                                            </div>
                                            <div className="kebab-dropdown-item" onClick={() => {
                                                onDelete(book.id);
                                                setOpenMenuId(null);
                                            }}>
                                                {t.booksList.deleteMenu}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.publishedDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default BooksTable;