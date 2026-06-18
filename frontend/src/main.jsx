import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { CatalogSyncProvider } from './context/CatalogSyncContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <CatalogSyncProvider>
        <App />
      </CatalogSyncProvider>
    </ThemeProvider>
  </StrictMode>,
)
