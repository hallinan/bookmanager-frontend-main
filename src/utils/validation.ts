export const sanitizeString = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

export const validateBookTitle = (title: string): string | null => {
    const sanitized = sanitizeString(title);
    if (!sanitized) return 'Book title is required and cannot be empty';
    if (sanitized.length < 2) return 'Book title must be at least 2 characters long';
    if (sanitized.length > 255) return 'Book title cannot exceed 255 characters';
    return null;
};

export const validateAuthorName = (name: string): string | null => {
    const sanitized = sanitizeString(name);
    if (!sanitized) return 'Author name is required and cannot be empty';
    if (sanitized.length < 2) return 'Author name must be at least 2 characters long';
    if (sanitized.length > 100) return 'Author name cannot exceed 100 characters';
    return null;
};

export const validateDate = (date: string): string | null => {
    if (!date) return 'Publication date is required';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Please enter a valid date';
    if (dateObj > new Date()) return 'Publication date cannot be in the future';
    if (dateObj.getFullYear() < 1000) return 'Publication date seems too old. Please check the year';
    return null;
};

export const validateId = (id: number): string | null => {
    if (!id || id <= 0) return 'Invalid selection. Please choose a valid option';
    return null;
};