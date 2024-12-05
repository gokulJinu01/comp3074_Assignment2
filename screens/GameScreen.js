// screens/GameScreen.js
import React, { useState, useEffect } from 'react';
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
import { auth, database } from '../firebase/firebaseConfig';
import { ref, onValue, update, set, serverTimestamp } from 'firebase/database';

const GameScreen = ({ route, navigation }) => {
  const { marker, mode, gameId } = route.params;
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [gameRef, setGameRef] = useState(null);
  const [loading, setLoading] = useState(true);

  const opponentMarker = marker === 'X' ? 'O' : 'X';
  const userId = auth.currentUser.uid;

  useEffect(() => {
    if (mode === 'online') {
      const refPath = `games/${gameId}`;
      const gameReference = ref(database, refPath);
      setGameRef(gameReference);

      const unsubscribe = onValue(gameReference, snapshot => {
        const gameData = snapshot.val();
        if (gameData) {
          setBoard(gameData.board);
          setCurrentTurn(gameData.currentTurn);
          setLoading(false);

          if (gameData.status === 'ended') {
            determineWinner(gameData.board);
          }
        } else {
          Alert.alert('Game Ended', 'The game session has been terminated.');
          navigation.replace('Welcome');
        }
      }, error => {
        Alert.alert('Error', error.message);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const handlePress = (index) => {
    if (board[index] || winner) return;

    if (mode === 'online' && currentTurn !== marker) {
      Alert.alert('Not Your Turn', 'Please wait for your turn.');
      return;
    }

    const updatedBoard = [...board];
    updatedBoard[index] = currentTurn;
    setBoard(updatedBoard);

    // Check for winner
    const gameWinner = checkWinner(updatedBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      updatePlayerStats(gameWinner === marker ? 'Win' : 'Loss');
      if (mode === 'online') {
        update(ref(database, `games/${gameId}`), {
          board: updatedBoard,
          status: 'ended',
          endedAt: serverTimestamp(),
        });
      }
      setModalVisible(true);
      return;
    }

    // Check for draw
    if (!updatedBoard.includes(null)) {
      setWinner('Draw');
      updatePlayerStats('Draw');
      if (mode === 'online') {
        update(ref(database, `games/${gameId}`), {
          board: updatedBoard,
          status: 'ended',
          endedAt: serverTimestamp(),
        });
      }
      setModalVisible(true);
      return;
    }

    // Switch turn
    const nextTurn = currentTurn === 'X' ? 'O' : 'X';
    setCurrentTurn(nextTurn);

    if (mode === 'online') {
      update(ref(database, `games/${gameId}`), {
        board: updatedBoard,
        currentTurn: nextTurn,
      });
    }
  };

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

  const determineWinner = (currentBoard) => {
    const gameWinner = checkWinner(currentBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      updatePlayerStats(gameWinner === marker ? 'Win' : 'Loss');
    } else {
      setWinner('Draw');
      updatePlayerStats('Draw');
    }
    setModalVisible(true);
  };

  const updatePlayerStats = (result) => {
    const userRef = ref(database, `users/${userId}`);

    // Fetch current stats
    onValue(userRef, snapshot => {
      const data = snapshot.val();
      if (data) {
        const updatedData = { ...data };
        if (result === 'Win') {
          updatedData.wins += 1;
        } else if (result === 'Loss') {
          updatedData.losses += 1;
        } else if (result === 'Draw') {
          updatedData.draws += 1;
        }
        set(userRef, updatedData);
      }
    });
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentTurn('X');
    setWinner(null);
    setModalVisible(false);
    if (mode === 'online') {
      update(ref(database, `games/${gameId}`), {
        board: Array(9).fill(null),
        currentTurn: 'X',
        status: 'active',
      });
    }
  };

  const goToWelcome = () => {
    setModalVisible(false);
    navigation.replace('Welcome');
  };

  const renderCell = (index) => (
    <TouchableOpacity
      key={index}
      style={styles.cell}
      onPress={() => handlePress(index)}
    >
      <Text style={styles.cellText}>{board[index]}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        {mode === 'online' && <Text>Waiting for opponent...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.turnText}>
        {winner ? `Winner: ${winner}` : `Player ${currentTurn}'s Turn`}
      </Text>
      <View style={styles.board}>
        {board.map((cell, index) => renderCell(index))}
      </View>
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
            <Button title="Restart" onPress={resetGame} />
            <Button title="Go to Welcome" onPress={goToWelcome} />
          </View>
        </View>
      </Modal>
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
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  turnText: {
    fontSize: 20,
    marginBottom: 20,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 40,
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
    fontSize: 22,
    marginBottom: 20,
  },
});

export default GameScreen;
