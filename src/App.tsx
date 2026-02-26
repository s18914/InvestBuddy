import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { TestModeProvider } from "./contexts/TestModeContext";
import { useProfile } from "./hooks/useProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingGuard from "./components/OnboardingGuard";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PortfolioUpdate from "./pages/PortfolioUpdate";
import PortfolioDetails from "./pages/PortfolioDetails";
import Assets from "./pages/Assets";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Layout from "./components/Layout";
import { Onboarding } from "./pages/Onboarding";
import Rebalancing from "./pages/Rebalancing";

function AppContent() {
  useProfile();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/details" element={<PortfolioDetails />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/update" element={<PortfolioUpdate />} />
                  <Route path="/rebalancing" element={<Rebalancing />} />
                </Routes>
              </Layout>
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TestModeProvider>
          <AppContent />
        </TestModeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
