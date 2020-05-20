const { Router } = require('express');
const router = Router();
const Log = require('./../models/log');
const axios = require('axios');

router.get('/:userId/folder', (req, res, next) => {
  Log.find()
    .then((months) => {
      res.render('folder', { months });
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/:userId/folder/create', (req, res, next) => {
  const { month, year } = req.body;
  Log.create({
    name: month,
    year,
    userId: req.user._id,
  })
    .then((newDoc) => {
      res.redirect('/' + req.user._id + '/folder');
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:userId/folder/:monthId', (req, res, next) => {
  const { userId, monthId } = req.params;
  Log.findOne({ userId, _id: monthId })
    .then((month) => {
      res.render('folder/month', { month });
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/:userId/folder/:monthId/createlog', (req, res, next) => {
  const { userId, monthId } = req.params;
  const day = req.body.day;
  Log.findOne({ userId, _id: monthId })
    .then((month) => {
      month.day.push({
        name: day,
      });
      month.save();
      console.log(month);
      res.redirect('/' + req.user._id + '/folder/' + monthId);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:userId/folder/:monthId/:logname', (req, res, next) => {
  const { userId, monthId, logname } = req.params;
  Log.findOne({ userId, _id: monthId })
    .then((month) => {
      const dayLog = month.day.find((d) => {
        return d.name === logname;
      });
      console.log(dayLog.foods);
      res.render('folder/log', { dayLog, monthId });
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/:userId/folder/:monthId/:logname/add', (req, res, next) => {
  const { monthId, logname } = req.params;
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
      console.log(results.data.hints);
      const foodData = results.data.hints;
      res.render('folder/add', { foodData, nextPage, monthId, logname });
    })
    .catch((error) => {
      next(error);
    });

  //
});

router.post('/:userId/folder/:monthId/:logname/add*', (req, res, next) => {
  console.log('entrou');
  const { amount, Kcal, prot, carb, fat, name } = req.body;
  const { userId, monthId, logname } = req.params;
  Log.findOne({ userId, _id: monthId })
    .then((doc) => {
      const dayIndex = doc.day.findIndex((d) => {
        return d.name === logname;
      });

      const foodLog = {
        name,
        amount,
        nutrients: {
          Kcal: (Kcal / 100) * amount,
          prot: (prot / 100) * amount,
          carb: (carb / 100) * amount,
          fat: (fat / 100) * amount,
        },
      };
      doc.totalKcal += (Kcal / 100) * amount;
      doc.totalProtein += (prot / 100) * amount;
      doc.totalCarbs += (carb / 100) * amount;
      doc.totalFat += (fat / 100) * amount;

      doc.day[dayIndex].totalKcal += (Kcal / 100) * amount;
      doc.day[dayIndex].totalProtein += (prot / 100) * amount;
      doc.day[dayIndex].totalCarbs += (carb / 100) * amount;
      doc.day[dayIndex].totalFat += (fat / 100) * amount;

      doc.day[dayIndex].foods.push(foodLog);
      doc.save();
      res.redirect('/' + req.user._id + '/folder/' + monthId + '/' + logname);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
