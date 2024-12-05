// screens/AuthScreen.js
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { auth, database } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Input Error', 'Please enter both email and password.');
      return;
    }

    createUserWithEmailAndPassword(auth, email.trim(), password)
      .then(userCredential => {
        // Initialize user stats
        const userId = userCredential.user.uid;
        set(ref(database, `users/${userId}`), {
          wins: 0,
          losses: 0,
          draws: 0,
        });
        navigation.replace('Welcome');
      })
      .catch(error => {
        Alert.alert('Sign Up Error', error.message);
      });
  };

  const handleLogIn = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Input Error', 'Please enter both email and password.');
      return;
    }

    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(() => {
        navigation.replace('Welcome');
      })
      .catch(error => {
        Alert.alert('Log In Error', error.message);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize='none'
          keyboardType='email-address'
          textContentType='emailAddress'
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          textContentType='password'
        />
        <View style={styles.buttonContainer}>
          <Button title="Sign Up" onPress={handleSignUp} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Log In" onPress={handleLogIn} />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    height: 50,
    borderColor: '#999',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginVertical: 5,
  },
});

export default AuthScreen;
