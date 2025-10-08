const { check, validationResult } = require("express-validator");
const User = require("../models/user");
bcrypt = require('bcryptjs');


exports.getLogin = (req, res) => {
    res.render('auth/login', {
        title: "Login",
        currentPage: 'login',
        errors: [],
        oldInput: { email: "" },
        // isLoggedIn: false,
        // user: {}
    });
}

exports.getSignup = (req, res) => {
    res.render('auth/signup', {
        title: "Signup",
        currentPage: 'signup',
        // isLoggedIn: false,
        errors: [],
        oldInput: { firstName: "", lastName: "", email: "", userType: "" },
        // user: {}
    });
}

exports.postSignup = [
    check("firstName")
        .trim()
        .isLength({ min: 2 })
        .withMessage("First Name should be atleast 2 characters long")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("First Name should contain only alphabets"),

    check("lastName")
        .matches(/^[A-Za-z\s]*$/)
        .withMessage("Last Name should contain only alphabets"),

    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    check("password")
        .isLength({ min: 8 })
        .withMessage("Password should be atleast 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password should contain atleast one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password should contain atleast one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password should contain atleast one number")
        .matches(/[!@&]/)
        .withMessage("Password should contain atleast one special character")
        .trim(),

    check("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    check("userType")
        .notEmpty()
        .withMessage("Please select a user type")
        .isIn(['guest', 'host'])
        .withMessage("Invalid user type"),

    check("terms")
        .notEmpty()
        .withMessage("Please accept the terms and conditions")
        .custom((value, { req }) => {
            if (value !== "on") {
                throw new Error("Please accept the terms and conditions");
            }
            return true;
        }),

       async (req, res) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        title: "Signup",
        currentPage: "signup",
        errors: errors.array().map(err => err.msg),
        oldInput: { firstName, lastName, email, password, userType }
      });
    }

    try {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(422).render("auth/signup", {
          title: "Signup",
          currentPage: "signup",
          errors: ["Email already registered"],
          oldInput: { firstName, lastName, email, userType }
        });
      }

      const hashedPw = await bcrypt.hash(password, 12);
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPw,
        userType
      });
      await user.save();

      return res.redirect("/login");
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).render("auth/signup", {
        title: "Signup",
        currentPage: "signup",
        errors: ["Something went wrong. Please try again."],
        oldInput: { firstName, lastName, email, userType }
      });
    }
  }
];

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(422).render("auth/login", {
      title: "Login",
      currentPage: "login",
      errors: ["User does not exist"],
      oldInput: { email }
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      title: "Login",
      currentPage: "login",
      errors: ["Invalid Password"],
      oldInput: { email }
    });
  }

  req.session.isLoggedIn = true;
  req.session.user = {
    id: user._id,
    firstName: user.firstName,
    email: user.email,
    userType: user.userType
  };

  req.session.save(err => {
    if (err) console.log("Session save error:", err);
    res.redirect("/");
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};