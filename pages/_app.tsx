import type { AppProps } from 'next/app.js';
import dynamic from 'next/dynamic';
import '../src/index.css';

// Dynamically import App component with SSR disabled using Next.js dynamic
// This prevents BrowserRouter from trying to access 'document' during server-side rendering
// Next.js dynamic import auto-resolves TypeScript files without extension
const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div>Loading...</div>
    </div>
  ),
});

export default function MyApp(_props: AppProps) {
  // Use the existing App component which handles all routing with React Router
  // Next.js will serve this, but React Router handles all client-side routing
  return <App />;
}

