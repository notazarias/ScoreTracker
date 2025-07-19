import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import {
  Box, Button, Container, Heading, Text, VStack, HStack, Card, CardBody, Spinner, Divider, Tabs, TabList, TabPanels, Tab, TabPanel, Grid
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

function combineStatsAcrossQuarters(quarters, teamType) {
  const combined = {};
  quarters.forEach(quarter => {
    (quarter[teamType] || []).forEach(player => {
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

const statLabels = {
  pts: 'Pts', reb: 'Reb', ast: 'Ast', stl: 'Stl', blk: 'Blk', to: 'TO',
  fgm: 'FGM', fga: 'FGA', fg3m: '3PM', fg3a: '3PA', ftm: 'FTM', fta: 'FTA', foul: 'Fouls'
};

const GameDetails = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('full');

  useEffect(() => {
    const fetchGame = async () => {
      if (!user) return;
      setLoading(true);
      const docRef = doc(db, 'users', user.uid, 'games', gameId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGame(docSnap.data());
      }
      setLoading(false);
    };
    fetchGame();
  }, [gameId, user]);

  if (!user) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Please log in to view game details.</Text>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }
  if (!game) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Game not found.</Text>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Container>
    );
  }

  const quarters = game.quarters || [];
  const homeTeam = game.homeTeam?.name || 'Home';
  const opponentTeam = game.opponent?.name || 'Opponent';

  // Calculate points by quarter for each team
  const pointsByQuarter = (teamType) =>
    quarters.map(q => (q[teamType] || []).reduce((sum, p) => sum + (p.stats.pts || 0), 0));

  const homePoints = pointsByQuarter('home');
  const opponentPoints = pointsByQuarter('opponent');

  // Prepare stats for each tab
  const fullHomeStats = combineStatsAcrossQuarters(quarters, 'home');
  const fullOpponentStats = combineStatsAcrossQuarters(quarters, 'opponent');

  const quarterTabs = quarters.map((_, i) => `Q${i + 1}`);

  let homeStats, opponentStats;
  if (selectedTab === 'full') {
    homeStats = fullHomeStats;
    opponentStats = fullOpponentStats;
  } else {
    const qIdx = parseInt(selectedTab.replace('Q', '')) - 1;
    homeStats = quarters[qIdx]?.home || [];
    opponentStats = quarters[qIdx]?.opponent || [];
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Game Details</Heading>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </HStack>
        {/* Points by Quarter Table */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={2}>
              <Heading size="sm">Points by Quarter</Heading>
              <Grid templateColumns={`120px repeat(${quarters.length}, 1fr) 1fr`} gap={2} alignItems="center">
                <Box fontWeight="bold">Team</Box>
                {quarters.map((_, i) => (
                  <Box key={i} fontWeight="bold">Q{i+1}</Box>
                ))}
                <Box fontWeight="bold">Total</Box>
              </Grid>
              <Grid templateColumns={`120px repeat(${quarters.length}, 1fr) 1fr`} gap={2} alignItems="center">
                <Box>{homeTeam}</Box>
                {homePoints.map((pts, i) => (
                  <Box key={i}>{pts}</Box>
                ))}
                <Box fontWeight="bold">{homePoints.reduce((a, b) => a + b, 0)}</Box>
              </Grid>
              <Grid templateColumns={`120px repeat(${quarters.length}, 1fr) 1fr`} gap={2} alignItems="center">
                <Box>{opponentTeam}</Box>
                {opponentPoints.map((pts, i) => (
                  <Box key={i}>{pts}</Box>
                ))}
                <Box fontWeight="bold">{opponentPoints.reduce((a, b) => a + b, 0)}</Box>
              </Grid>
            </VStack>
          </CardBody>
        </Card>
        <Divider />
        <Tabs onChange={idx => setSelectedTab(idx === 0 ? 'full' : quarterTabs[idx - 1])}>
          <TabList>
            <Tab>Full Game</Tab>
            {quarterTabs.map(q => <Tab key={q}>{q}</Tab>)}
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid templateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={4}>
                <Box>
                  <Heading size="md" mb={2}>{homeTeam}</Heading>
                  {homeStats.map((player, i) => (
                    <Card key={i} p={3} mb={2}>
                      <Text fontWeight="bold">#{player.jersey} {player.name}</Text>
                      <HStack wrap="wrap" spacing={3} mt={2}>
                        {Object.keys(statLabels).map(stat => (
                          <Box key={stat}><b>{statLabels[stat]}:</b> {player.stats[stat]}</Box>
                        ))}
                      </HStack>
                    </Card>
                  ))}
                </Box>
                <Box>
                  <Heading size="md" mb={2}>{opponentTeam}</Heading>
                  {opponentStats.map((player, i) => (
                    <Card key={i} p={3} mb={2}>
                      <Text fontWeight="bold">#{player.jersey} {player.name}</Text>
                      <HStack wrap="wrap" spacing={3} mt={2}>
                        {Object.keys(statLabels).map(stat => (
                          <Box key={stat}><b>{statLabels[stat]}:</b> {player.stats[stat]}</Box>
                        ))}
                      </HStack>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </TabPanel>
            {quarters.map((_, qIdx) => (
              <TabPanel key={qIdx}>
                <Grid templateColumns="repeat(auto-fit, minmax(350px, 1fr))" gap={4}>
                  <Box>
                    <Heading size="md" mb={2}>{homeTeam}</Heading>
                    {(quarters[qIdx]?.home || []).map((player, i) => (
                      <Card key={i} p={3} mb={2}>
                        <Text fontWeight="bold">#{player.jersey} {player.name}</Text>
                        <HStack wrap="wrap" spacing={3} mt={2}>
                          {Object.keys(statLabels).map(stat => (
                            <Box key={stat}><b>{statLabels[stat]}:</b> {player.stats[stat]}</Box>
                          ))}
                        </HStack>
                      </Card>
                    ))}
                  </Box>
                  <Box>
                    <Heading size="md" mb={2}>{opponentTeam}</Heading>
                    {(quarters[qIdx]?.opponent || []).map((player, i) => (
                      <Card key={i} p={3} mb={2}>
                        <Text fontWeight="bold">#{player.jersey} {player.name}</Text>
                        <HStack wrap="wrap" spacing={3} mt={2}>
                          {Object.keys(statLabels).map(stat => (
                            <Box key={stat}><b>{statLabels[stat]}:</b> {player.stats[stat]}</Box>
                          ))}
                        </HStack>
                      </Card>
                    ))}
                  </Box>
                </Grid>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default GameDetails; 