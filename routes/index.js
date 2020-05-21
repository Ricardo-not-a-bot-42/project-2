'use strict';

const { Router } = require('express');
const router = new Router();
const axios = require('axios');
const routeGuard = require('./../middleware/route-guard');

router.get('/', (req, res, next) => {
  if (res.locals.user) {
    res.redirect('/profile');
  } else {
    res.render('index');
  }
});

router.get('/search', (req, res, next) => {
  const searchTerm = req.query.name;
  const direction = req.query.direction;
  const nextPage = Math.max(0, Number(req.query.session) + Number(direction));
  axios
    .get(
      `https://api.edamam.com/api/food-database/parser?session=${nextPage *
        44}&ingr=${searchTerm}&app_id=${process.env.EDAMAM_APP_ID}&app_key=${
        process.env.EDAMAM_APP_KEY
      }`
    )

    .then((results) => {
      const foodData = results.data.hints;
      for (let food of foodData) {
        food.food.nutrients.ENERC_KCAL = food.food.nutrients.ENERC_KCAL.toFixed();
        food.food.nutrients.CHOCDF = food.food.nutrients.CHOCDF.toFixed();
        food.food.nutrients.PROCNT = food.food.nutrients.PROCNT.toFixed();
        food.food.nutrients.FAT = food.food.nutrients.FAT.toFixed();
      }
      console.log(foodData);
      const searchTerm = results.data.text;
      res.render('search-results', {
        foodData,
        searchTerm,
        nextPage,
      });
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
      foodDetails.totalWeight = foodDetails.totalWeight.toFixed();
      let foodNutrientsPerHundred = {};
      let nutrientsDailyPerHundred = {};
      for (let nutrient in foodDetails.totalNutrients) {
        foodNutrientsPerHundred[foodDetails.totalNutrients[nutrient].label] =
          (
            (foodDetails.totalNutrients[nutrient].quantity * 100) /
            foodDetails.totalWeight
          )
            .toFixed(2)
            .toString() + foodDetails.totalNutrients[nutrient].unit;
      }
      for (let nutrient in foodDetails.totalDaily) {
        nutrientsDailyPerHundred[foodDetails.totalDaily[nutrient].label] =
          (
            (foodDetails.totalDaily[nutrient].quantity * 100) /
            foodDetails.totalWeight
          )
            .toFixed(2)
            .toString() + foodDetails.totalDaily[nutrient].unit;
      }
      const healthLabels = [];
      for (let label of foodDetails.healthLabels) {
        healthLabels.push(label.replace(/_/g, ' '));
      }
      const foodInfo = result.data.ingredients[0].parsed[0];
      console.log(result.data);
      res.render('single-view', {
        foodDetails,
        foodInfo,
        foodNutrientsPerHundred,
        nutrientsDailyPerHundred,
        healthLabels,
      });
    });
});

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

module.exports = router;
