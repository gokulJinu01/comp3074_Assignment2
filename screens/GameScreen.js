// screens/GameScreen.js

import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Button, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { database } from '../firebase/firebaseConfig';
import { ref, update, runTransaction, serverTimestamp } from 'firebase/database';
import { AuthContext } from '../contexts/AuthContext';

const GameScreen = () => {
  const { user } = useContext(AuthContext);
  const userId = user ? user.uid : null;

  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Function to handle cell press
  const handlePress = (index) => {
    if (board[index] || winner || loading) return;

    const updatedBoard = [...board];
    updatedBoard[index] = currentTurn;
    setBoard(updatedBoard);

    const gameWinner = checkWinner(updatedBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      updateUserStats(gameWinner === 'X' ? 'Win' : 'Loss');
      setModalVisible(true);
      return;
    }

    if (!updatedBoard.includes(null)) {
      setWinner('Draw');
      updateUserStats('Draw');
      setModalVisible(true);
      return;
    }

    const nextTurn = currentTurn === 'X' ? 'O' : 'X';
    setCurrentTurn(nextTurn);
  };

  // Function to check for a winner
  const checkWinner = (board) => {
    const lines = [
      [0,1,2], [3,4,5], [6,7,8], // Rows
      [0,3,6], [1,4,7], [2,5,8], // Columns
      [0,4,8], [2,4,6],          // Diagonals
    ];

    for (let line of lines) {
      const [a,b,c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  // Function to update user statistics in Firebase
  const updateUserStats = async (result) => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const userRef = ref(database, `users/${userId}`);

    try {
      await runTransaction(userRef, (currentData) => {
        if (currentData) {
          if (result === 'Win') {
            currentData.wins += 1;
          } else if (result === 'Loss') {
            currentData.losses += 1;
          } else if (result === 'Draw') {
            currentData.draws += 1;
          }
          return currentData;
        } else {
          // Initialize user stats if not present
          return {
            wins: result === 'Win' ? 1 : 0,
            losses: result === 'Loss' ? 1 : 0,
            draws: result === 'Draw' ? 1 : 0,
          };
        }
      });
      console.log('User statistics updated successfully!');
    } catch (error) {
      console.error('Error updating user statistics:', error);
      Alert.alert('Error', 'Failed to update statistics.');
    }
  };

  // Function to reset the game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentTurn('X');
    setWinner(null);
    setModalVisible(false);
  };

  // Function to go back to the welcome screen
  const goToWelcome = () => {
    setModalVisible(false);
    // Navigate to Welcome Screen (Assuming you have navigation set up)
    // navigation.navigate('Welcome');
    Alert.alert('Info', 'Navigate to Welcome Screen');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Processing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.turnText}>
        {winner ? `Winner: ${winner}` : `Player ${currentTurn}'s Turn`}
      </Text>
      <View style={styles.board}>
        {board.map((cell, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.cell} 
            onPress={() => handlePress(index)}
          >
            <Text style={styles.cellText}>{cell}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal to display game result */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType='slide'
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}`}
            </Text>
            <Button title="Restart Game" onPress={resetGame} />
            <Button title="Go to Welcome" onPress={goToWelcome} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  loadingContainer: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
  },
  container: {
    flex:1,
    padding:20,
    backgroundColor:'#fff',
    alignItems:'center',
    justifyContent:'center',
  },
  turnText: {
    fontSize:20,
    marginBottom:20,
  },
  board: {
    width:300,
    height:300,
    flexDirection:'row',
    flexWrap:'wrap',
  },
  cell: {
    width:'33.33%',
    height:'33.33%',
    borderWidth:1,
    borderColor:'#000',
    justifyContent:'center',
    alignItems:'center',
  },
  cellText: {
    fontSize:40,
  },
  modalContainer: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width:250,
    padding:20,
    backgroundColor:'#fff',
    borderRadius:10,
    alignItems:'center',
  },
  modalText: {
    fontSize:22,
    marginBottom:20,
  },
});

export default GameScreen;
