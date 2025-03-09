import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Tasks from './components/Tasks';
import Groups from './components/Groups';
import config from './config';
import './App.css';
import Cookies from 'js-cookie';
import axios from 'axios';
import ForgotPassword from './components/ForgotPassword';
import Task from './components/Task';
import Users from './components/Users';

const theme = createTheme();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const jwtToken = Cookies.get('jwt');
        const response = await axios.get(`${config.apiUrl}/api/users/verify`,
          {
            // headers: {
            //   Cookie: `jwt=${jwtToken}`,
            // },
            withCredentials: true
          }
        );
        if (response.data.message === 'JWT is valid') {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  },);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          {/* <Navbar /> */}
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
                element={isAuthenticated ? <Users /> : <Navigate to="/users" />}
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
