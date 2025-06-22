import { Box, Flex, Button, Heading, Spacer, HStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

function Navbar({ user }) {
  return (
    <Box
      as="nav"
      position="fixed"
      w="100%"
      bg="white"
      boxShadow="sm"
      zIndex="sticky"
    >
      <Flex
        maxW="container.xl"
        mx="auto"
        px={4}
        h="60px"
        align="center"
      >
        <Heading size="md" as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
          Basketball Score Tracker
        </Heading>
        
        <Spacer />
        
        <HStack spacing={4}>
          <Button
            as={RouterLink}
            to="/dashboard"
            variant="ghost"
          >
            Dashboard
          </Button>
          <Button
            as={RouterLink}
            to="/team"
            variant="ghost"
          >
            Team
          </Button>
          <Button
            as={RouterLink}
            to="/game-tracker"
            variant="ghost"
          >
            Game Tracker
          </Button>
          {user && (
            <Button
              variant="ghost"
              colorScheme="red"
            >
              Logout
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}

export default Navbar 