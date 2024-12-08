// screens/SignUpScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { auth, database } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;
        // Initialize user statistics
        set(ref(database, `users/${userId}`), {
          wins: 0,
          losses: 0,
          draws: 0,
        });
        Alert.alert('Success', 'User registered successfully!');
        navigation.navigate('Welcome');
      })
      .catch((error) => {
        Alert.alert('Sign Up Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType='email-address'
        autoCapitalize='none'
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <View style={styles.loginRedirect}>
        <Button
          title="Already have an account? Log In"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    padding:20,
    backgroundColor:'#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth:1,
    marginBottom:15,
    paddingHorizontal:10,
    borderRadius:5,
  },
  loginRedirect: {
    marginTop: 20,
  },
});

export default SignUpScreen;
