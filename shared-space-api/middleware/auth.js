import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

//verify token (bearer galing sa backend)
const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided." });
    }

    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};

//register user
const registerUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            userID: new mongoose.Types.ObjectId(), 
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: 'User created successfully.',
            userID: newUser.userID
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Error signing up.' });
    }
};

//login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Invalid email or password." });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: "Invalid email or password." });

        if (user.userType === "blocked") {
            return res.status(403).json({ error: "Your account has been blocked." });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, userType: user.userType },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Logged in successfully!",
            token,
            email: user.email,
            userType: user.userType
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in.' });
    }
};

//get registered users
const getRegisteredUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch {
        res.status(500).json({ error: 'Unable to get users.' });
    }
};

export { 
    registerUser, loginUser, getRegisteredUsers, verifyToken 
};
