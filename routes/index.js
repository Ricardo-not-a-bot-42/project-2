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
  const direction = req.query.direction;
  const nextPage = Math.max(0, Number(req.query.session) + Number(direction));
  console.log(req.query.session);
  axios
    .get(
      `https://api.edamam.com/api/food-database/parser?session=${nextPage *
        44}&ingr=${searchTerm}&app_id=${process.env.EDAMAM_APP_ID}&app_key=${
        process.env.EDAMAM_APP_KEY
      }`
    )

    .then((results) => {
      console.log(results.data.hints[0]);
      const foodData = results.data.hints;
      const searchTerm = results.data.text;
      res.render('search-results', { foodData, searchTerm, nextPage });
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/food/:id', (req, res, next) => {
  const foodId = req.params.id;
  const data = {
    ingredients: [
      {
        quantity: 1,
        measureURI: 'http://www.edamam.com/ontologies/edamam.owl#Measure_unit',
        foodId: foodId,
      },
    ],
  };
  axios
    .post(
      `https://api.edamam.com/api/food-database/nutrients?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`,
      data
    )
    .then((result) => {
      const foodDetails = result.data;
      const foodInfo = result.data.ingredients[0].parsed[0];
      console.log(result.data);
      res.render('single-view', { foodDetails, foodInfo });
    });
});

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = router;
