import React from 'react';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom/client';
import './index.css';
import store from './store';
import App from './App';
import {LanguageProvider} from './LanguageContext';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <Provider store={store}>
        <React.StrictMode>
            <LanguageProvider>
                <App/>
            </LanguageProvider>
        </React.StrictMode>
    </Provider>
);
