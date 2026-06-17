// Must run before supabase-js to capture invite/recovery hash from the URL.
import './lib/authRedirect';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
