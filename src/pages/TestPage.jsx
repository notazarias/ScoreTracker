import { Box, Text, Button } from '@chakra-ui/react'

function TestPage() {
  console.log('TestPage rendering');
  
  return (
    <Box p={8} textAlign="center">
      <Text fontSize="xl" mb={4}>Test Page - If you can see this, rendering is working</Text>
      <Button colorScheme="blue">Test Button</Button>
    </Box>
  )
}

export default TestPage 