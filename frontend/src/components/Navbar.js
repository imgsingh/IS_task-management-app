import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Cookies from 'js-cookie';
import config from '../config';
import axios from 'axios';
import { useTheme } from '../App'; // Import useTheme hook
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark theme icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light theme icon
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'; // System theme icon

function Navbar() {
    const { themeMode, enableLightTheme, enableDarkTheme, enableSystemTheme } = useTheme();

    const handleLogout = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/users/logout`);
            console.log(response);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h6" component="div">
                        SyncEdge
                    </Typography>
                </Link>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>

                    <IconButton
                        color="inherit"
                        onClick={enableLightTheme}
                        aria-label="Light Theme"
                        sx={{ mx: 1, bgcolor: themeMode === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}
                    >
                        <Brightness7Icon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={enableDarkTheme}
                        aria-label="Dark Theme"
                        sx={{ mx: 1, bgcolor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}
                    >
                        <Brightness4Icon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={enableSystemTheme}
                        aria-label="System Theme"
                        sx={{ mx: 1, bgcolor: themeMode === 'system' ? 'rgba(255, 255, 255, 0.1)' : 'transparent' }}
                    >
                        <SettingsBrightnessIcon />
                    </IconButton>
                    <Button color="inherit" component={Link} to="/tasks">
                        Tasks
                    </Button>
                    <Button color="inherit" component={Link} to="/groups">
                        Groups
                    </Button>
                    <Button color="inherit" component={Link} to="/users">
                        Users
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;