import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Courses from "../pages/Courses";
import CourseUpload from "../pages/CourseUpload";
import CourseEdit from "../pages/CourseEdit";
import CourseCurriculum from "../pages/CourseCurriculum";
import Lessons from "../pages/Lessons";
import Videos from "../pages/Videos";
import Categories from "../pages/Categories";
import Instructors from "../pages/Instructors";
import Students from "../pages/Students";
import Orders from "../pages/Orders";
import Coupons from "../pages/Coupons";
import Reviews from "../pages/Reviews";
import Payouts from "../pages/Payouts";
import Withdrawals from "../pages/Withdrawals";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Users from "../pages/Users";
import RolesPermissions from "../pages/RolesPermissions";
import Announcements from "../pages/Announcements";
import SiteSettings from "../pages/SiteSettings";
import SupportTickets from "../pages/SupportTickets";
import ActivityLogs from "../pages/ActivityLogs";
import TestManagementHub from "../pages/questions/TestManagementHub";
import QuestionDetail from "../pages/questions/QuestionDetail";
import OnlineTest from "../pages/questions/OnlineTest";
import TestResult from "../pages/questions/TestResult";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/upload" element={<CourseUpload />} />
          <Route path="courses/:courseId/edit" element={<CourseEdit />} />
          <Route path="courses/:courseId/curriculum" element={<CourseCurriculum />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="videos" element={<Videos />} />
          <Route path="categories" element={<Categories />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="students" element={<Students />} />
          <Route path="orders" element={<Orders />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="support" element={<SupportTickets />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
          <Route path="questions" element={<TestManagementHub />} />
          <Route path="questions/list" element={<Navigate to="/questions?tab=questions" replace />} />
          <Route path="questions/test" element={<OnlineTest />} />
          <Route path="questions/test/result" element={<TestResult />} />
          <Route path="questions/:id" element={<QuestionDetail />} />
        </Route>
      </Route>
    </>
  )
);

export default router;
