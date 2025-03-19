import React, { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import EmailIcon from '@mui/icons-material/Email';
import { Link } from '@mui/material';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import csoLogo from '../images/cso.png';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user);
    } catch (error) {
      console.error("Error signing in:", error);
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            sx={{
              height: 100,
              mb: 2
            }}
            alt="Logo"
            src={csoLogo}
          />
          
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, fontWeight: 'bold', color: '#1a73e8' }}
          >
            Staff Availability App
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Sign in to view and manage your weekly availability schedule. Your schedule helps teams coordinate meetings and ensures everyone knows when you're available.
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon fontSize="small" />
            <Typography variant="body2">
              For bugs and issues, contact the developer {' '}
              <Link href="mailto:tammyhartline@gmail.com" underline="hover">
              Tammy Hartline
              </Link>
            </Typography>
          </Box>

          <Divider sx={{ width: '100%', mb: 4 }} />

          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleLogin}
            disabled={loading}
            sx={{
              width: '100%',
              py: 1.5,
              bgcolor: '#1a73e8',
              '&:hover': {
                bgcolor: '#1557b0'
              }
            }}
          >
            {loading ? "Signing in..." : "Sign in with Google"}
          </Button>

          {error && (
            <Typography 
              color="error" 
              sx={{ mt: 2 }}
            >
              {error}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;