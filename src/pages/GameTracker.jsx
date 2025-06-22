import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Select,
  IconButton,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
} from '@chakra-ui/react'
import { AddIcon, MinusIcon, DownloadIcon } from '@chakra-ui/icons'

function StatCounter({ label, value, onIncrement, onDecrement }) {
  return (
    <Stat>
      <StatLabel>{label}</StatLabel>
      <HStack spacing={2} align="center">
        <IconButton
          icon={<MinusIcon />}
          aria-label={`Decrease ${label}`}
          size="sm"
          onClick={onDecrement}
          isDisabled={value <= 0}
        />
        <StatNumber>{value}</StatNumber>
        <IconButton
          icon={<AddIcon />}
          aria-label={`Increase ${label}`}
          size="sm"
          onClick={onIncrement}
        />
      </HStack>
    </Stat>
  )
}

function PlayerStats({ player, onUpdateStats }) {
  const [stats, setStats] = useState({
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
  })

  const updateStat = (statName, increment) => {
    const newStats = {
      ...stats,
      [statName]: Math.max(0, stats[statName] + increment)
    }
    setStats(newStats)
    onUpdateStats(player.id, newStats)
  }

  const calculatePercentage = (made, attempted) => {
    return attempted > 0 ? ((made / attempted) * 100).toFixed(1) : 0
  }

  return (
    <Card>
      <CardHeader>
        <Heading size="md">#{player.jerseyNumber} {player.name}</Heading>
      </CardHeader>
      <CardBody>
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <StatCounter
            label="Points"
            value={stats.points}
            onIncrement={() => updateStat('points', 1)}
            onDecrement={() => updateStat('points', -1)}
          />
          <StatCounter
            label="Rebounds"
            value={stats.rebounds}
            onIncrement={() => updateStat('rebounds', 1)}
            onDecrement={() => updateStat('rebounds', -1)}
          />
          <StatCounter
            label="Assists"
            value={stats.assists}
            onIncrement={() => updateStat('assists', 1)}
            onDecrement={() => updateStat('assists', -1)}
          />
          <StatCounter
            label="Steals"
            value={stats.steals}
            onIncrement={() => updateStat('steals', 1)}
            onDecrement={() => updateStat('steals', -1)}
          />
          <StatCounter
            label="Blocks"
            value={stats.blocks}
            onIncrement={() => updateStat('blocks', 1)}
            onDecrement={() => updateStat('blocks', -1)}
          />
          <StatCounter
            label="Turnovers"
            value={stats.turnovers}
            onIncrement={() => updateStat('turnovers', 1)}
            onDecrement={() => updateStat('turnovers', -1)}
          />
          <StatCounter
            label="Field Goals Made"
            value={stats.fieldGoalsMade}
            onIncrement={() => updateStat('fieldGoalsMade', 1)}
            onDecrement={() => updateStat('fieldGoalsMade', -1)}
          />
          <StatCounter
            label="Field Goals Attempted"
            value={stats.fieldGoalsAttempted}
            onIncrement={() => updateStat('fieldGoalsAttempted', 1)}
            onDecrement={() => updateStat('fieldGoalsAttempted', -1)}
          />
          <Stat>
            <StatLabel>FG%</StatLabel>
            <StatNumber>
              {calculatePercentage(stats.fieldGoalsMade, stats.fieldGoalsAttempted)}%
            </StatNumber>
          </Stat>
          <StatCounter
            label="3PT Made"
            value={stats.threePointersMade}
            onIncrement={() => updateStat('threePointersMade', 1)}
            onDecrement={() => updateStat('threePointersMade', -1)}
          />
          <StatCounter
            label="3PT Attempted"
            value={stats.threePointersAttempted}
            onIncrement={() => updateStat('threePointersAttempted', 1)}
            onDecrement={() => updateStat('threePointersAttempted', -1)}
          />
          <Stat>
            <StatLabel>3PT%</StatLabel>
            <StatNumber>
              {calculatePercentage(stats.threePointersMade, stats.threePointersAttempted)}%
            </StatNumber>
          </Stat>
          <StatCounter
            label="Free Throws Made"
            value={stats.freeThrowsMade}
            onIncrement={() => updateStat('freeThrowsMade', 1)}
            onDecrement={() => updateStat('freeThrowsMade', -1)}
          />
          <StatCounter
            label="Free Throws Attempted"
            value={stats.freeThrowsAttempted}
            onIncrement={() => updateStat('freeThrowsAttempted', 1)}
            onDecrement={() => updateStat('freeThrowsAttempted', -1)}
          />
          <Stat>
            <StatLabel>FT%</StatLabel>
            <StatNumber>
              {calculatePercentage(stats.freeThrowsMade, stats.freeThrowsAttempted)}%
            </StatNumber>
          </Stat>
        </Grid>
      </CardBody>
    </Card>
  )
}

