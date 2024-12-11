// App.js
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Container, Typography, Button, Paper } from '@mui/material';
import { auth } from './firebase.js';
import Login from './components/Login.js';
import Calendar from './components/Calendar.js';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Container>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography variant="h4" gutterBottom>Weekly Availability Schedule</Typography>
          <Typography variant="body1" gutterBottom>{user.email}</Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleLogout}
            style={{ marginBottom: '20px' }}
          >
            Sign Out
          </Button>
          
          <Calendar user={user} />
        </Paper>
      )}
    </Container>
  );
}

export default App;