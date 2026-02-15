import {useState} from 'react';

export const useErrorHandler = () => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleError = (err: unknown, fallbackMessage: string) => {
        const message = err instanceof Error ? err.message : fallbackMessage;
        setError(message);
    };

    const handleSuccess = (message: string) => {
        setSuccess(message);
        setError(null);
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return {
        error,
        success,
        handleError,
        handleSuccess,
        clearMessages
    };
};