function GameHistory({ games, onSelectGame }) {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">Game History</Heading>
      </CardHeader>
      <CardBody>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Opponent</Th>
              <Th>Score</Th>
              <Th>Result</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {games.map((game) => (
              <Tr key={game.id}>
                <Td>{new Date(game.date).toLocaleDateString()}</Td>
                <Td>{game.opponent}</Td>
                <Td>{game.teamScore} - {game.opponentScore}</Td>
                <Td>{game.result}</Td>
                <Td>
                  <Button
                    size="sm"
                    onClick={() => onSelectGame(game)}
                  >
                    View Details
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  )
}

function SaveGameModal({ isOpen, onClose, onSave, teamScore, opponentScore }) {
  const [opponent, setOpponent] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      date,
      opponent,
      teamScore,
      opponentScore,
      result: teamScore > opponentScore ? 'W' : 'L'
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Save Game</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Opponent</FormLabel>
                <Input
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="Enter opponent team name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Final Score</FormLabel>
                <Text>
                  Your Team: {teamScore} - Opponent: {opponentScore}
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Save Game
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

function GameTracker({ user }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [gameStats, setGameStats] = useState({})
  const [games, setGames] = useState([])
  const [opponentScore, setOpponentScore] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Players should be passed in or managed globally, for now, start with empty
  const players = []

  const handleUpdateStats = (playerId, newStats) => {
    setGameStats(prev => ({
      ...prev,
      [playerId]: newStats
    }))
  }

  const handleSaveGame = (gameData) => {
    const newGame = {
      id: Date.now(),
      ...gameData,
      playerStats: gameStats,
      createdAt: new Date().toISOString()
    }
    setGames(prev => [newGame, ...prev])
    toast({
      title: 'Game saved successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const exportGameStats = () => {
    const stats = {
      date: new Date().toISOString(),
      teamScore: Object.values(gameStats).reduce((sum, stats) => sum + stats.points, 0),
      opponentScore,
      playerStats: gameStats
    }
    
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `game-stats-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const teamScore = Object.values(gameStats).reduce((sum, stats) => sum + stats.points, 0)

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading>Game Tracker</Heading>

        <Card>
          <CardHeader>
            <Heading size="md">Select Player</Heading>
          </CardHeader>
          <CardBody>
            <Select
              placeholder="Choose a player"
              value={selectedPlayer?.id || ''}
              onChange={(e) => {
                const player = players.find(p => p.id === parseInt(e.target.value))
                setSelectedPlayer(player)
              }}
            >
              {players.map(player => (
                <option key={player.id} value={player.id}>
                  #{player.jerseyNumber} {player.name}
                </option>
              ))}
            </Select>
          </CardBody>
        </Card>

        {selectedPlayer && (
          <PlayerStats
            player={selectedPlayer}
            onUpdateStats={handleUpdateStats}
          />
        )}

        <Card>
          <CardHeader>
            <Heading size="md">Team Totals</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <Stat>
                <StatLabel>Total Points</StatLabel>
                <StatNumber>{teamScore}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Opponent Score</StatLabel>
                <StatNumber>{opponentScore}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Point Difference</StatLabel>
                <StatNumber>
                  {teamScore - opponentScore}
                  <StatArrow
                    type={teamScore > opponentScore ? 'increase' : 'decrease'}
                  />
                </StatNumber>
              </Stat>
            </Grid>
            <HStack mt={4} spacing={4}>
              <Button
                leftIcon={<AddIcon />}
                onClick={() => setOpponentScore(prev => prev + 1)}
              >
                Opponent +1
              </Button>
              <Button
                leftIcon={<MinusIcon />}
                onClick={() => setOpponentScore(prev => Math.max(0, prev - 1))}
                isDisabled={opponentScore <= 0}
              >
                Opponent -1
              </Button>
              <Button
                leftIcon={<DownloadIcon />}
                onClick={exportGameStats}
                colorScheme="green"
              >
                Export Stats
              </Button>
              <Button
                onClick={onOpen}
                colorScheme="blue"
              >
                Save Game
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <GameHistory
          games={games}
          onSelectGame={(game) => {
            // TODO: Implement game details view
            console.log('Selected game:', game)
          }}
        />

        <SaveGameModal
          isOpen={isOpen}
          onClose={onClose}
          onSave={handleSaveGame}
          teamScore={teamScore}
          opponentScore={opponentScore}
        />
      </VStack>
    </Container>
  )
}

export default GameTracker 