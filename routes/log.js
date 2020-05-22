const { Router } = require("express");
const router = Router();
const Log = require("./../models/log");
const axios = require("axios");
const routeGuard = require("./../middleware/route-guard");

router.get("/:userId/folder", routeGuard, (req, res, next) => {
  const userId = req.params.userId;
  Log.find({ userId })
    .then((months) => {
      res.render("folder", { months });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/:userId/folder/create", routeGuard, (req, res, next) => {
  const { month, year } = req.body;
  const userId = req.user._id;
  Log.findOne({ name: month, year, userId })
    .then((doc) => {
      if (doc) {
        return Promise.resolve();
      } else {
        return Log.create({
          name: month,
          year,
          userId: req.user._id,
        });
      }
    })
    .then((newDoc) => {
      res.redirect("/" + req.user._id + "/folder");
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/:userId/folder/:monthId", routeGuard, (req, res, next) => {
  const { userId, monthId } = req.params;
  Log.findOne({ userId, _id: monthId })
    .then((month) => {
      month.day.sort((a, b) => b.name - a.name);
      res.render("folder/month", { month });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/:userId/folder/:monthId/delete", routeGuard, (req, res, next) => {
  const { userId, monthId } = req.params;
  Log.findOneAndRemove({ userId, _id: monthId })
    .then((month) => {
      res.redirect("/" + req.user._id + "/folder/");
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/:userId/folder/:monthId/createlog", routeGuard, (req, res, next) => {
  const { userId, monthId } = req.params;
  const day = req.body.day;
  Log.findOne({ userId, _id: monthId })
    .then((month) => {
      const exists = month.day.some((d) => {
        console.log(d.name, day);
        return d.name == day;
      });

      if (exists) {
        return Promise.resolve();
      } else {
        month.day.push({
          name: day,
        });
        return month.save();
      }
    })
    .then(() => {
      res.redirect("/" + req.user._id + "/folder/" + monthId);
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/:userId/folder/:monthId/:logname/delete", routeGuard, (req, res, next) => {
  const { userId, monthId, logname } = req.params;
  Log.findOne({ userId, _id: monthId })
    .then((doc) => {
      const dayIndex = doc.day.findIndex((d) => {
        return d.name === logname;
      });

      doc.day.splice(dayIndex, 1);
      return doc.save();
    })
    .then(() => {
      res.redirect("/" + req.user._id + "/folder/" + monthId);
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/:userId/folder/:monthId/:logname", routeGuard, (req, res, next) => {
  const { userId, monthId, logname } = req.params;
  Log.findOne({ userId, _id: monthId })
    .then((month) => {
      const dayLog = month.day.find((d) => {
        return d.name === logname;
      });
      console.log(dayLog.foods);

      res.render("folder/log", { dayLog, monthId, userId, month });
    })
    .catch((err) => {
      next(err);
    });
});

router.get("/:userId/folder/:monthId/:logname/add", (req, res, next) => {
  const { monthId, logname } = req.params;
  const searchTerm = req.query.name;
  const direction = req.query.direction;
  const nextPage = Math.max(0, Number(req.query.session) + Number(direction));
  console.log(req.query.session);
  axios
    .get(
      `https://api.edamam.com/api/food-database/parser?session=${nextPage * 44}&ingr=${searchTerm}&app_id=${
        process.env.EDAMAM_APP_ID
      }&app_key=${process.env.EDAMAM_APP_KEY}`
    )

    .then((results) => {
      console.log(results.data.hints);
      const foodData = results.data.hints;
      res.render("folder/add", { searchTerm, foodData, nextPage, monthId, logname });
    })
    .catch((error) => {
      next(error);
    });

  //
});

router.post("/:userId/folder/:monthId/:logname/add*", routeGuard, (req, res, next) => {
  console.log("entrou");
  const { amount, Kcal, prot, carb, fat, name, category, pictureUrl } = req.body;
  const { userId, monthId, logname } = req.params;
  Log.findOne({ userId, _id: monthId })
    .then((doc) => {
      const dayIndex = doc.day.findIndex((d) => {
        return d.name === logname;
      });

      const foodLog = {
        name,
        amount,
        category,
        pictureUrl,
        nutrients: {
          Kcal: Math.round((Kcal / 100) * amount),
          prot: Math.round((prot / 100) * amount),
          carb: Math.round((carb / 100) * amount),
          fat: Math.round((fat / 100) * amount),
        },
      };
      doc.totalKcal += Math.round((Kcal / 100) * amount);
      doc.totalProtein += Math.round((prot / 100) * amount);
      doc.totalCarbs += Math.round((carb / 100) * amount);
      doc.totalFat += Math.round((fat / 100) * amount);

      doc.day[dayIndex].totalKcal += Math.round((Kcal / 100) * amount);
      doc.day[dayIndex].totalProtein += Math.round((prot / 100) * amount);
      doc.day[dayIndex].totalCarbs += Math.round((carb / 100) * amount);
      doc.day[dayIndex].totalFat += Math.round((fat / 100) * amount);

      doc.day[dayIndex].foods.push(foodLog);
      return doc.save();
    })
    .then(() => {
      res.redirect("/" + req.user._id + "/folder/" + monthId + "/" + logname);
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/:userId/folder/:monthId/:logname/:foodId/delete", routeGuard, (req, res, next) => {
  const { userId, monthId, logname, foodId } = req.params;
  Log.findOne({ userId, _id: monthId })
    .then((doc) => {
      const dayIndex = doc.day.findIndex((d) => {
        return d.name === logname;
      });

      const foodIndex = doc.day[dayIndex].foods.findIndex((food) => {
        return food._id == foodId;
      });

      console.log(foodIndex, dayIndex);

      doc.day[dayIndex].foods.splice(foodIndex, 1);
      return doc.save();
    })
    .then(() => {
      res.redirect("/" + req.user._id + "/folder/" + monthId + "/" + logname);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;

