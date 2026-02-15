import React, {useEffect} from 'react';

interface SuccessNotificationProps {
    message: string;
    onClose: () => void;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({message, onClose}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="success-notification">
            ✓ {message}
        </div>
    );
};

export default SuccessNotification;
