// utils/matchmaking.js

import { ref, push, set, onValue, query, orderByChild, startAt, update, remove } from 'firebase/database';
import { auth, database } from '../firebase/firebaseConfig';
import { Alert } from 'react-native';

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Function to add player to onlinePlayers and attempt matchmaking
export const addPlayerAndMatchmake = (marker, latitude, longitude, navigation) => {
  const user = auth.currentUser;
  if (!user) {
    Alert.alert('Error', 'User not authenticated.');
    return;
  }
  
  const userId = user.uid;
  const playersRef = ref(database, 'onlinePlayers');
  const newPlayerRef = push(playersRef); // Generates a unique key

  const playerData = {
    marker,
    latitude,
    longitude,
    status: 'waiting',
    timestamp: Date.now(),
  };

  set(newPlayerRef, playerData)
    .then(() => {
      console.log('Player added to onlinePlayers:', newPlayerRef.key);
      // Set up onDisconnect to remove the player if they disconnect
      const onlinePlayerRef = ref(database, `onlinePlayers/${userId}`);
      onlinePlayerRef.onDisconnect().remove()
        .then(() => {
          console.log('onDisconnect set for player:', userId);
        })
        .catch((error) => {
          console.error('Error setting onDisconnect:', error);
        });
      
      // Start matchmaking
      matchmake(userId, marker, latitude, longitude, newPlayerRef.key, navigation);
    })
    .catch((error) => {
      console.error('Error adding player to onlinePlayers:', error);
      Alert.alert('Error', 'Failed to add player for matchmaking.');
    });
};

// Function to perform matchmaking
const matchmake = (currentPlayerId, marker, latitude, longitude, playerKey, navigation) => {
  const playersRef = ref(database, 'onlinePlayers');
  const matchmakingQuery = query(
    playersRef,
    orderByChild('timestamp'),
    startAt(Date.now() - 30000) // Players active in the last 30 seconds
  );

  const unsubscribe = onValue(matchmakingQuery, (snapshot) => {
    const players = snapshot.val();
    console.log(`Found ${players ? Object.keys(players).length : 0} players in matchmaking.`);
    if (players) {
      for (let id in players) {
        if (id !== currentPlayerId && players[id].status === 'waiting') {
          const distance = calculateDistance(latitude, longitude, players[id].latitude, players[id].longitude);
          console.log(`Evaluating Player ID: ${id} with distance: ${distance} km`);
          
          if (distance <= 5) { // Within 5 km
            // Update both players' status to 'active'
            const updates = {};
            updates[`onlinePlayers/${id}/status`] = 'active';
            updates[`onlinePlayers/${currentPlayerId}/status`] = 'active';
            
            update(ref(database), updates)
              .then(() => {
                console.log('Matched players:', id, currentPlayerId);
                
                // Create a new game session
                const gamesRef = ref(database, 'games');
                const newGameRef = push(gamesRef);
                
                const gameData = {
                  players: {
                    [currentPlayerId]: { marker },
                    [id]: { marker: players[id].marker },
                  },
                  board: Array(9).fill(null),
                  currentTurn: 'X',
                  status: 'active',
                  createdAt: Date.now(),
                };
                
                set(newGameRef, gameData)
                  .then(() => {
                    console.log('Game session created:', newGameRef.key);
                    // Navigate both players to the Game Screen with gameId
                    navigation.navigate('Game', { mode: 'online', gameId: newGameRef.key });
                    // Clean up listener
                    unsubscribe();
                  })
                  .catch((error) => {
                    console.error('Error creating game session:', error);
                    Alert.alert('Error', 'Failed to create game session.');
                  });
              })
              .catch((error) => {
                console.error('Error updating player statuses:', error);
                Alert.alert('Error', 'Failed to update player statuses.');
              });
            return; // Exit after finding a match
          }
        }
      }
    }
  }, (error) => {
    console.error('Error fetching online players:', error);
    Alert.alert('Error', 'Failed to fetch online players for matchmaking.');
  });

  // Timeout after 30 seconds if no match is found
  setTimeout(() => {
    console.log('No match found within 30 seconds');
    // Remove player from onlinePlayers
    remove(ref(database, `onlinePlayers/${currentPlayerId}`))
      .then(() => {
        console.log('Player removed from onlinePlayers:', currentPlayerId);
      })
      .catch((error) => {
        console.error('Error removing player from onlinePlayers:', error);
      });
    Alert.alert('No Match Found', 'No nearby players found. Please try again later.');
    unsubscribe();
  }, 30000);
};
