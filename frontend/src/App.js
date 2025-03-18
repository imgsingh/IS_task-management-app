import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Groups from './components/Groups';
import MyThemedComponent from './components/MyThemedComponent';
import config from './config';
import './App.css';
import axios from 'axios';
import ForgotPassword from './components/ForgotPassword';
import Task from './components/Task';
import Users from './components/Users';

// Create Theme Context
const ThemeContext = createContext();

// Custom Theme Provider
const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const storedTheme = localStorage.getItem('appTheme');
    if (storedTheme) {
      return storedTheme;
    }
    return 'system';
  });

  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    localStorage.setItem('appTheme', themeMode);
  }, [themeMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          // You can customize other palette options here if needed
        },
      }),
    [isDarkMode],
  );

  const toggleTheme = useCallback(() => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const enableLightTheme = useCallback(() => setThemeMode('light'), []);
  const enableDarkTheme = useCallback(() => setThemeMode('dark'), []);
  const enableSystemTheme = useCallback(() => setThemeMode('system'), []);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, enableLightTheme, enableDarkTheme, enableSystemTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { themeMode } = useTheme(); // Use the theme context

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
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return (
      <MuiThemeProvider theme={createTheme()}> {/* Use a default theme for loading */}
        <CssBaseline />
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Container>
      </MuiThemeProvider>
    );
  }

  return (
    <Router>
      <div className={`App theme-${themeMode}`}>
        <Container>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/tasks" element={isAuthenticated ? <Task /> : <Navigate to="/login" />} />
            <Route path="/groups" element={isAuthenticated ? <Groups /> : <Navigate to="/login" />} />
            <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" />} />
            <Route path="/themed-page" element={<MyThemedComponent />} />
          </Routes>
        </Container>
      </div>
      <ToastContainer />
    </Router>
  );
}

// Wrap the App component with ThemeProvider
export default function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}