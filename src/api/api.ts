import {Book} from '../features/bookReducer';
import {withRetry} from '../utils/retry';

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:8081/books';

interface GraphQLResponse<T> {
    data: T;
    errors?: Array<{message: string}>;
}

interface AuthorResponse {
    id: number;
    name: string;
}

interface BookResponse {
    id: number;
    title: string;
    author: {name: string};
    publishedDate: string;
}

interface PaginatedBooksResponse {
    content: BookResponse[];
    totalPages: number;
}

interface FindAllAuthorsData {
    findAllAuthors: AuthorResponse[];
}

interface FindAuthorsByNameData {
    findAuthorsByName: AuthorResponse[];
}

interface CreateAuthorData {
    createAuthor: AuthorResponse;
}

interface FindAllBooksData {
    findAllBooks: PaginatedBooksResponse;
}

interface FindBooksByAuthorNameData {
    findBooksByAuthorName: PaginatedBooksResponse;
}

interface FindBooksByAuthorIdData {
    findBooksByAuthorId: PaginatedBooksResponse;
}

interface FindBooksByDateRangeData {
    findBooksByDateRange: PaginatedBooksResponse;
}

interface FindBooksByTitleData {
    findBooksByTitle: PaginatedBooksResponse;
}

interface CreateBookData {
    createBook: BookResponse;
}

interface UpdateBookData {
    updateBook: BookResponse;
}

interface DeleteBookData {
    deleteBook: number;
}

const QUERIES = {
    FIND_ALL_AUTHORS: `{
        findAllAuthors {
          id
          name
        }
      }`,
    FIND_AUTHORS_BY_NAME: `query($name: String!) {
        findAuthorsByName(name: $name) {
          id
          name
        }
      }`,
    FIND_ALL_BOOKS: `query($page: Int, $size: Int) {
        findAllBooks(page: $page, size: $size) {
          content {
            id
            title
            author {
              name
            }
            publishedDate
          }
          totalPages
        }
      }`,
    FIND_BOOKS_BY_AUTHOR_NAME: `query($authorName: String!, $page: Int, $size: Int) {
        findBooksByAuthorName(authorName: $authorName, page: $page, size: $size) {
          content {
            id
            title
            author {
              name
            }
            publishedDate
          }
          totalPages
        }
      }`,
    FIND_BOOKS_BY_AUTHOR_ID: `query($authorId: Int!, $page: Int, $size: Int) {
        findBooksByAuthorId(authorId: $authorId, page: $page, size: $size) {
          content {
            id
            title
            author {
              name
            }
            publishedDate
          }
          totalPages
        }
      }`,
    FIND_BOOKS_BY_DATE_RANGE: `query($startDate: String!, $endDate: String, $page: Int, $size: Int) {
        findBooksByDateRange(startDate: $startDate, endDate: $endDate, page: $page, size: $size) {
          content {
            id
            title
            author {
              name
            }
            publishedDate
          }
          totalPages
        }
      }`,
    FIND_BOOKS_BY_TITLE: `query($title: String!, $page: Int, $size: Int) {
        findBooksByTitle(title: $title, page: $page, size: $size) {
          content {
            id
            title
            author {
              name
            }
            publishedDate
          }
          totalPages
        }
      }`,
    CREATE_AUTHOR: `mutation($name: String!) {
        createAuthor(name: $name) {
          id
          name
        }
      }`,
    CREATE_BOOK: `mutation($title: String!, $authorId: Int!, $publishedDate: String!) {
        createBook(title: $title, authorId: $authorId, publishedDate: $publishedDate) {
          id
          title
          author {
            name
          }
          publishedDate
        }
      }`,
    UPDATE_BOOK: `mutation($id: Int!, $title: String, $authorId: Int, $publishedDate: String) {
        updateBook(id: $id, title: $title, authorId: $authorId, publishedDate: $publishedDate) {
          id
          title
          author {
            name
          }
          publishedDate
        }
      }`,
    DELETE_BOOK: `mutation($id: Int!) {
        deleteBook(id: $id)
      }`
};

const handleApiError = async (response: Response, result: GraphQLResponse<any>) => {
    if (result.errors) {
        throw new Error(result.errors[0].message);
    }
    if (!response.ok && response.status !== 500) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    if (!response.ok) {
        throw new Error('Server error occurred');
    }
};

export interface Author {
    id: number;
    name: string;
}

export const fetchAuthors = async (): Promise<Author[]> => {
    return withRetry(async () => {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                query: QUERIES.FIND_ALL_AUTHORS,
            }),
        });

        const result: GraphQLResponse<FindAllAuthorsData> = await response.json();
        await handleApiError(response, result);
        return result.data.findAllAuthors;
    });
};

export const createAuthor = async (name: string): Promise<Author> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: QUERIES.CREATE_AUTHOR,
            variables: {name},
        }),
    });

    const result: GraphQLResponse<CreateAuthorData> = await response.json();
    await handleApiError(response, result);
    return result.data.createAuthor;
};

