const path = require('path');
const express = require('express');
const storeRouter = express.Router();
const storeController = require('../controllers/storeController');

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/bookings", storeController.getBookings);
storeRouter.get("/favourite-list", storeController.getFavouriteList);

storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourite-list", storeController.postAddToFavouriteList);
storeRouter.post("/favourite-list/delete/:homeId", storeController.postRemoveFromFavouriteList);

module.exports = storeRouter;