import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DownloadPage from './pages/DownloadPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import PaymentPrivacyPolicyPage from './pages/PaymentPrivacyPolicyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/payment-privacy" element={<PaymentPrivacyPolicyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
