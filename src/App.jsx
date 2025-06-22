import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ChakraProvider, Box } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TeamManagement from './pages/TeamManagement'
import GameTracker from './pages/GameTracker'
import { AuthProvider, useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar user={user} />
      <Box as="main" pt="60px">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/team"
            element={
              <PrivateRoute>
                <TeamManagement user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/game-tracker"
            element={
              <PrivateRoute>
                <GameTracker user={user} />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App
