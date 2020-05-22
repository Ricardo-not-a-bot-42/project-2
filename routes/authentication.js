'use strict';

const { Router } = require('express');

const bcryptjs = require('bcryptjs');
const User = require('./../models/user');

const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = cloudinaryStorage({
  cloudinary,
  folder: 'ih-project-2',
});

const uploader = multer({ storage });

const router = new Router();

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', uploader.single('picture'), (req, res, next) => {
  const { name, email, password, age, gender } = req.body;
  const picture = req.file.url;
  bcryptjs
    .hash(password, 10)
    .then((hash) => {
      return User.create({
        name,
        email,
        age,
        gender,
        passwordHash: hash,
        profilePic: picture,
      });
    })
    .then((user) => {
      req.session.user = user._id;
      res.redirect('/profile');
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/sign-in', (req, res, next) => {
  res.render('sign-in');
});

router.post('/sign-in', (req, res, next) => {
  let user;
  const { email, password } = req.body;
  User.findOne({ email })
    .then((document) => {
      if (!document) {
        return Promise.reject(new Error("There's no user with that email."));
      } else {
        user = document;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then((result) => {
      if (result) {
        req.session.user = user._id;
        res.redirect('/profile');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
