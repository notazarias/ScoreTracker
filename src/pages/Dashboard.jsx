import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react'

function Dashboard({ user }) {
  const navigate = useNavigate()
  const bgColor = useColorModeValue('gray.50', 'gray.700')

  // No sample data, just show empty state
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading>Dashboard</Heading>

        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Games</StatLabel>
                <StatNumber>-</StatNumber>
                <StatHelpText>No data</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Points</StatLabel>
                <StatNumber>-</StatNumber>
                <StatHelpText>No data</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Best Scorer</StatLabel>
                <StatNumber>-</StatNumber>
                <StatHelpText>No data</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Card>
          <CardHeader>
            <Heading size="md">Recent Games</Heading>
          </CardHeader>
          <CardBody>
            <Text color="gray.500">No recent games to display.</Text>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default Dashboard 