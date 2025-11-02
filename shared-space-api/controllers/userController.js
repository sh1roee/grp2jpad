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
        const updatedUser = await User.findOneAndUpdate(
            { email: req.body.email },
            {
                username: req.body.username,
                userType: req.body.userType,
                password: req.body.password,
                profilePicture: req.body.profilePicture,
                streakCount: req.body.streakCount,
                badges: req.body.badges,
                friends: req.body.friends
            },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        res.status(200).json(updatedUser);
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
