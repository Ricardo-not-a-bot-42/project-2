'use strict';

const { Router } = require('express');
const router = new Router();
const axios = require('axios');
const routeGuard = require('./../middleware/route-guard');

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/search', (req, res, next) => {
  const searchTerm = req.query.name;
  axios
    .get(
      `https://api.edamam.com/api/food-database/parser?ingr=${searchTerm}&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`
    )

    .then((results) => {
      const foodData = results.data.hints;
      res.render('search-results', { foodData });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = router;
