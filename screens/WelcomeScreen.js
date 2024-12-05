// screens/WelcomeScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Button, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { auth, database } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, push, set, query, orderByChild, startAt, onValue, update } from 'firebase/database';
import * as Location from 'expo-location';

const WelcomeScreen = ({ navigation }) => {
  const [marker, setMarker] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Request location permissions and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const chooseMarker = (selectedMarker) => {
    setMarker(selectedMarker);
  };

  const navigateToGame = (mode) => {
    if (!marker) {
      Alert.alert('Selection Required', 'Please select your marker (X or O).');
      return;
    }

    if (mode === 'online' && !location) {
      Alert.alert('Location Error', 'Unable to retrieve your location.');
      return;
    }

    if (mode === 'online') {
      setLoading(true);
      matchPlayer();
    } else {
      navigation.navigate('Game', { marker, mode: 'local' });
    }
  };

  const matchPlayer = () => {
    const userId = auth.currentUser.uid;
    const usersRef = ref(database, 'onlinePlayers');

    // Add current user to onlinePlayers
    const userData = {
      marker,
      latitude: location.latitude,
      longitude: location.longitude,
      status: 'waiting',
      timestamp: Date.now(),
    };

    const newUserRef = push(usersRef);
    set(newUserRef, userData);

    // Create a query to find players within 5 km
    const nearbyPlayersQuery = query(
      usersRef,
      orderByChild('timestamp'),
      startAt(Date.now() - 30000) // Consider players active in the last 30 seconds
    );

    // Listen for potential matches
    const unsubscribe = onValue(nearbyPlayersQuery, snapshot => {
      const users = snapshot.val();
      if (users) {
        for (let key in users) {
          if (key !== newUserRef.key && users[key].status === 'waiting') {
            const distance = getDistanceFromLatLonInKm(
              location.latitude,
              location.longitude,
              users[key].latitude,
              users[key].longitude
            );

            if (distance <= 5) { // 5 km radius
              // Match found
              const opponentId = key;
              const opponentMarker = users[key].marker;

              // Update statuses
              set(ref(database, `onlinePlayers/${opponentId}/status`), 'active');
              set(ref(database, `onlinePlayers/${newUserRef.key}/status`), 'active');

              // Create a game session
              const gameRef = push(ref(database, 'games'));
              set(gameRef, {
                players: {
                  [userId]: { marker },
                  [opponentId]: { marker: opponentMarker },
                },
                board: Array(9).fill(null),
                currentTurn: 'X',
                status: 'active',
              });

              // Navigate to Game Screen with gameId
              navigation.navigate('Game', { marker, mode: 'online', gameId: gameRef.key });

              // Cleanup
              unsubscribe();
              setLoading(false);
              return;
            }
          }
        }
      }
    });

    // Timeout after 30 seconds if no match is found
    setTimeout(() => {
      // Remove user from onlinePlayers
      set(ref(database, `onlinePlayers/${newUserRef.key}`), null);
      Alert.alert('No Match Found', 'No nearby players found. Please try again later.');
      unsubscribe();
      setLoading(false);
    }, 30000);
  };

  // Helper function to calculate distance between two coordinates (Haversine formula)
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('Auth');
      })
      .catch(error => {
        Alert.alert('Logout Error', error.message);
      });
  };

  const navigateToStats = () => {
    navigation.navigate('Stats');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tic-Tac-Toe!</Text>
      <Text>Select Your Marker:</Text>
      <View style={styles.markerContainer}>
        <TouchableOpacity
          style={[styles.markerButton, marker === 'X' && styles.selectedMarker]}
          onPress={() => chooseMarker('X')}
        >
          <Text style={styles.markerText}>X</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.markerButton, marker === 'O' && styles.selectedMarker]}
          onPress={() => chooseMarker('O')}
        >
          <Text style={styles.markerText}>O</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.gameButtonContainer}>
        <Button title="Start Local Game" onPress={() => navigateToGame('local')} />
      </View>
      <View style={styles.gameButtonContainer}>
        <Button title="Start Online Game" onPress={() => navigateToGame('online')} />
      </View>
      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      <View style={styles.statsButtonContainer}>
        <Button title="View Stats" onPress={navigateToStats} />
      </View>
      <View style={styles.logoutContainer}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    width: '60%',
    justifyContent: 'space-between',
  },
  markerButton: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    padding: 10,
    width: 60,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedMarker: {
    backgroundColor: '#ddd',
  },
  markerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameButtonContainer: {
    marginTop: 20,
    width: '60%',
  },
  statsButtonContainer: {
    marginTop: 10,
    width: '60%',
  },
  logoutContainer: {
    marginTop: 30,
    width: '60%',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default WelcomeScreen;
