// src/components/Tasks.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
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
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'react-toastify';
import Navbar from './Navbar';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function Task() {
    const [tasks, setTasks] = useState([]);
    const [open, setOpen] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        link: '',
        tags: '',
        visibility: 'private',
    });
    const [editingTask, setEditingTask] = useState(null);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        fetchTasks();
        fetchGroups();
    },);

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/groups`, { withCredentials: true });
            setGroups(response.data);
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
            visibility: 'private',
        });
    };

    const handleChange = (event) => {
        setTaskData({ ...taskData, [event.target.name]: event.target.value });
    };

    const handleDescriptionChange = (content, editor) => {
        setTaskData({ ...taskData, description: content });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!taskData.group) {
            toast.error('Please select a group.');
            return;
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
            visibility: task.visibility,
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

    return (
        <>
            <Navbar />
            <Container>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h4" gutterBottom>
                            Tasks
                        </Typography>
                    </Grid>
                    <Grid item><Button variant="contained" color="primary" onClick={handleOpen}>
                        Add Task
                    </Button>
                    </Grid>
                </Grid>
                <Grid container spacing={3} mt={2}>
                    {tasks.map((task) => (
                        <Grid item key={task._id} xs={12} sm={6} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" component="div" sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                        {task.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                        {task.description}
                                    </Typography>
                                    {task.link && (
                                        <Typography variant="body2">
                                            <a href={task.link} target="_blank" rel="noopener noreferrer">
                                                Resource Link
                                            </a>
                                        </Typography>
                                    )}
                                    {task.tags && (
                                        <Typography variant="body2" color="text.secondary">
                                            Tags: {task.tags}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => handleEdit(task)}>
                                        Edit
                                    </Button>
                                    <Button size="small" onClick={() => handleDelete(task._id)}>
                                        Delete
                                    </Button>
                                    <Button size="small" onClick={() => handleToggleComplete(task)}>
                                        {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Modal open={open} onClose={handleClose}>
                    <Box sx={style}>
                        <Typography variant="h6" component="div" gutterBottom>
                            {editingTask ? 'Edit Task' : 'Create Task'}
                        </Typography>
                        <form onSubmit={handleSubmit}>
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
                            />
                            <TextField
                                label="Resource Link"
                                name="link"
                                fullWidth
                                margin="normal"
                                value={taskData.link}
                                onChange={handleChange}
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
                                <InputLabel id="group-label">Group</InputLabel>
                                <Select
                                    labelId="group-label"
                                    id="group"
                                    name="group"
                                    value={taskData.group || ''} // Set initial value to empty string if no group is selected
                                    label="Group"
                                    onChange={handleChange}
                                >
                                    {/* Fetch and display available groups */}
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
                            <Button type="submit" variant="contained" color="primary">
                                {editingTask ? 'Update Task' : 'Create Task'}
                            </Button>
                        </form>
                    </Box>
                </Modal>
            </Container>
        </>
    );
}

export default Task;