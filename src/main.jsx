import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './AuthContext';
import { ChargersProvider } from './ChargersContext';
import { BookingsProvider } from './BookingsContext';
import { LiveLocationProvider } from './LiveLocationContext';
import { MarketplaceProvider } from './MarketplaceContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ChargersProvider>
          <MarketplaceProvider>
            <BookingsProvider>
              <LiveLocationProvider>
                <App />
              </LiveLocationProvider>
            </BookingsProvider>
          </MarketplaceProvider>
        </ChargersProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
