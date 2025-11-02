//authentication check if admin ba naka-login
const isAdmin = async (req, res, next) => {
    if (req.user && req.user.userType === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};

export default isAdmin;
