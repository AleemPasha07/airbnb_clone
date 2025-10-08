const path = require("path");
const express = require("express");
const storeRouter = require("./routes/storeRoutes");
const hostRouter = require("./routes/hostRoutes");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const multer = require("multer");
const errorsController = require("./controllers/errors");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const DB_PATH =
  "mongodb+srv://Mongodb:Mongodb@database.emlc7l2.mongodb.net/airbnb?retryWrites=true&w=majority&appName=DataBase";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const store = new MongoDbStore({
  uri: DB_PATH,
  collection: "sessions",
});

const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOption = {
  storage,
  fileFilter,
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer(multerOption).single("photo"));
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads", express.static(path.join(rootDir, "uploads")));

app.use(
  session({
    secret: "Node js and express js",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// inject globals into all views
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.user = req.session.user || null;
  next();
});

app.use(authRouter);
app.use(storeRouter);

// protect /host routes
app.use("/host", (req, res, next) => {
  if (req.session.isLoggedIn) {
    return next();
  }
  res.redirect("/login");
});

app.use("/host", hostRouter);

// catch-all 404
app.use(errorsController.pageNotFound);

const PORT = 3001;

mongoose
  .connect(DB_PATH, {
    serverSelectionTimeoutMS: 10000,
    tls: true,
  })
  .then(() => {
    console.log("✅ connected to mongo");
    app.listen(PORT, () =>
      console.log(`🚀 server running http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Error while connecting to mongo", err);
  });
