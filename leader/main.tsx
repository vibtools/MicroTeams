import React from 'react';
import ReactDOM from 'react-dom/client';
import { LeaderApp } from './LeaderApp';
import '../src/index.css';

const rootElement = document.getElementById('leader-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <LeaderApp />
    </React.StrictMode>
  );
}
