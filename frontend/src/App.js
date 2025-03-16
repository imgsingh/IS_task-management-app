import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Groups from './components/Groups';
import config from './config';
import './App.css';
import axios from 'axios';
import ForgotPassword from './components/ForgotPassword';
import Task from './components/Task';
import Users from './components/Users';

const theme = createTheme();

axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/users/verify`);

        if (response.data.message === 'JWT is valid') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Set loading to false after verification
      }
    };

    verifyToken();
  }, []);

  // Show a centered loader while verifying the token
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh', // Full viewport height
          }}
        >
          <CircularProgress /> {/* Centered loading spinner */}
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Container>
            <Routes>
              <Route
                path="/"
                element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
              />
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <Login />}
              />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/tasks"
                element={isAuthenticated ? <Task /> : <Navigate to="/login" />}
              />
              <Route
                path="/groups"
                element={isAuthenticated ? <Groups /> : <Navigate to="/login" />}
              />
              <Route
                path="/users"
                element={isAuthenticated ? <Users /> : <Navigate to="/login" />}
              />
            </Routes>
          </Container>
        </div>
      </Router>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;