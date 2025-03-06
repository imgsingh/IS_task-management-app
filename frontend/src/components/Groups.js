import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from './Navbar';

function Groups() {
    const [groups, setGroups] = useState([]);
    const [newGroup, setNewGroup] = useState({ name: '' });
    const [editingGroup, setEditingGroup] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get('/api/groups');
                setGroups(response.data);
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };
        fetchGroups();
    },);

    const handleGroupChange = (event) => {
        setNewGroup({ name: event.target.value });
    };

    const handleCreateGroup = async () => {
        try {
            await axios.post('/api/groups', newGroup);
            setNewGroup({ name: '' });
            // Re-fetch groups after creating
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleEditGroup = (group) => {
        setEditingGroup(group);
    };

    const handleUpdateGroup = async (groupId) => {
        try {
            await axios.put(`/api/groups/${groupId}`, editingGroup);
            setEditingGroup(null);
            // Re-fetch groups after updating
        } catch (error) {
            console.error('Error updating group:', error);
        }
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            await axios.delete(`/api/groups/${groupId}`);
            // Re-fetch groups after deleting
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    return (
        <div>
            <Navbar />
            <Typography variant="h5" gutterBottom>
                Groups
            </Typography>
            <List>
                {groups.map((group) => (
                    <ListItem key={group._id}>
                        <ListItemText primary={group.name} />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => handleEditGroup(group)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteGroup(group._id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
            {/* Form for creating new group */}
            <Typography variant="h6" gutterBottom>
                Create New Group
            </Typography>
            <TextField
                label="Group Name"
                value={newGroup.name}
                onChange={handleGroupChange}
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleCreateGroup}>
                Create Group
            </Button>
            {/* Form for editing existing group (conditionally render) */}
            {editingGroup && (
                <div>
                    <Typography variant="h6" gutterBottom>
                        Edit Group
                    </Typography>
                    {/* Similar form field as create group, but pre-filled with editingGroup data */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateGroup(editingGroup._id)}
                    >
                        Update Group
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Groups;