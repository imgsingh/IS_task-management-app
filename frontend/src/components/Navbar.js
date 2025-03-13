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

    const removeCookie = () => {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=is-task-management-app.vercel.app";
        window.location.reload();
    };

    const handleLogout = async () => {
        try {
            // await axios.get(`${config.apiUrl}/api/users/logout`);
            removeCookie();
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally, display an error message to the user
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Web Support
                </Link>
                <div style={{ marginLeft: 'auto' }}>
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