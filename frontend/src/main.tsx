import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { LegalResearchProvider } from './context/LegalResearchContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LegalResearchProvider>
      <AppContent />
    </LegalResearchProvider>
  </React.StrictMode>
);
