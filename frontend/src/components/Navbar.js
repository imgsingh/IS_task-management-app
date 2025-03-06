import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

function Navbar() {
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
                <Button color="inherit" component={Link} to="/login">
                    Login
                </Button>
                <Button color="inherit" component={Link} to="/signup">
                    Signup
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;