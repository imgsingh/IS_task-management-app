import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Navbar from './Navbar';
import config from '../config';

function Users() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/users`, { withCredentials: true });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    },);

    const handleEditUser = (user) => {
        setEditingUser({ ...user });
        setEditOpen(true);
    };

    const handleUpdateUser = async (userId) => {
        try {
            await axios.put(`${config.apiUrl}/api/users/${userId}`, editingUser, { withCredentials: true });
            setEditingUser(null);
            setEditOpen(false);
            // Re-fetch users after updating
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleClose = () => {
        setEditOpen(false);
    };

    return (
        <div>
            <Navbar />
            <Typography variant="h5" gutterBottom style={{ padding: '16px' }}>
                Users
            </Typography>

            <Grid container spacing={3} style={{ padding: '16px' }}>
                {users.map((user) => (
                    <Grid item key={user._id} xs={12} sm={6} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {user.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Username: {user.username}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton onClick={() => handleEditUser(user)}>
                                    <EditIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog for editing user */}
            <Dialog open={editOpen} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        name="name"
                        value={editingUser?.name || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Username"
                        name="username"
                        value={editingUser?.username || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    {/* You can add more fields for editing other user details if needed */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleUpdateUser(editingUser._id)} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Users;