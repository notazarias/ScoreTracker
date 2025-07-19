import { useState, useEffect } from 'react'
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
  HStack,
  Badge,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import { db } from '../firebase/config'
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

function Dashboard({ user }) {
  console.log('Dashboard component rendering, user prop:', user);
  const navigate = useNavigate()
  const bgColor = useColorModeValue('gray.50', 'gray.700')
  const [games, setGames] = useState([])
  const [savedGameDraft, setSavedGameDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    totalPoints: 0,
    topScorer: null,
    bestRebounder: null,
    mostAssists: null,
    bestFGPercentage: null,
  })
  const { user: authUser } = useAuth()
  console.log('Dashboard - authUser from useAuth:', authUser);
  const toast = useToast()

  // Load games and saved drafts from Firestore
  useEffect(() => {
    if (!authUser || !authUser.uid) return
    setLoading(true)
    const fetchData = async () => {
      try {
        // Fetch completed games
        const q = query(collection(db, 'users', authUser.uid, 'games'), orderBy('date', 'desc'))
        const querySnapshot = await getDocs(q)
        const gamesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setGames(gamesData)
        calculateStats(gamesData)

        // Fetch saved game draft
        const draftQuery = query(collection(db, 'users', authUser.uid, 'gameDrafts'))
        const draftSnapshot = await getDocs(draftQuery)
        if (!draftSnapshot.empty) {
          const draftData = draftSnapshot.docs[0].data()
          if (draftData && !draftData.gameEnded) {
            setSavedGameDraft(draftData)
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast({
          title: 'Error loading data',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authUser, toast])

  const calculateStats = (gamesData) => {
    if (!gamesData || gamesData.length === 0) {
      setStats({
        totalGames: 0,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        topScorer: null,
        bestRebounder: null,
        mostAssists: null,
        bestFGPercentage: null,
      })
      return
    }

    let totalGames = gamesData.length
    let wins = 0
    let losses = 0
    let totalPoints = 0
    let playerStats = {}

    gamesData.forEach(game => {
      try {
        // Calculate wins/losses
        if (game.result === 'W') wins++
        else if (game.result === 'L') losses++

        // Calculate total points
        totalPoints += game.teamScore || 0

        // Aggregate player stats from both home and opponent arrays
        if (game.playerStats) {
          ['home', 'opponent'].forEach(teamType => {
            const arr = Array.isArray(game.playerStats[teamType]) ? game.playerStats[teamType] : [];
            arr.forEach(player => {
              // Use name+jersey as key (since no unique ID)
              const key = `${player.name || ''}_${player.jersey || ''}`;
              if (!playerStats[key]) {
                playerStats[key] = {
                  name: player.name || 'Unknown Player',
                  jersey: player.jersey || '',
                  points: 0,
                  rebounds: 0,
                  assists: 0,
                  fieldGoalsMade: 0,
                  fieldGoalsAttempted: 0,
                  gamesPlayed: 0,
                }
              }
              playerStats[key].points += player.stats?.pts || 0
              playerStats[key].rebounds += player.stats?.reb || 0
              playerStats[key].assists += player.stats?.ast || 0
              playerStats[key].fieldGoalsMade += player.stats?.fgm || 0
              playerStats[key].fieldGoalsAttempted += player.stats?.fga || 0
              playerStats[key].gamesPlayed += 1
            })
          })
        }
      } catch (error) {
        console.error('Error processing game data:', error, game)
      }
    })

    // Find top performers
    const playersArray = Object.values(playerStats)
    const topScorer = playersArray.length > 0 ? playersArray.reduce((max, player) => 
      player.points > max.points ? player : max, playersArray[0]) : null
    
    const bestRebounder = playersArray.length > 0 ? playersArray.reduce((max, player) => 
      player.rebounds > max.rebounds ? player : max, playersArray[0]) : null
    
    const mostAssists = playersArray.length > 0 ? playersArray.reduce((max, player) => 
      player.assists > max.assists ? player : max, playersArray[0]) : null
    
    const bestFGPercentage = playersArray
      .filter(player => player.fieldGoalsAttempted > 0)
      .reduce((max, player) => {
        const percentage = (player.fieldGoalsMade / player.fieldGoalsAttempted) * 100
        const maxPercentage = max ? (max.fieldGoalsMade / max.fieldGoalsAttempted) * 100 : 0
        return percentage > maxPercentage ? player : max
      }, null)

    setStats({
      totalGames,
      wins,
      losses,
      totalPoints,
      topScorer,
      bestRebounder,
      mostAssists,
      bestFGPercentage,
    })
  }

  const formatPercentage = (made, attempted) => {
    if (attempted === 0) return '0%'
    const capped = Math.min(made, attempted)
    return `${((capped / attempted) * 100).toFixed(1)}%`
  }

  const resumeSavedGame = () => {
    // Store the saved game data in localStorage for GameTracker to access
    localStorage.setItem('savedGameData', JSON.stringify(savedGameDraft))
    navigate('/game-tracker')
  }

  const startNewGame = () => {
    // Clear any saved game data and navigate to game tracker
    localStorage.removeItem('savedGameData')
    navigate('/game-tracker')
  }

  const deleteGame = async (gameId) => {
    if (!authUser) return;
    try {
      await deleteDoc(doc(db, 'users', authUser.uid, 'games', gameId));
      setGames(games => games.filter(g => g.id !== gameId));
      toast({
        title: 'Game deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting game',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const deleteDraft = async () => {
    if (!authUser) return;
    try {
      const draftQuery = query(collection(db, 'users', authUser.uid, 'gameDrafts'));
      const draftSnapshot = await getDocs(draftQuery);
      if (!draftSnapshot.empty) {
        await deleteDoc(doc(db, 'users', authUser.uid, 'gameDrafts', draftSnapshot.docs[0].id));
        setSavedGameDraft(null);
        toast({
          title: 'Draft deleted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error deleting draft',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="center">
          <Spinner size="xl" />
          <Text>Loading dashboard...</Text>
        </VStack>
      </Container>
    )
  }

  if (!authUser) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="center">
          <Text>Please log in to access the dashboard.</Text>
          <Button colorScheme="blue" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading>Dashboard</Heading>
          <Button
            colorScheme="green"
            onClick={startNewGame}
          >
            Start New Game
          </Button>
        </HStack>

        {/* Record and Main Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Games</StatLabel>
                <StatNumber>{stats.totalGames}</StatNumber>
                <StatHelpText>Games played</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Record</StatLabel>
                <StatNumber>{stats.wins}-{stats.losses}</StatNumber>
                <StatHelpText>
                  {stats.totalGames > 0 ? `${((stats.wins / stats.totalGames) * 100).toFixed(1)}% win rate` : 'No games'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Points</StatLabel>
                <StatNumber>{stats.totalPoints}</StatNumber>
                <StatHelpText>
                  {stats.totalGames > 0 ? `${(stats.totalPoints / stats.totalGames).toFixed(1)} avg per game` : 'No games'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Player Performance Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Card size="sm">
            <CardBody>
              <Stat>
                <StatLabel>Top Scorer</StatLabel>
                <StatNumber>{stats.topScorer?.points || 0}</StatNumber>
                <StatHelpText>{stats.topScorer?.name || 'No data'}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card size="sm">
            <CardBody>
              <Stat>
                <StatLabel>Best Rebounder</StatLabel>
                <StatNumber>{stats.bestRebounder?.rebounds || 0}</StatNumber>
                <StatHelpText>{stats.bestRebounder?.name || 'No data'}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card size="sm">
            <CardBody>
              <Stat>
                <StatLabel>Most Assists</StatLabel>
                <StatNumber>{stats.mostAssists?.assists || 0}</StatNumber>
                <StatHelpText>{stats.mostAssists?.name || 'No data'}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card size="sm">
            <CardBody>
              <Stat>
                <StatLabel>Best FG%</StatLabel>
                <StatNumber>
                  {stats.bestFGPercentage ? 
                    formatPercentage(stats.bestFGPercentage.fieldGoalsMade, stats.bestFGPercentage.fieldGoalsAttempted) : 
                    '0%'
                  }
                </StatNumber>
                <StatHelpText>{stats.bestFGPercentage?.name || 'No data'}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Saved Game Draft */}
        {savedGameDraft && (
          <Card>
            <CardHeader>
              <Heading size="md">Saved Game</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box p={4} borderWidth={1} borderRadius="md" bg="yellow.50">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">
                        {typeof savedGameDraft.homeTeam === 'object' ? savedGameDraft.homeTeam?.name || 'Home Team' : String(savedGameDraft.homeTeam)} vs {typeof savedGameDraft.opponent === 'object' ? savedGameDraft.opponent?.name || 'Opponent' : String(savedGameDraft.opponent)}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        Quarter {savedGameDraft.currentQuarter + 1} - Last saved: {new Date(savedGameDraft.lastSaved).toLocaleString()}
                      </Text>
                      <Text color="gray.600" fontSize="sm">
                        Players on floor: {savedGameDraft.playersOnFloor?.home?.length || 0} vs {savedGameDraft.playersOnFloor?.opponent?.length || 0}
                      </Text>
                    </VStack>
                    <HStack>
                      <Button colorScheme="blue" onClick={resumeSavedGame}>Resume Game</Button>
                      <Button colorScheme="red" onClick={deleteDraft}>Delete</Button>
                    </HStack>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Recent Games */}
        <Card>
          <CardHeader>
            <Heading size="md">Recent Games</Heading>
          </CardHeader>
          <CardBody>
            {games.length === 0 ? (
              <Text color="gray.500">No recent games to display.</Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {games.slice(0, 5).map((game) => (
                  <Box key={game.id} p={4} borderWidth={1} borderRadius="md">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">
                          vs {typeof game.opponent === 'object' ? game.opponent?.name || 'Unknown Team' : String(game.opponent)}
                        </Text>
                        <Text color="gray.600" fontSize="sm">
                          {new Date(game.date).toLocaleDateString()}
                        </Text>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <HStack spacing={2}>
                          <Text fontWeight="bold">{game.teamScore || 0}</Text>
                          <Text>-</Text>
                          <Text>{game.opponentScore || 0}</Text>
                        </HStack>
                        <Badge 
                          colorScheme={game.result === 'W' ? 'green' : 'red'}
                          variant="subtle"
                        >
                          {game.result === 'W' ? 'WIN' : 'LOSS'}
                        </Badge>
                        <HStack>
                          <Button size="sm" colorScheme="blue" onClick={() => navigate(`/game-details/${game.id}`)}>View Details</Button>
                          <Button size="sm" colorScheme="red" onClick={() => deleteGame(game.id)}>Delete</Button>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default Dashboard 