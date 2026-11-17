import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminClaimReviewPage from './pages/AdminClaimReviewPage';
import AdminClaimsPage from './pages/AdminClaimsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminReportsPage from './pages/AdminReportsPage';
import BrowseReportsPage from './pages/BrowseReportsPage';
import ClaimSubmissionPage from './pages/ClaimSubmissionPage';
import CreateReportPage from './pages/CreateReportPage';
import EditReportPage from './pages/EditReportPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MyClaimsPage from './pages/MyClaimsPage';
import MyReportsPage from './pages/MyReportsPage';
import RegisterPage from './pages/RegisterPage';
import ReportDetailPage from './pages/ReportDetailPage';
import StudentDashboard from './pages/StudentDashboard';

function PageWrapper({ children }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand">UCU Lost & Found</Link>

        <nav className="main-nav">
          {!user ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/reports">Reports</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : user.role === 'ADMIN' ? (
            <>
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/reports">Reports</Link>
              <Link to="/admin/claims">Claims</Link>
              <button type="button" className="logout-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/reports">Reports</Link>
              <Link to="/my-reports">My reports</Link>
              <Link to="/my-claims">My claims</Link>
              <button type="button" className="logout-button" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </header>

      <main className="main-content">{children}</main>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
      <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
      <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
      <Route path="/reports" element={<PageWrapper><BrowseReportsPage /></PageWrapper>} />
      <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><StudentDashboard /></PageWrapper></ProtectedRoute>} />
      <Route path="/reports/new" element={<ProtectedRoute><PageWrapper><CreateReportPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/reports/found/new" element={<ProtectedRoute><PageWrapper><CreateReportPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/reports/:id/edit" element={<ProtectedRoute><PageWrapper><EditReportPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/reports/:id" element={<PageWrapper><ReportDetailPage /></PageWrapper>} />
      <Route path="/my-reports" element={<ProtectedRoute><PageWrapper><MyReportsPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/my-claims" element={<ProtectedRoute><PageWrapper><MyClaimsPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/claims/:id" element={<ProtectedRoute><PageWrapper><ClaimSubmissionPage /></PageWrapper></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute adminOnly><PageWrapper><AdminDashboard /></PageWrapper></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute adminOnly><PageWrapper><AdminReportsPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/admin/claims" element={<ProtectedRoute adminOnly><PageWrapper><AdminClaimsPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/admin/claims/:id" element={<ProtectedRoute adminOnly><PageWrapper><AdminClaimReviewPage /></PageWrapper></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
