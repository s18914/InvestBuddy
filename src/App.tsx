import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useProfile } from "./hooks/useProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingGuard from "./components/OnboardingGuard";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PortfolioUpdate from "./pages/PortfolioUpdate";
import PortfolioDetails from "./pages/PortfolioDetails";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import { Onboarding } from "./pages/Onboarding";

function AppContent() {
  useProfile();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
                  <Route path="/update" element={<PortfolioUpdate />} />
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
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
