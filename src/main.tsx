import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider } from 'convex/react';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import { convex } from './lib/convex';
import './index.css';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();

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
      {clerkPublishableKey ? (
        <ClerkProvider
          publishableKey={clerkPublishableKey}
          signInUrl={`${import.meta.env.BASE_URL}auth`}
          afterSignOutUrl={import.meta.env.BASE_URL}
        >
          <AppProviders />
        </ClerkProvider>
      ) : (
        <AppProviders />
      )}
    </AppErrorBoundary>
  </React.StrictMode>
);

function AppProviders() {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  );
}
