exports.pageNotFound = (req, res, next) => {
    console.log(req.url, req.method);
    res.status(404).render("404", {
        title: "404 - Page Not Found",
        currentPage: '404',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
    });
};