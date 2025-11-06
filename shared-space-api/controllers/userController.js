import bcrypt from "bcrypt";
import User from "../models/User.js";

// find all user
const findAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Server error');
    }
};

// find user by email
const findByUserEmail = async (req, res, next) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).send('Email is required');
    }
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (err) {
        console.error('Error fetching user by email:', err);
        res.status(500).send('Server error');
    }
};

// delete user by email
const deleteUser = async (req, res, next) => {
    try {
        const dUser = await User.findOneAndDelete({ email: req.body.email });
        if (!dUser) {
           return res.status(404).send('User not found');
        }
        return res.status(200).send(`Successfully deleted user with email: ${dUser.email}`);
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Unable to delete user');
    }
};

// update user by email
const updateUser = async (req, res, next) => {
    try {
        // Not all fields included, only those that can be modified by users
        const { username, profilePicture, password } = req.body;
        
        // create an object to hold only the fields to update
        const fieldsToUpdate = {};

        if (username) {
            fieldsToUpdate.username = username;
        }
        if (profilePicture) {
            fieldsToUpdate.profilePicture = profilePicture;
        }
        // If a new password is provided, rehash again
        if (password) {
            fieldsToUpdate.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: req.body.email },
            { $set: fieldsToUpdate },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        // Password removed for the response
        const userResponse = {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture
        };
        res.status(200).json(userResponse);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: "Unable to update user", error: err.message });
    }
};

// find the current logged in user 
const findCurrentUser = async (req, res) => {
    try {
        console.log('Req User (from JWT):', req.user); 
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }
        const userId = req.user.userId;
        const user = await User.findById(userId).select('username email userType');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Failed to fetch user.', error: error.message });
    }
};

export { 
    findAllUsers, findByUserEmail, deleteUser, updateUser, findCurrentUser 
};
