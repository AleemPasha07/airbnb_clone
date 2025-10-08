const Home = require("../models/home");
const fs = require("fs");

exports.getAddHome = (req, res) => {
  res.render("host/edit-home", {
    title: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false
  });
};
exports.getEditHome = (req, res) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found for editing");
      return res.redirect("/host/host-home-list");
    }
    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      title: "Edit your Home",
      currentPage: "host-home",
      editing: editing
    });
  });
};

exports.getHostHomes = (req, res) => {
  Home.find().then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      title: "Host Homes List",
      currentPage: "host-homes"
    });
  });
};

exports.postAddHome = (req, res) => {
  const { houseName, price, location, rating } = req.body;
  if (!req.file) {
    console.log("No file uploaded");
    return res.redirect("/host/add-home");
  }

  const photo = req.file.path;

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
  });
  home.save().then(() => {
    console.log("Home added successfully");
    res.redirect("/host/host-home-list");
  });
};

exports.postEditHome = (req, res) => {
  const { id, houseName, price, location, rating } = req.body;

  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;

      if (req.file) {
        fs.unlink(home.photo, (err) => {
          if (err) {
            console.log("Error while deleting", err);
          }
        });
        home.photo = req.file.path;
      }

      home
        .save()
        .then((result) => {
          console.log("Home Updated", result);
        })
        .catch((err) => {
          console.log("Error while Updating", err);
        });
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("Error while finding home", err);
    });
};

exports.postDeleteHome = (req, res) => {
  const homeId = req.params.homeId;
  console.log("Came to delete ", homeId);
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error while deleting ", error);
    });
};
