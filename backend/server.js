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
  origin: 'http://localhost:3001', // Allow requests from this origin
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());

const crypto = require('crypto');
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
app.post("/api/users/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a unique token
    const token = crypto.randomBytes(32).toString("hex");

    // Save the token to the user's document with an expiration time (e.g., 1 hour)
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email (using Nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'gbasra09@gmail.com',
        pass: 'Gursimran1!',
      },
    });

    const mailOptions = {
      from: "gbasra09@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <a href="<span class="math-inline">\{config\.frontendUrl\}/reset\-password/</span>{token}"><span class="math-inline">\{config\.frontendUrl\}/<14\>reset\-password/</span>{token}</a>
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
    res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });
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