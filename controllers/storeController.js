const Home = require("../models/home");
const User = require("../models/user");

exports.getIndex = (req, res) => {
  Home.find().then(registeredHomes => {
    res.render("store/index", {
      title: "Airbnb Home",
      currentPage: "index",
      registeredHomes
    });
  });
};

exports.getHomes = (req, res) => {
  Home.find().then(registeredHomes => {
    res.render("store/home-list", {
      title: "Homes List",
      currentPage: "home",
      registeredHomes
    });
  });
};

exports.getBookings = (req, res) => {
  res.render("store/bookings", {
    title: "My bookings",
    currentPage: "bookings"
  });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user.id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favourite-list", {
    title: "My Favourites",
    currentPage: "favourite-list",
    favouriteHomes: user.favourites
  });
};

exports.postAddToFavouriteList = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user.id;
  const user = await User.findById(userId);

  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourite-list");
};

exports.postRemoveFromFavouriteList = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user.id;
  const user = await User.findById(userId);

  user.favourites = user.favourites.filter(fav => fav.toString() !== homeId);
  await user.save();

  res.redirect("/favourite-list");
};

exports.getHomeDetails = (req, res) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then(home => {
    if (!home) {
      return res.redirect("/homes");
    }
    res.render("store/home-detail", {
      title: "Home Details",
      currentPage: "home",
      home
    });
  });
};