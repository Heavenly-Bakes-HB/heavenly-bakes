module.exports = (req, res, next) => {
    const role = req.user?.role;

    if (role === 'ADMIN' || role === 'OWNER') {
        return next();
    }

    return res.status(403).json({
        message: 'Admin permissions required'
    });
};
