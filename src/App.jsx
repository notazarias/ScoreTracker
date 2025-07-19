import { BrowserRouter as Router, Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom'
import { ChakraProvider, Box, VStack, Spinner, Text, Button } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import TestPage from './pages/TestPage'
import Dashboard from './pages/Dashboard'
import TeamManagement from './pages/TeamManagement'
import GameTracker from './pages/GameTracker'
import GameDetails from './pages/GameDetails.jsx'
import { AuthProvider, useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  console.log('PrivateRoute - user:', user, 'loading:', loading);
  
  // Show loading state while auth is initializing
  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading...</Text>
        </VStack>
      </Box>
    );
  }
  
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [error, setError] = useState(null);
  
  console.log('AppRoutes - user:', user, 'loading:', loading);
  
  // Show loading state while auth is initializing
  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading app...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Text color="red.500">Error: {error}</Text>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </VStack>
      </Box>
    );
  }

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
          <Route path="/game-details/:gameId" element={<GameDetails />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={
            <Box p={8} textAlign="center">
              <Text>Page not found. <Button as={RouterLink} to="/login" colorScheme="blue">Go to Login</Button></Text>
            </Box>
          } />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  console.log('App component rendering');
  
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
