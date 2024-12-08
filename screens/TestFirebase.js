// screens/TestFirebase.js

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { database } from '../firebase/firebaseConfig';
import { ref, set, get } from 'firebase/database';

const TestFirebase = () => {
  useEffect(() => {
    const testRef = ref(database, 'test/value');

    // Write Test Data
    set(testRef, {
      message: "Firebase is connected!"
    })
    .then(() => {
      console.log('Test data written successfully.');
    })
    .catch((error) => {
      console.log('Error writing test data:', error);
    });

    // Read Test Data
    get(testRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log('Test data:', snapshot.val());
          Alert.alert('Firebase Test', snapshot.val().message);
        } else {
          console.log('No test data available.');
        }
      })
      .catch((error) => {
        console.log('Error reading test data:', error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Testing Firebase Connectivity...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
});

export default TestFirebase;
