import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './lib/auth';
import './index.css';

const spaRedirectKey = 'matchday-spa-redirect';

const pendingRedirect = sessionStorage.getItem(spaRedirectKey);

if (pendingRedirect) {
  sessionStorage.removeItem(spaRedirectKey);

  const redirect = JSON.parse(pendingRedirect) as {
    path?: string;
    search?: string;
    hash?: string;
  };

  const targetPath = redirect.path ?? '/';
  const targetSearch = redirect.search ?? '';
  const targetHash = redirect.hash ?? '';

  window.history.replaceState(
    {},
    '',
    `${import.meta.env.BASE_URL.replace(/\/$/, '')}${targetPath}${targetSearch}${targetHash}`,
  );
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Matchday SA could not start</h1>
          <p>{this.state.error.message}</p>
        </main>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppProviders />
    </AppErrorBoundary>
  </React.StrictMode>
);

function AppProviders() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );
}
