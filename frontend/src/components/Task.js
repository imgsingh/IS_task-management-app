// src/components/Tasks.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import {
    Button,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Modal,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
} from '@mui/material';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import StatusDropdown from './StatusDropdown';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    //width: 600,
    height: 550,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
};

// Mapping of status values to column names
export const statusColumns = {
    1: 'Requirement Gathering',
    2: 'In Dev',
    3: 'Dev Completed',
    4: 'In Testing',
    5: 'Testing Done',
    6: 'Done',
};

function Task() {
    const [tasks, setTasks] = useState([]);
    const [open, setOpen] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        link: '',
        tags: '',
        group: '',
        status: 1,
        completed: false,
        visibility: 'private',
        assigned_by: undefined,
        assigned_to: undefined
    });
    const [editingTask, setEditingTask] = useState(null);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [groups]);

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/groups`, { withCredentials: true });
            setGroups(response.data);

            const response_users = await axios.get(`${config.apiUrl}/api/users`, { withCredentials: true });
            setUsers(response_users.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/tasks`, { withCredentials: true });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setEditingTask(null);
        setTaskData({
            title: '',
            description: '',
            link: '',
            tags: '',
            group: '',
            status: 1,
            completed: false,
            visibility: 'private',
            assigned_by: undefined,
            assigned_to: undefined,
        });
    };

    const handleChange = (event) => {
        setTaskData({ ...taskData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!taskData.group) {
            toast.error('Please select a group.');
            return;
        }
        if (taskData.link && !isValidUrl(taskData.link)) {
            toast.error('Please enter a valid Resource Link');
            return;
        }
        if (taskData.assigned_by === undefined) {
            toast.error('Assigned by user cannot be blank');
            return;
        }

        if (taskData.assigned_to === undefined) {
            toast.error('Assigned to user cannot be blank');
            return;
        }

        if (taskData.status === '6') {
            setTaskData({ ...taskData, completed: true });
        } else {
            setTaskData({ ...taskData, completed: false });
        }
        try {
            if (editingTask) {
                await axios.put(`${config.apiUrl}/api/tasks/${editingTask._id}`, taskData, { withCredentials: true });
                toast.success('Task updated!');
            } else {
                await axios.post(`${config.apiUrl}/api/tasks`, taskData, { withCredentials: true });
                toast.success('Task created!');
            }
            fetchTasks();
            handleClose();
        } catch (error) {
            console.error('Error creating/updating task:', error);
            toast.error('Failed to create/update task.');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setTaskData({
            title: task.title,
            description: task.description,
            link: task.link,
            tags: task.tags,
            group: task.group,
            status: task.status,
            completed: task.completed,
            visibility: task.visibility,
            assigned_by: task.assigned_by,
            assigned_to: task.assigned_to,
        });
        handleOpen();
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`${config.apiUrl}/api/tasks/${taskId}`, { withCredentials: true });
            fetchTasks();
            toast.success('Task deleted!');
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task.');
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            await axios.put(`${config.apiUrl}/api/tasks/${task._id}`, { completed: !task.completed }, { withCredentials: true });
            fetchTasks();
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            let obj
            if (newStatus === '6') {
                obj = { status: newStatus, completed: true }
            } else {
                obj = { status: newStatus, completed: false }
            }
            await axios.put(`${config.apiUrl}/api/tasks/${taskId}`, obj, { withCredentials: true });
            fetchTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Group tasks by status
    const groupedTasks = tasks.reduce((acc, task) => {
        const status = task.status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(task);
        return acc;
    }, {});

    const getInitials = (assignedToId, users) => {
        if (!assignedToId || !users) return '';

        // Find the user by id
        const user = users.find((user) => user._id === assignedToId);

        if (!user || !user.name) return '';

        // Extract initials from the user's name
        const names = user.name.split(' ');
        return names.map((n) => n[0]).join('').toUpperCase();
    };

    const getRandomColor = () => {
        const colors = ['#1976d2', '#d32f2f', '#388e3c', '#f57c00', '#7b1fa2'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <>
            <Navbar />
            <Container>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h4" gutterBottom>
                            Task Board
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" color="primary" onClick={handleOpen}>
                            Add Task
                        </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={3} mt={2}>
                    {Object.entries(statusColumns).map(([status, columnName]) => (
                        <Grid item key={status} xs={12} sm={4} md={2}>
                            <Box
                                sx={{
                                    border: '1px solid #ccc', // Add a border
                                    borderRadius: '4px', // Optional: Add rounded corners
                                    padding: '5px', // Add padding inside the box
                                    backgroundColor: '#f9f9f9', // Optional: Add a light background color
                                }}
                            >
                                <Box
                                    sx={{
                                        border: '1px solid black',
                                        borderRadius: '4px',
                                        height: '50px',
                                        backgroundColor: '#ffffff', // White background
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add a subtle shadow
                                        textAlign: 'center', // Center-align the heading text
                                        marginBottom: '16px', // Add space below the heading
                                    }}
                                >
                                    <Typography
                                        variant="p"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 'bold', // Make the text bold
                                            color: '#333333', // Darker text color
                                            textTransform: 'uppercase', // Uppercase text
                                        }}
                                    >
                                        {columnName}
                                    </Typography>
                                </Box>
                                {groupedTasks[status]?.map((task) => (
                                    <Card
                                        key={task._id}
                                        sx={{ mb: 1, cursor: 'pointer' }} // Add cursor pointer to indicate clickability
                                        onClick={() => handleEdit(task)} // Make the entire card clickable for editing
                                    >
                                        <CardContent sx={{ padding: '5px', justifyItems: 'left' }}>
                                            <Typography variant="p" component="div" sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                                {task.link ? (
                                                    <a
                                                        href={task.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ textDecoration: 'underline', color: 'inherit' }} // Add underline
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {task.title}
                                                    </a>
                                                ) : (
                                                    task.title
                                                )}
                                            </Typography>
                                            {task.tags && (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mt: 1 }}>
                                                    {task.tags.split(',').map((tag, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={tag.trim()} // Trim whitespace from tags
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#e0e0e0', // Light gray background
                                                                color: '#333333', // Dark text color
                                                                borderRadius: '4px', // Rounded corners
                                                                fontSize: '0.75rem', // Smaller font size
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </CardContent>
                                        <CardActions>
                                            {/* Delete icon and status dropdown */}
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                                                {/* Delete icon and initials */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    {/* Delete icon */}
                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>

                                                    {/* Initials in a circle */}
                                                    {task.assigned_to && (
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                bgcolor: getRandomColor()
                                                            }}
                                                        >
                                                            {getInitials(task.assigned_to, users)}
                                                        </Avatar>
                                                    )}
                                                </Box>

                                                {/* Status dropdown */}
                                                <StatusDropdown task={task} handleStatusChange={handleStatusChange} />
                                            </Box>
                                        </CardActions>
                                    </Card>
                                ))}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
                <Modal open={open} onClose={handleClose}>
                    <Box sx={style}>
                        <Typography variant="h6" component="div" gutterBottom>
                            {editingTask ? 'Edit Task' : 'Create Task'}
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Title"
                                        name="title"
                                        fullWidth
                                        margin="normal"
                                        value={taskData.title}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        label="Description"
                                        name="description"
                                        fullWidth
                                        margin="normal"
                                        value={taskData.description}
                                        onChange={handleChange}
                                        multiline
                                        rows={11}
                                        sx={{ marginBottom: '19px' }}
                                    />
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="assigned-by-label">Assigned By</InputLabel>
                                        <Select
                                            labelId="assigned-by-label"
                                            id="assigned_by"
                                            name="assigned_by"
                                            value={taskData.assigned_by}
                                            label="Assigned by"
                                            onChange={handleChange}
                                        >
                                            {users.map((item) => (
                                                <MenuItem key={item._id} value={item._id}>
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Resource Link"
                                        name="link"
                                        fullWidth
                                        margin="normal"
                                        value={taskData.link || 'https://'}
                                        onChange={handleChange}
                                        pattern="https://.*"
                                    />
                                    <TextField
                                        label="Tags"
                                        name="tags"
                                        fullWidth
                                        margin="normal"
                                        value={taskData.tags}
                                        onChange={handleChange}
                                    />
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="status-label">Status</InputLabel>
                                        <Select
                                            labelId="status-label"
                                            id="status"
                                            name="status"
                                            value={taskData.status || 1}
                                            label="Status"
                                            onChange={handleChange}
                                        >
                                            {Object.entries(statusColumns).map(([statusValue, columnName]) => (
                                                <MenuItem key={statusValue} value={statusValue}>
                                                    {columnName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="group-label">Group</InputLabel>
                                        <Select
                                            labelId="group-label"
                                            id="group"
                                            name="group"
                                            value={taskData.group || ''}
                                            label="Group"
                                            onChange={handleChange}
                                        >
                                            {groups.map((group) => (
                                                <MenuItem key={group._id} value={group._id}>
                                                    {group.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="visibility-label">Visibility</InputLabel>
                                        <Select
                                            labelId="visibility-label"
                                            id="visibility"
                                            name="visibility"
                                            value={taskData.visibility}
                                            label="Visibility"
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="private">Private</MenuItem>
                                            <MenuItem value="group">Group</MenuItem>
                                            <MenuItem value="public">Public</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="assigned-to-label">Assigned To</InputLabel>
                                        <Select
                                            labelId="assigned-to-label"
                                            id="assigned_to"
                                            name="assigned_to"
                                            value={taskData.assigned_to}
                                            label="Assigned to"
                                            onChange={handleChange}
                                        >
                                            {users.map((item) => (
                                                <MenuItem key={item._id} value={item._id}>
                                                    {item.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Button type="submit" variant="contained" color="primary">
                                {editingTask ? 'Update Task' : 'Create Task'}
                            </Button>
                        </form>
                    </Box>
                </Modal>
            </Container >
        </>
    );
}

export default Task;