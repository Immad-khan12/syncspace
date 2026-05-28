import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/index.jsx';
import useAuthStore from './store/authStore.js';
import './index.css';

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <Toaster
        position="bottom-right"
        gutter={8}
        containerStyle={{ bottom: 24, right: 24 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#F8FAFC',
            border: '1px solid #1E293B',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '12px 16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#111827',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#111827',
            },
          },
          loading: {
            iconTheme: {
              primary: '#6366F1',
              secondary: '#111827',
            },
          },
        }}
      />
      <AppRouter />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);