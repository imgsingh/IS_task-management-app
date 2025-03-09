const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));
app.use(express.json());

const crypto = require('crypto');



// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiration: Date,
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    link: { type: String },
    tags: [{ type: String }],
    visibility: { type: String, enum: ['private', 'group', 'public'], default: 'private' },
    completed: { type: Boolean, default: false },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Group = mongoose.model('Group', groupSchema);

// API Routes

// User Authentication Routes (Signup, Login, Forgot Password, Reset Password, Verify, Logout)

app.post("/api/users/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ username: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `
                <p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <a href="${process.env.FRONTEND_URL}/reset-password/${token}">${process.env.FRONTEND_URL}/reset-password/${token}</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        res.status(500).json({ message: "Failed to send reset email" });
    }
});

// Reset Password Route
app.post('/api/users/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/users/signup', async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, username, password: hashedPassword });
        await newUser.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: username,
            subject: 'Welcome to Task Management App By Group X',
            text: `Welcome, ${name}! Your account has been created successfully.`,
        };

        await transporter.sendMail(mailOptions);
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
        res.status(201).json({ token, userId: newUser._id });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });
        res.json({ token, userId: user._id });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/users/verify', (req, res) => {
    try {
        const cookieHeader = req.headers.cookie;
        const cookies = cookieHeader.split('; ');
        let token = null;
        for (const cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name === 'jwt') {
                token = value;
                break;
            }
        }
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        User.findById(decodedToken.userId)
            .then(user => {
                if (!user) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                res.json({ message: 'JWT is valid', userId: decodedToken.userId });
            })
            .catch(error => {
                console.error('Error finding user:', error);
                res.status(500).json({ message: 'Server error' });
            });
    } catch (error) {
        console.error('Error verifying JWT:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.get('/api/users/logout', (req, res) => {
    try {
        res.clearCookie('jwt', { httpOnly: true, maxAge: 0 });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    try {
        const cookieHeader = req.headers.cookie;
        const cookies = cookieHeader.split('; ');
        let token = null;
        for (const cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name === 'jwt') {
                token = value;
                break;
            }
        }
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

app.put('/api/users/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, username } = req.body;

        // Find the user and check if the authenticated user is the same user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user._id.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
        }

        // Update the user
        user.name = name;
        user.username = username;
        const updatedUser = await user.save();

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

app.get('/api/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({}); // Fetch only name and username
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Task Management Routes
app.get('/api/tasks', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.userId });
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
    try {
        const { title, description, link, tags, visibility, group } = req.body;

        // Validation: Check if group is provided
        if (!group) {
            return res.status(400).json({ message: 'Group is required' });
        }

        const newTask = new Task({
            title,
            description,
            link,
            tags,
            visibility,
            group,
            owner: req.userId,
        });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Failed to create task' });
    }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, link, tags, visibility, completed, group } = req.body;
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.userId },
            { title, description, link, tags, visibility, completed, group },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(updatedTask);

    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Failed to update task' });
    }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task' });
    }
});

// Group Management Routes
app.get('/api/groups', authMiddleware, async (req, res) => {
    try {
        const groups = await Group.find({ $or: [{ owner: req.userId }, { members: req.userId }] });
        res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
});

app.post('/api/groups', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        const newGroup = new Group({ name, owner: req.userId, members: [req.userId] });
        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Failed to create group' });
    }
});

app.put('/api/groups/:id', authMiddleware, async (req, res) => {
    try {
        const groupId = req.params.id;
        const { name, members } = req.body;

        // Find the group and check if the user is the owner
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden: Only the owner can update the group' });
        }

        // Update the group
        group.name = name;
        group.members = members;
        const updatedGroup = await group.save();

        res.json(updatedGroup);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Failed to update group' });
    }
});

// Delete a group (protected route)
app.delete('/api/groups/:id', authMiddleware, async (req, res) => {
    try {
        const groupId = req.params.id;

        // Find the group and check if the user is the owner
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (group.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden: Only the owner can delete the group' });
        }

        // Delete the group
        await Group.findByIdAndDelete(groupId);

        await Task.deleteMany({ group: groupId });

        res.json({ message: 'Group deleted' });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Failed to delete group' });
    }
});

// Add other group management routes (update, delete, invite/remove users) as needed


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));