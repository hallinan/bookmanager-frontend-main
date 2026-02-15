export const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    delay: number = 1000
): Promise<T> => {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            // Don't retry on client errors (4xx) or validation errors
            if (lastError.message?.includes('validation') || 
                lastError.message?.includes('Invalid') ||
                lastError.message?.includes('required')) {
                throw lastError;
            }
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
            }
        }
    }
    
    throw lastError || new Error('Operation failed after retries');
};