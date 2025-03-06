import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Checkbox,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        resourceLink: '',
        annotations: [],
        visibility: 'private',
    });
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/api/tasks');
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    },);

    const handleTaskChange = (event) => {
        setNewTask({
            ...newTask,
            [event.target.name]: event.target.value,
        });
    };

    const handleAnnotationChange = (event) => {
        setNewTask({
            ...newTask,
            annotations: event.target.value,
        });
    };

    const handleCreateTask = async () => {
        try {
            await axios.post('/api/tasks', newTask);
            setNewTask({
                title: '',
                description: '',
                resourceLink: '',
                annotations: [],
                visibility: 'private',
            });
            // Re-fetch tasks after creating
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
    };

    const handleUpdateTask = async (taskId) => {
        try {
            await axios.put(`/api/tasks/${taskId}`, editingTask);
            setEditingTask(null);
            // Re-fetch tasks after updating
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`/api/tasks/${taskId}`);
            // Re-fetch tasks after deleting
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            await axios.put(`/api/tasks/${task._id}`, { completed: !task.completed });
            // Re-fetch tasks after toggling
        } catch (error) {
            console.error('Error toggling task completion:', error);
        }
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Tasks
            </Typography>
            <List>
                {tasks.map((task) => (
                    <ListItem key={task._id}>
                        <Checkbox
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task)}
                        />
                        <ListItemText
                            primary={task.title}
                            secondary={task.description}
                        />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => handleEditTask(task)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteTask(task._id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
            {/* Form for creating new task */}
            <Typography variant="h6" gutterBottom>
                Create New Task
            </Typography>
            <TextField
                label="Title"
                name="title"
                value={newTask.title}
                onChange={handleTaskChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Description"
                name="description"
                value={newTask.description}
                onChange={handleTaskChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Resource Link"
                name="resourceLink"
                value={newTask.resourceLink}
                onChange={handleTaskChange}
                fullWidth
                margin="normal"
            />
            <FormControl fullWidth margin="normal">
                <InputLabel id="annotations-label">Annotations (Tags)</InputLabel>
                <Select
                    labelId="annotations-label"
                    id="annotations"
                    multiple
                    value={newTask.annotations}
                    onChange={handleAnnotationChange}
                    //input={<TextField />}
                    renderValue={(selected) => selected.join(', ')}
                >
                    {['important', 'project X', 'urgent'].map((tag) => (
                        <MenuItem key={tag} value={tag}>
                            {tag}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel id="visibility-label">Visibility</InputLabel>
                <Select
                    labelId="visibility-label"
                    id="visibility"
                    value={newTask.visibility}
                    onChange={handleTaskChange}
                    label="Visibility"
                    name="visibility"
                >
                    <MenuItem value="private">Private</MenuItem>
                    <MenuItem value="group">Group</MenuItem>
                    <MenuItem value="public">Public</MenuItem>
                </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleCreateTask}>
                Create Task
            </Button>
            {/* Form for editing existing task (conditionally render) */}
            {editingTask && (
                <div>
                    <Typography variant="h6" gutterBottom>
                        Edit Task
                    </Typography>
                    {/* Similar form fields as create task, but pre-filled with editingTask data */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateTask(editingTask._id)}
                    >
                        Update Task
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Tasks;