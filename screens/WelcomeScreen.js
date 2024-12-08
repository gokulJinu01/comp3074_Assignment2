// screens/WelcomeScreen.js

import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { auth, database } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { ref, remove, push, set } from 'firebase/database';

const WelcomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const userId = user ? user.uid : null;

  // Function to handle logout
  const handleLogout = () => {
    if (!userId) return;

    // Remove user from onlinePlayers if present
    const onlinePlayerRef = ref(database, `onlinePlayers/${userId}`);
    remove(onlinePlayerRef)
      .then(() => {
        console.log('User removed from onlinePlayers.');
      })
      .catch((error) => {
        console.log('Error removing user from onlinePlayers:', error);
      });

    // Sign out
    signOut(auth)
      .then(() => {
        Alert.alert('Success', 'Logged out successfully!');
        navigation.replace('Login');
      })
      .catch((error) => {
        Alert.alert('Logout Error', error.message);
      });
  };

  // Function to start a local game
  const startLocalGame = () => {
    // Navigate to Game Screen in Local Mode
    navigation.navigate('Game', { mode: 'local' });
  };

  // Function to start an online game
  const startOnlineGame = () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    // Example: Adding user to onlinePlayers
    const onlinePlayersRef = ref(database, 'onlinePlayers');
    const newPlayerRef = push(onlinePlayersRef);

    // Sample data - In a real app, you'd collect actual data like location
    const playerData = {
      marker: 'X', // or 'O', based on user selection
      latitude: 37.7749, // Example latitude
      longitude: -122.4194, // Example longitude
      status: 'waiting',
      timestamp: Date.now(),
    };

    set(newPlayerRef, playerData)
      .then(() => {
        console.log('Player added to onlinePlayers:', newPlayerRef.key);
        Alert.alert('Info', 'Added to matchmaking. Waiting for an opponent...');
        // Navigate to Game Screen in Online Mode
        navigation.navigate('Game', { mode: 'online', gameId: newPlayerRef.key });
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user ? user.email : 'User'}!</Text>
      <View style={styles.buttonContainer}>
        <Button title="Local Multiplayer" onPress={startLocalGame} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Online Multiplayer" onPress={startOnlineGame} />
      </View>
      <View style={styles.logoutContainer}>
        <Button title="Log Out" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding:20,
    backgroundColor:'#fff',
  },
  title: {
    fontSize:24,
    marginBottom:40,
    fontWeight:'bold',
  },
  buttonContainer: {
    width:'80%',
    marginBottom:20,
  },
  logoutContainer: {
    position:'absolute',
    bottom:30,
    width:'80%',
  },
});

export default WelcomeScreen;
