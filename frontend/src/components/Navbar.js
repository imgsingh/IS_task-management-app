import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Cookies from 'js-cookie';
import config from '../config';
import axios from 'axios';

function Navbar() {

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.get(`${config.apiUrl}/api/users/logout`, { withCredentials: true });
            Cookies.remove('jwt'); // Remove the cookie
            //navigate('/');
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally, display an error message to the user
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        Task Management App
                    </Link>
                </Typography>
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
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;