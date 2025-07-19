import { useState, useEffect, useRef } from 'react'
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
  Input,
  FormControl,
  FormLabel,
  Spinner,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Badge,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'
import { db } from '../firebase/config'
import { collection, addDoc, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function GameTracker({ user }) {
  const [gameState, setGameState] = useState({
    started: false,
    startersSelected: false,
    homeTeam: {
      name: "",
      players: [],
      starters: []
    },
    opponent: {
      name: "",
      players: [],
      starters: []
    },
    quarters: [[], [], [], []], // 4 quarters - each quarter has both teams
    currentQuarter: 0,
    playersOnFloor: {
      home: [],
      opponent: []
    }
  })
  const [players, setPlayers] = useState([])
  const [games, setGames] = useState([])
  const [fetchingPlayers, setFetchingPlayers] = useState(true)
  const [fetchingGames, setFetchingGames] = useState(true)
  const { user: authUser } = useAuth()
  const toast = useToast()
  const [resumed, setResumed] = useState(false)
  const navigate = useNavigate()

  const positions = ['PG', 'SG', 'SF', 'PF', 'C']

  // Load players from Firestore
  useEffect(() => {
    if (!authUser) return;
    setFetchingPlayers(true)
    const fetchPlayers = async () => {
      const q = query(collection(db, 'users', authUser.uid, 'players'))
      const querySnapshot = await getDocs(q)
      setPlayers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setFetchingPlayers(false)
    }
    fetchPlayers()
  }, [authUser])

  // Load team name from Firestore
  useEffect(() => {
    if (!authUser) return;
    const fetchTeamName = async () => {
      try {
        const teamDoc = await getDocs(collection(db, 'users', authUser.uid, 'team'))
        if (!teamDoc.empty) {
          const teamName = teamDoc.docs[0].data().name || ''
          setGameState(prev => ({
            ...prev,
            homeTeam: { ...prev.homeTeam, name: teamName }
          }))
        }
      } catch (error) {
        console.error('Error fetching team name:', error)
      }
    }
    fetchTeamName()
  }, [authUser])

  // Load games from Firestore
  useEffect(() => {
    if (!authUser) return;
    setFetchingGames(true)
    const fetchGames = async () => {
      const q = query(collection(db, 'users', authUser.uid, 'games'), orderBy('date', 'desc'))
      const querySnapshot = await getDocs(q)
      setGames(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setFetchingGames(false)
    }
    fetchGames()
  }, [authUser])

  // Load saved game draft from localStorage (when resuming from dashboard)
  useEffect(() => {
    const savedGameData = localStorage.getItem('savedGameData')
    if (savedGameData) {
      try {
        const draftData = JSON.parse(savedGameData)
        if (draftData && !draftData.gameEnded) {
          setGameState(prev => ({
            ...prev,
            homeTeam: draftData.homeTeam || prev.homeTeam,
            opponent: draftData.opponent || prev.opponent,
            quarters: draftData.quarters || prev.quarters,
            currentQuarter: draftData.currentQuarter || prev.currentQuarter,
            playersOnFloor: draftData.playersOnFloor || prev.playersOnFloor,
            started: true,
            startersSelected: draftData.startersSelected !== false
          }))
          setGameEnded(draftData.gameEnded || false)
          setResumed(true)
          // Clear the localStorage data after loading
          localStorage.removeItem('savedGameData')
          toast({
            title: 'Game Resumed',
            description: 'Your saved game has been loaded successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        }
      } catch (error) {
        console.error('Error loading saved game data:', error)
        localStorage.removeItem('savedGameData')
      }
    }
  }, []) // Only run once on mount

  // Load saved game draft from Firestore (fallback)
  useEffect(() => {
    if (!authUser) return;
    const loadGameDraft = async () => {
      try {
        const draftDoc = await getDocs(collection(db, 'users', authUser.uid, 'gameDrafts'))
        if (!draftDoc.empty) {
          const draftData = draftDoc.docs[0].data()
          if (draftData && !draftData.gameEnded && !gameState.started) {
            setGameState(prev => ({
              ...prev,
              homeTeam: draftData.homeTeam || prev.homeTeam,
              opponent: draftData.opponent || prev.opponent,
              quarters: draftData.quarters || prev.quarters,
              currentQuarter: draftData.currentQuarter || prev.currentQuarter,
              playersOnFloor: draftData.playersOnFloor || prev.playersOnFloor,
              started: draftData.started || prev.started,
              startersSelected: draftData.startersSelected || prev.startersSelected
            }))
            setGameEnded(draftData.gameEnded || false)
            
            toast({
              title: 'Game Draft Loaded',
              description: 'Previous game progress has been restored',
              status: 'info',
              duration: 3000,
              isClosable: true,
            })
          }
        }
      } catch (error) {
        console.error('Error loading game draft:', error)
      }
    }
    loadGameDraft()
  }, [authUser]) // Only depend on authUser

  const addHomePlayer = () => {
    setGameState(prev => ({
      ...prev,
      homeTeam: {
        ...prev.homeTeam,
        players: [...prev.homeTeam.players, { 
          name: "", 
          jersey: "", 
          stats: { 
            pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, 
            fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, foul: 0 
          } 
        }]
      }
    }))
  }

  const addOpponentPlayer = () => {
    setGameState(prev => ({
      ...prev,
      opponent: {
        ...prev.opponent,
        players: [...prev.opponent.players, { 
          name: "", 
          jersey: "", 
          stats: { 
            pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, 
            fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, foul: 0 
          } 
        }]
      }
    }))
  }

  const updateHomePlayer = (index, field, value) => {
    setGameState(prev => ({
      ...prev,
      homeTeam: {
        ...prev.homeTeam,
        players: prev.homeTeam.players.map((player, i) => 
          i === index ? { ...player, [field]: value } : player
        )
      }
    }))
  }

  const updateOpponentPlayer = (index, field, value) => {
    setGameState(prev => ({
      ...prev,
      opponent: {
        ...prev.opponent,
        players: prev.opponent.players.map((player, i) => 
          i === index ? { ...player, [field]: value } : player
        )
      }
    }))
  }

  const addHomeStarter = (player, position) => {
    if (gameState.homeTeam.starters.length >= 5) {
      toast({
        title: 'Error',
        description: 'Maximum 5 starters allowed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    
    if (gameState.homeTeam.starters.some(starter => starter.position === position)) {
      toast({
        title: 'Error',
        description: `Position ${position} is already taken`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setGameState(prev => ({
      ...prev,
      homeTeam: {
        ...prev.homeTeam,
        starters: [...prev.homeTeam.starters, { ...player, position }]
      }
    }))
  }

  const addOpponentStarter = (player, position) => {
    if (gameState.opponent.starters.length >= 5) {
      toast({
        title: 'Error',
        description: 'Maximum 5 starters allowed',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    
    if (gameState.opponent.starters.some(starter => starter.position === position)) {
      toast({
        title: 'Error',
        description: `Position ${position} is already taken`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setGameState(prev => ({
      ...prev,
      opponent: {
        ...prev.opponent,
        starters: [...prev.opponent.starters, { ...player, position }]
      }
    }))
  }

  const removeHomeStarter = (index) => {
    setGameState(prev => ({
      ...prev,
      homeTeam: {
        ...prev.homeTeam,
        starters: prev.homeTeam.starters.filter((_, i) => i !== index)
      }
    }))
  }

  const removeOpponentStarter = (index) => {
    setGameState(prev => ({
      ...prev,
      opponent: {
        ...prev.opponent,
        starters: prev.opponent.starters.filter((_, i) => i !== index)
      }
    }))
  }

  const addPlayerToFloor = (teamType, player) => {
    if (gameState.playersOnFloor[teamType].length >= 5) {
      toast({
        title: 'Error',
        description: 'Maximum 5 players on floor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setGameState(prev => ({
      ...prev,
      playersOnFloor: {
        ...prev.playersOnFloor,
        [teamType]: [...prev.playersOnFloor[teamType], player]
      }
    }))
  }

  const removePlayerFromFloor = (teamType, index) => {
    setGameState(prev => ({
      ...prev,
      playersOnFloor: {
        ...prev.playersOnFloor,
        [teamType]: prev.playersOnFloor[teamType].filter((_, i) => i !== index)
      }
    }))
  }

  const saveGame = async () => {
    if (!authUser) return
    console.log('saveGame called: saving current game draft to Firestore')
    setSavingGame(true)
    try {
      const gameData = {
        homeTeam: gameState.homeTeam,
        opponent: gameState.opponent,
        quarters: gameState.quarters,
        currentQuarter: gameState.currentQuarter,
        playersOnFloor: gameState.playersOnFloor,
        gameEnded: gameEnded,
        lastSaved: new Date().toISOString(),
        date: new Date().toISOString()
      }

      // Save as a draft game
      await setDoc(doc(db, 'users', authUser.uid, 'gameDrafts', 'current'), gameData)
      
      toast({
        title: 'Game Saved',
        description: 'Game progress has been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error saving game:', error)
      toast({
        title: 'Error',
        description: 'Failed to save game. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSavingGame(false)
    }
  }

  const endGame = async () => {
    if (!authUser) return
    setSavingGame(true)
    try {
      const homeScore = combineStatsAcrossQuarters('home').reduce((total, player) => total + player.stats.pts, 0)
      const opponentScore = combineStatsAcrossQuarters('opponent').reduce((total, player) => total + player.stats.pts, 0)
      const result = homeScore > opponentScore ? 'W' : 'L'
      const gameData = {
        homeTeam: gameState.homeTeam,
        opponent: gameState.opponent,
        quarters: gameState.quarters,
        teamScore: homeScore,
        opponentScore: opponentScore,
        result,
        playerStats: {
          home: combineStatsAcrossQuarters('home'),
          opponent: combineStatsAcrossQuarters('opponent')
        },
        date: new Date().toISOString(),
        duration: 'Completed',
        status: 'completed'
      }
      // Save completed game to games collection
      await addDoc(collection(db, 'users', authUser.uid, 'games'), gameData)
      // Remove draft if it exists
      try {
        await setDoc(doc(db, 'users', authUser.uid, 'gameDrafts', 'current'), null)
      } catch (error) {
        console.log('No draft to remove')
      }
      setGameEnded(true)
      toast({
        title: 'Game Ended',
        description: 'Game has been saved and completed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Error ending game:', error)
      toast({
        title: 'Error',
        description: 'Failed to end game. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSavingGame(false)
    }
  }

  const startGame = () => {
    if (!gameState.homeTeam.name.trim() || !gameState.opponent.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both team names',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (gameState.homeTeam.players.length === 0 || gameState.opponent.players.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one player to each team',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setGameState(prev => ({
      ...prev,
      startersSelected: true
    }))
  }

  const selectStarters = () => {
    if (gameState.homeTeam.starters.length !== 5 || gameState.opponent.starters.length !== 5) {
      toast({
        title: 'Error',
        description: 'Please select exactly 5 starters for each team',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setGameState(prev => ({
      ...prev,
      started: true,
      playersOnFloor: {
        home: [...prev.homeTeam.starters],
        opponent: [...prev.opponent.starters]
      },
      quarters: [
        {
          home: structuredClone(prev.homeTeam.players),
          opponent: structuredClone(prev.opponent.players)
        },
        {
          home: structuredClone(prev.homeTeam.players),
          opponent: structuredClone(prev.opponent.players)
        },
        {
          home: structuredClone(prev.homeTeam.players),
          opponent: structuredClone(prev.opponent.players)
        },
        {
          home: structuredClone(prev.homeTeam.players),
          opponent: structuredClone(prev.opponent.players)
        }
      ]
    }))
  }

  // Load existing players from team management when component mounts
  useEffect(() => {
    if (players.length > 0 && !gameState.started) {
      const homePlayers = players.map(player => ({
        name: player.name,
        jersey: player.jerseyNumber.toString(),
        stats: { 
          pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, 
          fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, foul: 0 
        }
      }))
      
      setGameState(prev => ({
        ...prev,
        homeTeam: {
          ...prev.homeTeam,
          players: homePlayers
        }
      }))
    }
  }, [players]) // Only depend on players, not gameState.started

  const switchQuarter = (quarterIndex) => {
    setGameState(prev => ({
      ...prev,
      currentQuarter: quarterIndex
    }))
  }

  const updateStat = (teamType, playerIndex, stat, increment = 1) => {
    setGameState(prev => ({
      ...prev,
      quarters: prev.quarters.map((quarter, qIndex) => 
        qIndex === prev.currentQuarter 
          ? {
              ...quarter,
              [teamType]: quarter[teamType].map((player, pIndex) => 
                pIndex === playerIndex 
                  ? { 
                      ...player, 
                      stats: { 
                        ...player.stats, 
                        [stat]: Math.max(0, player.stats[stat] + increment) 
                      } 
                    }
                  : player
              )
            }
          : quarter
      )
    }))
  }

  const combineStatsAcrossQuarters = (teamType) => {
    const combined = {};

    gameState.quarters.forEach(quarter => {
      quarter[teamType].forEach(player => {
        const key = player.jersey;
        if (!combined[key]) {
          combined[key] = {
            name: player.name,
            jersey: player.jersey,
            stats: { 
              pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, 
              fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0, foul: 0 
            }
          };
        }
        for (const stat in player.stats) {
          combined[key].stats[stat] += player.stats[stat];
        }
      });
    });

    return Object.values(combined);
  }

  // Helper to calculate total score so far for each team
  const getTotalScore = (teamType) => {
    return gameState.quarters.reduce((total, quarter) => {
      return (
        total + (quarter[teamType]?.reduce((sum, player) => sum + (player.stats?.pts || 0), 0) || 0)
      )
    }, 0)
  }

  // QuickStatCard component for quick stats with multi-click logic for points
  const QuickStatCard = ({ player, teamType, updateStat, top5Stats, playerStats, currentQuarterData }) => {
    // Find the correct index in the current quarter's player array
    const statPlayerIndex = currentQuarterData[teamType].findIndex(p => p.jersey === player.jersey);
    const clickCountRef = useRef(0)
    const clickTimerRef = useRef(null)
    const handlePointsClick = () => {
      clickCountRef.current += 1
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
      clickTimerRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          // Single click: add 1 point, 1 FT Made, 1 FT Attempted
          updateStat(teamType, statPlayerIndex, 'pts', 1);
          updateStat(teamType, statPlayerIndex, 'ftm', 1);
          updateStat(teamType, statPlayerIndex, 'fta', 1);
        } else if (clickCountRef.current === 2) {
          updateStat(teamType, statPlayerIndex, 'pts', 2)
          updateStat(teamType, statPlayerIndex, 'fga', 1)
          updateStat(teamType, statPlayerIndex, 'fgm', 1)
        } else if (clickCountRef.current >= 3) {
          updateStat(teamType, statPlayerIndex, 'pts', 3)
          updateStat(teamType, statPlayerIndex, 'fga', 1)
          updateStat(teamType, statPlayerIndex, 'fgm', 1)
          updateStat(teamType, statPlayerIndex, 'fg3a', 1)
          updateStat(teamType, statPlayerIndex, 'fg3m', 1)
        }
        clickCountRef.current = 0
      }, 300)
    }
    return (
      <Card p={4}>
        <VStack spacing={3} align="stretch">
          <Heading size="md">#{player.jersey} {player.name}</Heading>
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            {top5Stats.map((stat) => {
              let handlePlus;
              if (stat === 'pts') {
                handlePlus = handlePointsClick;
              } else if (stat === 'ftm') {
                handlePlus = () => {
                  updateStat(teamType, statPlayerIndex, 'ftm', 1);
                  updateStat(teamType, statPlayerIndex, 'fta', 1);
                  updateStat(teamType, statPlayerIndex, 'pts', 1);
                };
              } else {
                handlePlus = () => updateStat(teamType, statPlayerIndex, stat);
              }
              return (
                <Stat key={stat}>
                  <StatLabel>{stat.toUpperCase()}</StatLabel>
                  <HStack>
                    <IconButton
                      icon={<MinusIcon />}
                      size="sm"
                      onClick={() => updateStat(teamType, statPlayerIndex, stat, -1)}
                      aria-label={`Remove ${stat}`}
                      isDisabled={playerStats[stat] <= 0}
                    />
                    <StatNumber>{playerStats[stat]}</StatNumber>
                    <IconButton
                      icon={<AddIcon />}
                      size="sm"
                      onClick={handlePlus}
                      aria-label={`Add ${stat}`}
                    />
                  </HStack>
                </Stat>
              );
            })}
          </Grid>
          {/* New quick stat lines for missed FGA, 3PM, FT */}
          <HStack spacing={2} mt={2} justify="center">
            <Button
              size="xs"
              variant="outline"
              onClick={() => updateStat(teamType, statPlayerIndex, 'fga', 1)}
            >
              Missed FGA +
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                updateStat(teamType, statPlayerIndex, 'fg3a', 1);
                updateStat(teamType, statPlayerIndex, 'fga', 1);
              }}
            >
              3PA Miss +
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => updateStat(teamType, statPlayerIndex, 'fta', 1)}
            >
              FT Miss +
            </Button>
          </HStack>
        </VStack>
      </Card>
    )
  }

  const renderGameSetup = () => {
    return (
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Game Setup</Heading>
        
        {/* Home Team */}
        <Card>
          <CardHeader>
            <Heading size="md">Home Team</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Home Team Name</FormLabel>
                <Input 
                  value={gameState.homeTeam.name}
                  onChange={(e) => setGameState(prev => ({
                    ...prev,
                    homeTeam: { ...prev.homeTeam, name: e.target.value }
                  }))}
                  placeholder="Your Team Name" 
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  This is loaded from your team settings in Team Management
                </Text>
              </FormControl>

              <Box>
                <FormLabel>Home Team Players</FormLabel>
                {gameState.homeTeam.players.length > 0 ? (
                  <VStack spacing={2} align="stretch">
                    {gameState.homeTeam.players.map((player, idx) => (
                      <HStack key={idx} spacing={3}>
                        <Input
                          placeholder="Player Name"
                          value={player.name}
                          onChange={(e) => updateHomePlayer(idx, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Jersey #"
                          value={player.jersey}
                          onChange={(e) => updateHomePlayer(idx, 'jersey', e.target.value)}
                        />
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500">
                    No players found. Please add players in Team Management first.
                  </Text>
                )}
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Players are loaded from your team roster in Team Management
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Opponent Team */}
        <Card>
          <CardHeader>
            <Heading size="md">Opponent Team</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Opponent Team Name</FormLabel>
                <Input 
                  value={gameState.opponent.name}
                  onChange={(e) => setGameState(prev => ({
                    ...prev,
                    opponent: { ...prev.opponent, name: e.target.value }
                  }))}
                  placeholder="Opponent Team Name" 
                />
              </FormControl>

              <Box>
                <FormLabel>Opponent Players</FormLabel>
                <VStack spacing={3} align="stretch">
                  {gameState.opponent.players.map((player, idx) => (
                    <HStack key={idx} spacing={3}>
                      <Input
                        placeholder="Player Name"
                        value={player.name}
                        onChange={(e) => updateOpponentPlayer(idx, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Jersey #"
                        value={player.jersey}
                        onChange={(e) => updateOpponentPlayer(idx, 'jersey', e.target.value)}
                      />
                    </HStack>
                  ))}
                </VStack>
                <Button 
                  leftIcon={<AddIcon />} 
                  onClick={addOpponentPlayer}
                  mt={3}
                  colorScheme="red"
                >
                  Add Opponent Player
                </Button>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Button 
          onClick={startGame}
          colorScheme="green"
          size="lg"
          isDisabled={!gameState.homeTeam.name.trim() || !gameState.opponent.name.trim() || gameState.homeTeam.players.length === 0 || gameState.opponent.players.length === 0}
        >
          Start Game
        </Button>
      </VStack>
    )
  }

  const renderStartersSelection = () => {
    return (
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Select Starters</Heading>
        <Text color="gray.600">Select exactly 5 starters for each team with their positions</Text>
        
        {/* Home Team Starters */}
        <Card>
          <CardHeader>
            <Heading size="md">{gameState.homeTeam.name} - Starters ({gameState.homeTeam.starters.length}/5)</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Selected Starters */}
              {gameState.homeTeam.starters.length > 0 && (
                <Box>
                  <FormLabel>Selected Starters:</FormLabel>
                  <VStack spacing={2} align="stretch">
                    {gameState.homeTeam.starters.map((starter, idx) => (
                      <HStack key={idx} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <HStack>
                          <Badge colorScheme="blue">{starter.position}</Badge>
                          <Text fontWeight="bold">#{starter.jersey} {starter.name}</Text>
                        </HStack>
                        <IconButton
                          icon={<MinusIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => removeHomeStarter(idx)}
                          aria-label="Remove starter"
                        />
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Available Players */}
              <Box>
                <FormLabel>Available Players:</FormLabel>
                <VStack spacing={2} align="stretch">
                  {gameState.homeTeam.players
                    .filter(player => !gameState.homeTeam.starters.some(starter => starter.jersey === player.jersey))
                    .map((player, idx) => (
                      <HStack key={idx} justify="space-between" p={2} border="1px" borderColor="gray.200" borderRadius="md">
                        <Text>#{player.jersey} {player.name}</Text>
                        <HStack>
                          <Select 
                            placeholder="Position" 
                            size="sm" 
                            w="80px"
                            onChange={(e) => e.target.value && addHomeStarter(player, e.target.value)}
                          >
                            {positions.map(pos => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </Select>
                        </HStack>
                      </HStack>
                    ))}
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Opponent Team Starters */}
        <Card>
          <CardHeader>
            <Heading size="md">{gameState.opponent.name} - Starters ({gameState.opponent.starters.length}/5)</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Selected Starters */}
              {gameState.opponent.starters.length > 0 && (
                <Box>
                  <FormLabel>Selected Starters:</FormLabel>
                  <VStack spacing={2} align="stretch">
                    {gameState.opponent.starters.map((starter, idx) => (
                      <HStack key={idx} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <HStack>
                          <Badge colorScheme="red">{starter.position}</Badge>
                          <Text fontWeight="bold">#{starter.jersey} {starter.name}</Text>
                        </HStack>
                        <IconButton
                          icon={<MinusIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => removeOpponentStarter(idx)}
                          aria-label="Remove starter"
                        />
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Available Players */}
              <Box>
                <FormLabel>Available Players:</FormLabel>
                <VStack spacing={2} align="stretch">
                  {gameState.opponent.players
                    .filter(player => !gameState.opponent.starters.some(starter => starter.jersey === player.jersey))
                    .map((player, idx) => (
                      <HStack key={idx} justify="space-between" p={2} border="1px" borderColor="gray.200" borderRadius="md">
                        <Text>#{player.jersey} {player.name}</Text>
                        <HStack>
                          <Select 
                            placeholder="Position" 
                            size="sm" 
                            w="80px"
                            onChange={(e) => e.target.value && addOpponentStarter(player, e.target.value)}
                          >
                            {positions.map(pos => (
                              <option key={pos} value={pos}>{pos}</option>
                            ))}
                          </Select>
                        </HStack>
                      </HStack>
                    ))}
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Button 
          onClick={selectStarters}
          colorScheme="green"
          size="lg"
          isDisabled={gameState.homeTeam.starters.length !== 5 || gameState.opponent.starters.length !== 5}
        >
          Confirm Starters & Begin Game
        </Button>
      </VStack>
    )
  }

  // PlayerStatRow component for detailed stats
  const PlayerStatRow = ({ player, teamType, updateStat, currentQuarterData }) => {
    const stats = player.stats
    const clickCountRef = useRef(0)
    const clickTimerRef = useRef(null)
    // Always find the correct index in the current quarter's player array
    const statPlayerIndex = currentQuarterData[teamType].findIndex(p => p.jersey === player.jersey);
    const handlePointsPlusClick = () => {
      clickCountRef.current += 1
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
      clickTimerRef.current = setTimeout(() => {
        if (clickCountRef.current === 1) {
          // Single click: add 1 point, 1 FT Made, 1 FT Attempted
          updateStat(teamType, statPlayerIndex, 'pts', 1);
          updateStat(teamType, statPlayerIndex, 'ftm', 1);
          updateStat(teamType, statPlayerIndex, 'fta', 1);
        } else if (clickCountRef.current === 2) {
          updateStat(teamType, statPlayerIndex, 'pts', 2)
          updateStat(teamType, statPlayerIndex, 'fga', 1)
          updateStat(teamType, statPlayerIndex, 'fgm', 1)
        } else if (clickCountRef.current >= 3) {
          updateStat(teamType, statPlayerIndex, 'pts', 3)
          updateStat(teamType, statPlayerIndex, 'fga', 1)
          updateStat(teamType, statPlayerIndex, 'fgm', 1)
          updateStat(teamType, statPlayerIndex, 'fg3a', 1)
          updateStat(teamType, statPlayerIndex, 'fg3m', 1)
        }
        clickCountRef.current = 0
      }, 300)
    }
    return (
      <Card key={player.jersey} p={4}>
        <VStack spacing={3} align="stretch">
          <Heading size="md">#{player.jersey} {player.name}</Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={3}>
            {/* Basic Stats */}
            <Stat>
              <StatLabel>Points</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'pts', -1)}
                  aria-label="Remove point"
                  isDisabled={stats.pts <= 0}
                />
                <StatNumber>{stats.pts}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={handlePointsPlusClick}
                  aria-label="Add point"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>Rebounds</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'reb', -1)}
                  aria-label="Remove rebound"
                  isDisabled={stats.reb <= 0}
                />
                <StatNumber>{stats.reb}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'reb')}
                  aria-label="Add rebound"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>Assists</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'ast', -1)}
                  aria-label="Remove assist"
                  isDisabled={stats.ast <= 0}
                />
                <StatNumber>{stats.ast}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'ast')}
                  aria-label="Add assist"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>Steals</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'stl', -1)}
                  aria-label="Remove steal"
                  isDisabled={stats.stl <= 0}
                />
                <StatNumber>{stats.stl}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'stl')}
                  aria-label="Add steal"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>Blocks</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'blk', -1)}
                  aria-label="Remove block"
                  isDisabled={stats.blk <= 0}
                />
                <StatNumber>{stats.blk}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'blk')}
                  aria-label="Add block"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>Turnovers</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'to', -1)}
                  aria-label="Remove turnover"
                  isDisabled={stats.to <= 0}
                />
                <StatNumber>{stats.to}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'to')}
                  aria-label="Add turnover"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>FG Made</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'fgm', -1)}
                  aria-label="Remove field goal made"
                  isDisabled={stats.fgm <= 0}
                />
                <StatNumber>{stats.fgm}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => {
                    updateStat(teamType, statPlayerIndex, 'fgm', 1);
                    updateStat(teamType, statPlayerIndex, 'fga', 1);
                    updateStat(teamType, statPlayerIndex, 'pts', 2);
                  }}
                  aria-label="Add field goal made"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>FG Attempted</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'fga', -1)}
                  aria-label="Remove field goal attempted"
                  isDisabled={stats.fga <= 0}
                />
                <StatNumber>{stats.fga}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'fga')}
                  aria-label="Add field goal attempted"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>3PT Made</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'fg3m', -1)}
                  aria-label="Remove three pointer made"
                  isDisabled={stats.fg3m <= 0}
                />
                <StatNumber>{stats.fg3m}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => {
                    updateStat(teamType, statPlayerIndex, 'fg3m', 1);
                    updateStat(teamType, statPlayerIndex, 'fg3a', 1);
                    updateStat(teamType, statPlayerIndex, 'fgm', 1);
                    updateStat(teamType, statPlayerIndex, 'fga', 1);
                    updateStat(teamType, statPlayerIndex, 'pts', 3);
                  }}
                  aria-label="Add three pointer made"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>3PT Attempted</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'fg3a', -1)}
                  aria-label="Remove three pointer attempted"
                  isDisabled={stats.fg3a <= 0}
                />
                <StatNumber>{stats.fg3a}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'fg3a')}
                  aria-label="Add three pointer attempted"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>FT Made</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'ftm', -1)}
                  aria-label="Remove free throw made"
                  isDisabled={stats.ftm <= 0}
                />
                <StatNumber>{stats.ftm}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => {
                    updateStat(teamType, statPlayerIndex, 'ftm', 1);
                    updateStat(teamType, statPlayerIndex, 'fta', 1);
                    updateStat(teamType, statPlayerIndex, 'pts', 1);
                  }}
                  aria-label="Add free throw made"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>FT Attempted</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'fta', -1)}
                  aria-label="Remove free throw attempted"
                  isDisabled={stats.fta <= 0}
                />
                <StatNumber>{stats.fta}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'fta')}
                  aria-label="Add free throw attempted"
                />
              </HStack>
            </Stat>
            <Stat>
              <StatLabel>Fouls</StatLabel>
              <HStack>
                <IconButton
                  icon={<MinusIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'foul', -1)}
                  aria-label="Remove foul"
                  isDisabled={stats.foul <= 0}
                />
                <StatNumber>{stats.foul}</StatNumber>
                <IconButton
                  icon={<AddIcon />}
                  size="sm"
                  onClick={() => updateStat(teamType, statPlayerIndex, 'foul')}
                  aria-label="Add foul"
                />
              </HStack>
            </Stat>
          </Grid>
        </VStack>
      </Card>
    )
  }

  const renderPlayerStats = (player, playerIndex, teamType, currentQuarterData) => {
    return <PlayerStatRow player={player} teamType={teamType} updateStat={updateStat} currentQuarterData={currentQuarterData} />
  }

  const renderPlayersOnFloor = () => {
    const top5Stats = ['pts', 'reb', 'ast', 'stl', 'blk', 'foul']
    
    return (
      <VStack spacing={6} align="stretch">
        <Heading size="lg">
          {gameState.homeTeam.name} vs {gameState.opponent.name}
        </Heading>
        
        <HStack spacing={2}>
          {gameState.quarters.map((_, i) => (
            <Button
              key={i}
              onClick={() => switchQuarter(i)}
              colorScheme={gameState.currentQuarter === i ? 'blue' : 'gray'}
              size="sm"
            >
              Q{i+1}
            </Button>
          ))}
        </HStack>

        <Heading size="md">Quarter {gameState.currentQuarter + 1} - Players on Floor</Heading>
        
        <Tabs>
          <TabList>
            <Tab>{gameState.homeTeam.name} ({gameState.playersOnFloor.home.length}/5)</Tab>
            <Tab>{gameState.opponent.name} ({gameState.playersOnFloor.opponent.length}/5)</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {/* Quick Stats for Players on Floor */}
                {gameState.playersOnFloor.home.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={3}>Quick Stats (Top 5 Categories):</Heading>
                    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                      {gameState.playersOnFloor.home.map((player, playerIndex) => {
                        const currentQuarterData = gameState.quarters[gameState.currentQuarter]
                        return (
                          <QuickStatCard
                            key={playerIndex}
                            player={player}
                            teamType="home"
                            updateStat={updateStat}
                            top5Stats={top5Stats}
                            playerStats={currentQuarterData.home.find(p => p.jersey === player.jersey)?.stats || player.stats}
                            currentQuarterData={currentQuarterData}
                          />
                        )
                      })}
                    </Grid>
                  </Box>
                )}
                {/* Players on Floor */}
                <Box>
                  <Heading size="sm" mb={3}>Players on Floor:</Heading>
                  <VStack spacing={2} align="stretch">
                    {gameState.playersOnFloor.home.map((player, idx) => (
                      <HStack key={idx} justify="space-between" p={2} bg="blue.50" borderRadius="md">
                        <HStack>
                          <Badge colorScheme="blue">{player.position}</Badge>
                          <Text fontWeight="bold">#{player.jersey} {player.name}</Text>
                        </HStack>
                        <IconButton
                          icon={<MinusIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => removePlayerFromFloor('home', idx)}
                          aria-label="Remove from floor"
                        />
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                {/* Available Players */}
                <Box>
                  <Heading size="sm" mb={3}>Available Players:</Heading>
                  <VStack spacing={2} align="stretch">
                    {gameState.homeTeam.players
                      .filter(player => !gameState.playersOnFloor.home.some(floorPlayer => floorPlayer.jersey === player.jersey))
                      .map((player, idx) => (
                        <HStack key={idx} justify="space-between" p={2} border="1px" borderColor="gray.200" borderRadius="md">
                          <Text>#{player.jersey} {player.name}</Text>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => addPlayerToFloor('home', player)}
                          >
                            Add to Floor
                          </Button>
                        </HStack>
                      ))}
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {/* Quick Stats for Players on Floor */}
                {gameState.playersOnFloor.opponent.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={3}>Quick Stats (Top 5 Categories):</Heading>
                    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                      {gameState.playersOnFloor.opponent.map((player, playerIndex) => {
                        const currentQuarterData = gameState.quarters[gameState.currentQuarter]
                        return (
                          <QuickStatCard
                            key={playerIndex}
                            player={player}
                            teamType="opponent"
                            updateStat={updateStat}
                            top5Stats={top5Stats}
                            playerStats={currentQuarterData.opponent.find(p => p.jersey === player.jersey)?.stats || player.stats}
                            currentQuarterData={currentQuarterData}
                          />
                        )
                      })}
                    </Grid>
                  </Box>
                )}
                {/* Players on Floor */}
                <Box>
                  <Heading size="sm" mb={3}>Players on Floor:</Heading>
                  <VStack spacing={2} align="stretch">
                    {gameState.playersOnFloor.opponent.map((player, idx) => (
                      <HStack key={idx} justify="space-between" p={2} bg="red.50" borderRadius="md">
                        <HStack>
                          <Badge colorScheme="red">{player.position}</Badge>
                          <Text fontWeight="bold">#{player.jersey} {player.name}</Text>
                        </HStack>
                        <IconButton
                          icon={<MinusIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => removePlayerFromFloor('opponent', idx)}
                          aria-label="Remove from floor"
                        />
                      </HStack>
                    ))}
                  </VStack>
                </Box>
                {/* Available Players */}
                <Box>
                  <Heading size="sm" mb={3}>Available Players:</Heading>
                  <VStack spacing={2} align="stretch">
                    {gameState.opponent.players
                      .filter(player => !gameState.playersOnFloor.opponent.some(floorPlayer => floorPlayer.jersey === player.jersey))
                      .map((player, idx) => (
                        <HStack key={idx} justify="space-between" p={2} border="1px" borderColor="gray.200" borderRadius="md">
                          <Text>#{player.jersey} {player.name}</Text>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => addPlayerToFloor('opponent', player)}
                          >
                            Add to Floor
                          </Button>
                        </HStack>
                      ))}
                  </VStack>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    )
  }

  const [gameMode, setGameMode] = useState('floor') // 'floor' or 'detailed'
  const [gameEnded, setGameEnded] = useState(false)
  const [savingGame, setSavingGame] = useState(false)
  const { isOpen: isEndGameOpen, onOpen: onEndGameOpen, onClose: onEndGameClose } = useDisclosure()
  const [expandedPlayers, setExpandedPlayers] = useState({ home: {}, opponent: {} });

  const toggleExpandPlayer = (teamType, jersey) => {
    setExpandedPlayers(prev => ({
      ...prev,
      [teamType]: {
        ...prev[teamType],
        [jersey]: !prev[teamType]?.[jersey]
      }
    }));
  };

  const renderGameTracker = () => {
    const quarterTabs = gameState.quarters.map((_, i) => (
      <Button
        key={i}
        onClick={() => switchQuarter(i)}
        colorScheme={gameState.currentQuarter === i ? 'blue' : 'gray'}
        size="sm"
      >
        Q{i+1}
      </Button>
    ))

    const currentQuarterData = gameState.quarters[gameState.currentQuarter]

    // Helper to sort players: on-floor first
    const sortPlayersOnFloorFirst = (players, onFloorList) => {
      return [
        ...players.filter(player => onFloorList.some(floorPlayer => floorPlayer.jersey === player.jersey)),
        ...players.filter(player => !onFloorList.some(floorPlayer => floorPlayer.jersey === player.jersey)),
      ];
    };

    return (
      <VStack spacing={6} align="stretch">
        <Heading size="lg">
          {gameState.homeTeam.name} vs {gameState.opponent.name}
        </Heading>
        <HStack spacing={2}>{quarterTabs}</HStack>
        <Heading size="md">Quarter {gameState.currentQuarter + 1}</Heading>
        <Tabs>
          <TabList>
            <Tab>{gameState.homeTeam.name}</Tab>
            <Tab>{gameState.opponent.name}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid templateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={4}>
                {sortPlayersOnFloorFirst(currentQuarterData.home, gameState.playersOnFloor.home).map((player, i) => {
                  const onFloor = gameState.playersOnFloor.home.some(floorPlayer => floorPlayer.jersey === player.jersey);
                  const isExpanded = expandedPlayers.home[player.jersey];
                  if (onFloor || isExpanded) {
                    return (
                      <Box key={player.jersey}>
                        {renderPlayerStats(player, i, 'home', currentQuarterData)}
                        {!onFloor && (
                          <Button size="sm" mt={2} onClick={() => toggleExpandPlayer('home', player.jersey)}>
                            Collapse
                          </Button>
                        )}
                      </Box>
                    );
                  } else {
                    return (
                      <Card key={player.jersey} p={4}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold">#{player.jersey} {player.name}</Text>
                          <Button size="sm" onClick={() => toggleExpandPlayer('home', player.jersey)}>
                            Expand
                          </Button>
                        </HStack>
                      </Card>
                    );
                  }
                })}
              </Grid>
            </TabPanel>
            <TabPanel>
              <Grid templateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={4}>
                {sortPlayersOnFloorFirst(currentQuarterData.opponent, gameState.playersOnFloor.opponent).map((player, i) => {
                  const onFloor = gameState.playersOnFloor.opponent.some(floorPlayer => floorPlayer.jersey === player.jersey);
                  const isExpanded = expandedPlayers.opponent[player.jersey];
                  if (onFloor || isExpanded) {
                    return (
                      <Box key={player.jersey}>
                        {renderPlayerStats(player, i, 'opponent', currentQuarterData)}
                        {!onFloor && (
                          <Button size="sm" mt={2} onClick={() => toggleExpandPlayer('opponent', player.jersey)}>
                            Collapse
                          </Button>
                        )}
                      </Box>
                    );
                  } else {
                    return (
                      <Card key={player.jersey} p={4}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold">#{player.jersey} {player.name}</Text>
                          <Button size="sm" onClick={() => toggleExpandPlayer('opponent', player.jersey)}>
                            Expand
                          </Button>
                        </HStack>
                      </Card>
                    );
                  }
                })}
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Divider />
        {/* Full Game Stats */}
        <Box>
          <Heading size="md" mb={4}>Full Game Stats</Heading>
          <Tabs>
            <TabList>
              <Tab>{gameState.homeTeam.name}</Tab>
              <Tab>{gameState.opponent.name}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={2} align="stretch">
                  {combineStatsAcrossQuarters('home').map((player, i) => (
                    <Card key={i} p={3}>
                      <Text fontWeight="bold">
                        #{player.jersey} {player.name} -
                        Pts: {player.stats.pts},
                        Reb: {player.stats.reb},
                        Ast: {player.stats.ast},
                        Stl: {player.stats.stl},
                        Blk: {player.stats.blk},
                        TO: {player.stats.to},
                        FG: {player.stats.fgm}/{player.stats.fga},
                        3PT: {player.stats.fg3m}/{player.stats.fg3a},
                        FT: {player.stats.ftm}/{player.stats.fta},
                        Fouls: {player.stats.foul}
                      </Text>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={2} align="stretch">
                  {combineStatsAcrossQuarters('opponent').map((player, i) => (
                    <Card key={i} p={3}>
                      <Text fontWeight="bold">
                        #{player.jersey} {player.name} -
                        Pts: {player.stats.pts},
                        Reb: {player.stats.reb},
                        Ast: {player.stats.ast},
                        Stl: {player.stats.stl},
                        Blk: {player.stats.blk},
                        TO: {player.stats.to},
                        FG: {player.stats.fgm}/{player.stats.fga},
                        3PT: {player.stats.fg3m}/{player.stats.fg3a},
                        FT: {player.stats.ftm}/{player.stats.fta},
                        Fouls: {player.stats.foul}
                      </Text>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    );
  };

  return (
    <Container maxW="container.xl" py={10}>
      {/* Live Score Bar */}
      {gameState.started && !gameEnded && (
        <HStack justify="center" align="center" bg="blue.50" p={4} mb={6} borderRadius="md">
          <Heading size="md" color="blue.700">{gameState.homeTeam.name}</Heading>
          <Text fontSize="2xl" fontWeight="bold" color="blue.900">{getTotalScore('home')}</Text>
          <Text fontSize="2xl" fontWeight="bold" color="blue.700">-</Text>
          <Text fontSize="2xl" fontWeight="bold" color="red.900">{getTotalScore('opponent')}</Text>
          <Heading size="md" color="red.700">{gameState.opponent.name}</Heading>
        </HStack>
      )}
      {resumed && (
        <Box bg="yellow.100" p={4} mb={4} borderRadius="md" textAlign="center">
          <Text fontWeight="bold" color="yellow.800">You are resuming a saved game. No new draft will be created until you save or end the game.</Text>
        </Box>
      )}
      {!gameState.started ? (
        gameState.startersSelected ? renderStartersSelection() : renderGameSetup()
      ) : gameEnded ? (
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" p={8} bg="green.50" borderRadius="lg">
            <Heading size="lg" color="green.600" mb={4}>Game Completed!</Heading>
            <Text fontSize="lg" mb={4}>
              {gameState.homeTeam.name} vs {gameState.opponent.name}
            </Text>
            <Text fontSize="md" color="gray.600">
              Final Score: {combineStatsAcrossQuarters('home').reduce((total, player) => total + player.stats.pts, 0)} - {combineStatsAcrossQuarters('opponent').reduce((total, player) => total + player.stats.pts, 0)}
            </Text>
            <Button 
              onClick={() => window.location.reload()} 
              colorScheme="blue" 
              size="lg" 
              mt={4}
            >
              Start New Game
            </Button>
          </Box>
        </VStack>
      ) : (
        <VStack spacing={6} align="stretch">
          {/* Game Controls */}
          <HStack justify="space-between" align="center">
            <Heading size="lg">
              {gameState.homeTeam.name} vs {gameState.opponent.name}
            </Heading>
            <HStack spacing={3}>
              <Button
                onClick={saveGame}
                colorScheme="yellow"
                size="md"
                isLoading={savingGame}
                loadingText="Saving..."
              >
                Save Game
              </Button>
              <Button
                onClick={onEndGameOpen}
                colorScheme="red"
                size="md"
                isLoading={savingGame}
                loadingText="Ending..."
              >
                End Game
              </Button>
            </HStack>
          </HStack>

          {/* Mode Toggle */}
          <HStack justify="center" spacing={4}>
            <Button
              onClick={() => setGameMode('floor')}
              colorScheme={gameMode === 'floor' ? 'blue' : 'gray'}
              size="lg"
            >
              Players on Floor
            </Button>
            <Button
              onClick={() => setGameMode('detailed')}
              colorScheme={gameMode === 'detailed' ? 'blue' : 'gray'}
              size="lg"
            >
              Detailed Stats
            </Button>
          </HStack>

          {gameMode === 'floor' ? renderPlayersOnFloor() : renderGameTracker()}
        </VStack>
      )}

      {/* End Game Confirmation Dialog */}
      <AlertDialog isOpen={isEndGameOpen} onClose={onEndGameClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              End Game
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to end this game? This action cannot be undone and will save the game as completed.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onEndGameClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={() => {
                  onEndGameClose()
                  endGame()
                }} 
                ml={3}
                isLoading={savingGame}
              >
                End Game
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}

export default GameTracker 