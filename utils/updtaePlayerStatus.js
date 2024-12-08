// utils/updatePlayerStatus.js

import { ref, update } from 'firebase/database';
import { database } from '../firebase/firebaseConfig';
import { Alert } from 'react-native';

/**
 * Updates multiple paths in Firebase Realtime Database atomically.
 * @param {Object} updates - An object where keys are paths and values are the new data.
 */
export const updateMultiplePaths = (updates) => {
  // Validate that updates is a non-null object
  if (typeof updates !== 'object' || updates === null) {
    console.error('Update failed: updates must be a non-null object');
    Alert.alert('Error', 'Invalid data format for update.');
    return;
  }

  update(ref(database), updates)
    .then(() => {
      console.log('Multiple paths updated successfully!');
    })
    .catch((error) => {
      console.error('Error updating multiple paths:', error);
      Alert.alert('Error', 'Failed to update data.');
    });
};
