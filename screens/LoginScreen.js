// screens/LoginScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { auth } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogIn = () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert('Success', 'Logged in successfully!');
        navigation.navigate('Welcome');
      })
      .catch((error) => {
        Alert.alert('Log In Error', error.message);
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
      <Button title="Log In" onPress={handleLogIn} />
      <View style={styles.signupRedirect}>
        <Button
          title="Don't have an account? Sign Up"
          onPress={() => navigation.navigate('SignUp')}
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
  signupRedirect: {
    marginTop: 20,
  },
});

export default LoginScreen;
