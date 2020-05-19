'use strict';

const { Router } = require('express');
const router = new Router();
const axios = require('axios');
//const Log = require('./../models/log');
const User = require('./../models/user');
const routeGuard = require('./../middleware/route-guard');

router.get('/daily', routeGuard, (req, res, next) => {
  const userAge = res.locals.user.age;
  const userGender = res.locals.user.gender;
  let recommendedCalories;
  switch (true) {
    case userAge > 1 && userAge < 4:
      recommendedCalories = userGender === 'male' ? 1200 : 1000;
      break;
  }
  res.render('profile/daily', { recommendedCalories });
});

router.get('/monthly', routeGuard, (req, res, next) => {
  res.render('profile/monthly');
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
    res.redirect('/profile/daily');
  });
});

module.exports = router;
