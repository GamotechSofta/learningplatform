import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DownloadPage from './pages/DownloadPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/download" element={<DownloadPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
