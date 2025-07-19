import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Login() {
  console.log('Login component rendering');
  const navigate = useNavigate()
  const toast = useToast()
  const { login, signup, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit =  async (e) => {
    e.preventDefault()
    
    if (isForgotPassword) {
      handleForgotPassword()
      return
    }

    setLoading(true)
    setError('')

    // Validate passwords match for signup
    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      if (isSignup) {
        await signup(email, password)
        toast({
          title: 'Account created!',
          description: 'You are now signed in.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        await login(email, password)
        toast({
          title: 'Logged in successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleModeSwitch = () => {
    setIsSignup(!isSignup)
    setIsForgotPassword(false)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      await resetPassword(email)
      toast({
        title: 'Password reset email sent!',
        description: 'Check your email for password reset instructions.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setIsForgotPassword(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordMode = () => {
    setIsForgotPassword(true)
    setIsSignup(false)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Container maxW="container.sm" py={20}>
      <VStack spacing={8}>
        <Heading>
          {isForgotPassword ? 'Reset Password' : isSignup ? 'Sign Up' : 'Login'} to Basketball Score Tracker
        </Heading>
        <Box w="100%" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </FormControl>
              
              {!isForgotPassword && (
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </FormControl>
              )}
              
              {isSignup && !isForgotPassword && (
                <FormControl isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </FormControl>
              )}
              
              {error && <Text color="red.500">{error}</Text>}
              
              <Button
                w="100%"
                colorScheme="blue"
                type="submit"
                isLoading={loading}
                leftIcon={loading ? <Spinner size="sm" /> : null}
              >
                {isForgotPassword ? 'Send Reset Email' : isSignup ? 'Sign Up' : 'Login'}
              </Button>
              
              {!isForgotPassword && (
                <Button
                  w="100%"
                  variant="link"
                  onClick={handleModeSwitch}
                >
                  {isSignup
                    ? 'Already have an account? Login'
                    : "Don't have an account? Sign up"}
                </Button>
              )}
              
              {!isSignup && !isForgotPassword && (
                <Button
                  w="100%"
                  variant="link"
                  onClick={handleForgotPasswordMode}
                >
                  Forgot your password?
                </Button>
              )}
              
              {isForgotPassword && (
                <Button
                  w="100%"
                  variant="link"
                  onClick={() => {
                    setIsForgotPassword(false)
                    setError('')
                  }}
                >
                  Back to Login
                </Button>
              )}
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
}

export default Login 

