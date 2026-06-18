import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DownloadPage from './pages/DownloadPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
