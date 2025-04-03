import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StoreProvider } from './store';
import { defaultPatientTheme } from './theme/portalThemes';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Initialize analytics and monitoring
import './utils/analytics';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={defaultPatientTheme}>
        <CssBaseline /> {/* Reset CSS */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StoreProvider>
            <App />
          </StoreProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Performance monitoring
reportWebVitals(console.log);
