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

    const handleLogout = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/users/logout`);
            console.log(response)
            setTimeout(() => { window.location.reload(); }, 2000);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    SyncEdge
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