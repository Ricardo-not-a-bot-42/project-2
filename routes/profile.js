'use strict';

const { Router } = require('express');
const router = new Router();
const axios = require('axios');
const Log = require('./../models/log');
const User = require('./../models/user');
const routeGuard = require('./../middleware/route-guard');

router.get('/', routeGuard, (req, res, next) => {
  res.render('profile/profile');
});

router.get('/daily', routeGuard, (req, res, next) => {
  let selectedDay;
  let selectedMonth;
  const dateDetails = {
    year: req.query.year,
    month: req.query.month,
    day: req.query.day,
  };
  Log.findOne({ name: dateDetails.month, year: dateDetails.year })
    .then((result) => {
      selectedMonth = result;
      for (let day of result.day) {
        if (Number(day.name) === Number(dateDetails.day)) {
          selectedDay = day;
        }
      }
      if (!selectedDay) {
        throw new Error('Log not found');
      }
      const userAge = res.locals.user.age;
      const userGender = res.locals.user.gender;
      let recommendedCalories;
      switch (true) {
        case userAge > 1 && userAge < 4:
          recommendedCalories = 1200;
          break;
        case userAge > 3 && userAge < 9:
          recommendedCalories = 1400;
          break;
        case userAge > 8 && userAge < 14:
          recommendedCalories = userGender === 'male' ? 2000 : 1800;
          break;
        case userAge > 13 && userAge < 19:
          recommendedCalories = userGender === 'male' ? 2600 : 2000;
          break;
        case userAge > 18 && userAge < 31:
          recommendedCalories = userGender === 'male' ? 2800 : 2200;
          break;
        case userAge > 30 && userAge < 51:
          recommendedCalories = userGender === 'male' ? 2600 : 2000;
          break;
        case userAge > 50:
          recommendedCalories = userGender === 'male' ? 2400 : 1800;
          break;
      }
      res.render('profile/daily', {
        selectedDay,
        selectedMonth,
        recommendedCalories,
      });
    })
    .catch((error) => {
      next(new Error('Log not found'));
    });
});

router.get('/monthly', routeGuard, (req, res, next) => {
  let selectedMonth;
  const dateDetails = {
    year: req.query.year,
    month: req.query.month,
  };
  Log.findOne({ name: dateDetails.month, year: dateDetails.year })
    .then((result) => {
      selectedMonth = result;
      res.render('profile/monthly', {
        selectedMonth,
      });
    })
    .catch((error) => {
      next(new Error('Log not found'));
    });
});

router.get('/edit', routeGuard, (req, res, next) => {
  res.render('profile/edit-profile');
});

router.post('/edit', routeGuard, (req, res, next) => {
  const userId = res.locals.user._id;
  const updatedDetails = {
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
    gender: req.body.gender,
  };
  User.findByIdAndUpdate(userId, updatedDetails).then(() => {
    res.redirect('/profile');
  });
});

module.exports = router;
