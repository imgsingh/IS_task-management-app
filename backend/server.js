const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// const crypto = require('crypto');
// const secretKey = crypto.randomBytes(64).toString('hex');
// console.log(secretKey);

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
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  resourceLink: { type: String },
  annotations: [{ type: String }],
  visibility: { type: String, enum: ['private', 'group', 'public'], default: 'private' },
  completed: { type: Boolean, default: false },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Reference to Group model
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

// User Authentication Routes (Signup, Login)
// API Route for User Signup
app.post('/api/users/signup', async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT
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

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/verify', (req, res) => {
  try {
    // Get the token from the cookies
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

    // Verify the token using your JWT_SECRET
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user ID exists in the database (optional)
    User.findById(decodedToken.userId)
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        // User is authenticated and session is valid
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
    // Clear the JWT cookie
    res.clearCookie('jwt', { httpOnly: true, maxAge: 0 }); // Set maxAge to 0 to expire the cookie immediately

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Task Management Routes (Create, Edit, Delete, Mark as Complete)
// ... (Implement CRUD operations for tasks, including visibility settings)

// Group Management Routes (Create, Edit, Delete, Invite/Remove Users)
// ... (Implement CRUD operations for groups, including membership management)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));