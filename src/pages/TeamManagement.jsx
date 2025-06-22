import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  VStack,
  Text,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Icon,
  Select,
  IconButton,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'

function AddPlayerForm({ onAddPlayer }) {
  const [name, setName] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [position, setPosition] = useState('')
  const [height, setHeight] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && jerseyNumber.trim()) {
      onAddPlayer({
        name: name.trim(),
        jerseyNumber: parseInt(jerseyNumber),
        position,
        height,
        stats: {}
      })
      setName('')
      setJerseyNumber('')
      setPosition('')
      setHeight('')
    }
  }

  return (
    <Card mb={6}>
      <CardHeader>
        <Flex align="center" gap={2}>
          <Icon as={AddIcon} />
          <Heading size="md">Add Player</Heading>
        </Flex>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <FormControl isRequired>
              <FormLabel>Player Name</FormLabel>
              <Input
                type="text"
                placeholder="Enter player name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Jersey #</FormLabel>
              <Input
                type="number"
                placeholder="23"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                min="0"
                max="99"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Position</FormLabel>
              <Select
                placeholder="Select position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Height</FormLabel>
              <Input
                type="text"
                placeholder="6'2"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </FormControl>
          </Grid>
          <Button
            type="submit"
            colorScheme="blue"
            mt={4}
            width="full"
          >
            Add Player
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

function EditPlayerModal({ isOpen, onClose, player, onSave }) {
  const [editedPlayer, setEditedPlayer] = useState(player)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(editedPlayer)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit Player</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Player Name</FormLabel>
                <Input
                  value={editedPlayer.name}
                  onChange={(e) => setEditedPlayer({ ...editedPlayer, name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Jersey #</FormLabel>
                <Input
                  type="number"
                  value={editedPlayer.jerseyNumber}
                  onChange={(e) => setEditedPlayer({ ...editedPlayer, jerseyNumber: parseInt(e.target.value) })}
                  min="0"
                  max="99"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Position</FormLabel>
                <Select
                  value={editedPlayer.position}
                  onChange={(e) => setEditedPlayer({ ...editedPlayer, position: e.target.value })}
                >
                  <option value="">Select position</option>
                  <option value="PG">Point Guard</option>
                  <option value="SG">Shooting Guard</option>
                  <option value="SF">Small Forward</option>
                  <option value="PF">Power Forward</option>
                  <option value="C">Center</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Height</FormLabel>
                <Input
                  value={editedPlayer.height}
                  onChange={(e) => setEditedPlayer({ ...editedPlayer, height: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Free Throws Made</FormLabel>
                <NumberInput
                  min={0}
                  value={editedPlayer.stats.freeThrowsMade}
                  onChange={(value) => setEditedPlayer({
                    ...editedPlayer,
                    stats: {
                      ...editedPlayer.stats,
                      freeThrowsMade: Number(value),
                      freeThrowPercentage: editedPlayer.stats.freeThrowsAttempted > 0
                        ? ((Number(value) / editedPlayer.stats.freeThrowsAttempted) * 100).toFixed(1)
                        : 0
                    }
                  })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Free Throws Attempted</FormLabel>
                <NumberInput
                  min={0}
                  value={editedPlayer.stats.freeThrowsAttempted}
                  onChange={(value) => setEditedPlayer({
                    ...editedPlayer,
                    stats: {
                      ...editedPlayer.stats,
                      freeThrowsAttempted: Number(value),
                      freeThrowPercentage: Number(value) > 0
                        ? ((editedPlayer.stats.freeThrowsMade / Number(value)) * 100).toFixed(1)
                        : 0
                    }
                  })}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

function PlayerCard({ player, onRemove, onEdit }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        bg="gray.50"
        position="relative"
      >
        <HStack position="absolute" top={2} right={2} spacing={2}>
          <IconButton
            icon={<EditIcon />}
            aria-label="Edit player"
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={onOpen}
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label="Remove player"
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={() => onRemove(player.id)}
          />
        </HStack>
        <VStack align="start" spacing={2}>
          <HStack>
            <Text fontWeight="bold" fontSize="lg">#{player.jerseyNumber}</Text>
            <Text fontSize="lg">{player.name}</Text>
          </HStack>
          {player.position && (
            <Text color="gray.600">Position: {player.position}</Text>
          )}
          {player.height && (
            <Text color="gray.600">Height: {player.height}</Text>
          )}
        </VStack>
      </Box>
      <EditPlayerModal
        isOpen={isOpen}
        onClose={onClose}
        player={player}
        onSave={onEdit}
      />
    </>
  )
}

function TeamManagement({ user }) {
  const [players, setPlayers] = useState([])
  const toast = useToast()

  const handleAddPlayer = (playerData) => {
    setPlayers([...players, { ...playerData, id: Date.now() }])
    toast({
      title: 'Player Added',
      description: `${playerData.name} has been added to the team.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleRemovePlayer = (playerId) => {
    setPlayers(players.filter(player => player.id !== playerId))
    toast({
      title: 'Player Removed',
      description: 'Player has been removed from the team.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleEditPlayer = (editedPlayer) => {
    setPlayers(players.map(player => 
      player.id === editedPlayer.id ? editedPlayer : player
    ))
    toast({
      title: 'Player Updated',
      description: `${editedPlayer.name}'s information has been updated.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading>Team Management</Heading>
        
        <AddPlayerForm onAddPlayer={handleAddPlayer} />

        <Card>
          <CardHeader>
            <Heading size="md">Current Roster</Heading>
          </CardHeader>
          <CardBody>
            {players.length === 0 ? (
              <Text color="gray.500">No players added yet.</Text>
            ) : (
              <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onRemove={handleRemovePlayer}
                    onEdit={handleEditPlayer}
                  />
                ))}
              </Grid>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default TeamManagement 