// screens/StatsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { auth, database } from '../firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';

const StatsScreen = ({ navigation }) => {
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const userRef = ref(database, `users/${userId}`);

    const unsubscribe = onValue(userRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        setStats(data);
      } else {
        Alert.alert('No Data', 'No statistics found for this user.');
      }
      setLoading(false);
    }, error => {
      Alert.alert('Error', error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Stats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Stats</Text>
      <Text style={styles.statText}>Wins: {stats.wins}</Text>
      <Text style={styles.statText}>Losses: {stats.losses}</Text>
      <Text style={styles.statText}>Draws: {stats.draws}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Back to Welcome" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding: 20,
  },
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding: 20,
  },
  title: {
    fontSize:24,
    marginBottom:20,
    fontWeight: 'bold',
  },
  statText: {
    fontSize:18,
    marginVertical:5,
  },
  buttonContainer: {
    marginTop: 30,
    width: '60%',
  },
});

export default StatsScreen;
