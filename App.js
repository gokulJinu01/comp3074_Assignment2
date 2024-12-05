// App.js
import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { LogBox } from 'react-native';

// Optional: Ignore specific log notifications
LogBox.ignoreLogs([
  'Setting a timer',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  return <AppNavigator />;
}