export const updateBook = async (id: number, title: string, authorId: number, publishedDate: string): Promise<Book> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: QUERIES.UPDATE_BOOK,
            variables: {id, title, authorId, publishedDate},
        }),
    });

    const result: GraphQLResponse<UpdateBookData> = await response.json();
    await handleApiError(response, result);
    const updatedBook = result.data.updateBook;
    return {
        ...updatedBook,
        author: updatedBook.author.name
    };
};

export const searchBooksByDateRange = async (startDate: string, endDate: string, page: number = 0, size: number = 10): Promise<{books: Book[], totalPages: number}> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: QUERIES.FIND_BOOKS_BY_DATE_RANGE,
            variables: {startDate, endDate, page, size},
        }),
    });

    const result: GraphQLResponse<FindBooksByDateRangeData> = await response.json();
    await handleApiError(response, result);
    const books = result.data.findBooksByDateRange.content.map((book: BookResponse) => ({
        ...book,
        author: book.author.name
    }));
    return {books, totalPages: result.data.findBooksByDateRange.totalPages};
};

export const searchBooksByAuthorName = async (authorName: string, page: number = 0, size: number = 10): Promise<{books: Book[], totalPages: number}> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: QUERIES.FIND_BOOKS_BY_AUTHOR_NAME,
            variables: {authorName, page, size},
        }),
    });

    const result: GraphQLResponse<FindBooksByAuthorNameData> = await response.json();
    await handleApiError(response, result);
    const books = result.data.findBooksByAuthorName.content.map((book: BookResponse) => ({
        ...book,
        author: book.author.name
    }));
    return {books, totalPages: result.data.findBooksByAuthorName.totalPages};
};

export const searchBooksByAuthorId = async (authorId: number, page: number = 0, size: number = 10): Promise<{books: Book[], totalPages: number}> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: QUERIES.FIND_BOOKS_BY_AUTHOR_ID,
            variables: {authorId, page, size},
        }),
    });

    const result: GraphQLResponse<FindBooksByAuthorIdData> = await response.json();
    await handleApiError(response, result);
    const books = result.data.findBooksByAuthorId.content.map((book: BookResponse) => ({
        ...book,
        author: book.author.name
    }));
    return {books, totalPages: result.data.findBooksByAuthorId.totalPages};
};

export const fetchBooks = async (page: number = 0, size: number = 10): Promise<{books: Book[], totalPages: number}> => {
    return withRetry(async () => {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                query: QUERIES.FIND_ALL_BOOKS,
                variables: {page, size},
            }),
        });

        const result: GraphQLResponse<FindAllBooksData> = await response.json();
        await handleApiError(response, result);
        if (!result.data?.findAllBooks) return {books: [], totalPages: 0};
        const books = result.data.findAllBooks.content.map((book: BookResponse) => ({
            ...book,
            author: book.author.name
        }));
        return {books, totalPages: result.data.findAllBooks.totalPages};
    });
};

export const createBook = async (book: {title: string, authorId: number, publishedDate: string}): Promise<Book> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: QUERIES.CREATE_BOOK,
            variables: {title: book.title, authorId: book.authorId, publishedDate: book.publishedDate},
        }),
    });

    const result: GraphQLResponse<CreateBookData> = await response.json();
    await handleApiError(response, result);
    const createdBook = result.data.createBook;
    return {
        ...createdBook,
        author: createdBook.author.name
    };
};

export const deleteBook = async (id: number): Promise<number> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: QUERIES.DELETE_BOOK,
            variables: {id},
        }),
    });

    const result: GraphQLResponse<DeleteBookData> = await response.json();
    await handleApiError(response, result);
    return result.data.deleteBook;
};

export const findAuthorsByName = async (name: string): Promise<Author[]> => {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            query: QUERIES.FIND_AUTHORS_BY_NAME,
            variables: {name},
        }),
    });

    const result: GraphQLResponse<FindAuthorsByNameData> = await response.json();
    await handleApiError(response, result);
    return result.data.findAuthorsByName;
};

export const searchBooksByTitle = async (title: string, page: number = 0, size: number = 10): Promise<{books: Book[], totalPages: number}> => {
    return withRetry(async () => {
        const sanitizedTitle = title.trim().replace(/[<>]/g, '');
        
        if (!sanitizedTitle) {
            return {books: [], totalPages: 0};
        }
        
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                query: QUERIES.FIND_BOOKS_BY_TITLE,
                variables: {title: sanitizedTitle, page, size},
            }),
        });

        const result: GraphQLResponse<FindBooksByTitleData> = await response.json();
        await handleApiError(response, result);
        
        if (!result.data?.findBooksByTitle) {
            return {books: [], totalPages: 0};
        }
        
        const books = result.data.findBooksByTitle.content.map((book: BookResponse) => ({
            ...book,
            author: book.author.name
        }));
        return {books, totalPages: result.data.findBooksByTitle.totalPages};
    });
};