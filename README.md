# Tic-Tac-Toe React Native App

A simple and functional Tic-Tac-Toe game built with React Native and Expo, featuring user authentication, local multiplayer, and location-based online multiplayer using Firebase.

## Features

1. **User Authentication**
   - Sign Up and Log In using email and password.
   - Firebase Authentication integration.

2. **Welcome Screen**
   - Choose your marker (X or O).
   - Start a local multiplayer game or an online game matched based on your location.
   - View your game statistics.
   - Logout functionality.

3. **Game Screen**
   - 3x3 Tic-Tac-Toe grid.
   - Dynamic turn updates.
   - Real-time synchronization for online multiplayer.
   - Winner and draw detection with modals for restart or return to Welcome Screen.

4. **Game Modes**
   - **Local Player Mode:** Two players can play on the same device.
   - **Online Player Mode:** Real-time multiplayer matched based on geographical proximity using Firebase Realtime Database.

5. **Player Data Storage**
   - Match history and player statistics (wins, losses, draws) stored in Firebase.

6. **Best Practices**
   - React Navigation for seamless screen transitions.
   - Responsive and visually appealing UI.
   - Beginner-friendly code structure.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/tic-tac-toe-react-native.git
