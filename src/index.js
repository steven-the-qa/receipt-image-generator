import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Detect if we're in production environment
const isProduction = 
  window.location.hostname.includes('github.io') || 
  process.env.REACT_APP_DEPLOY === 'true' || 
  process.env.NODE_ENV === 'production';

const basename = isProduction ? '/receipt-image-generator' : '';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
