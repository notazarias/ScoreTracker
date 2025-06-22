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
  const navigate = useNavigate()
  const toast = useToast()
  const { login, signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
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

  return (
    <Container maxW="container.sm" py={20}>
      <VStack spacing={8}>
        <Heading>{isSignup ? 'Sign Up' : 'Login'} to Basketball Score Tracker</Heading>
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
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </FormControl>
              {error && <Text color="red.500">{error}</Text>}
              <Button
                w="100%"
                colorScheme="blue"
                type="submit"
                isLoading={loading}
                leftIcon={loading ? <Spinner size="sm" /> : null}
              >
                {isSignup ? 'Sign Up' : 'Login'}
              </Button>
              <Button
                w="100%"
                variant="link"
                onClick={() => setIsSignup((v) => !v)}
              >
                {isSignup
                  ? 'Already have an account? Login'
                  : "Don't have an account? Sign up"}
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
}

export default Login 

