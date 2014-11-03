var express = require('express');
var authorization = require('../middleware/authorization');
var request = require('request');
var models = require('../models');
var Activity = models.Activity;
var Subscriber = models.Subscriber;
var Update = models.Update;

var activities = express.Router();
var route = '/products/:product/activities';

var COUNT = 10;
var ONE_DAY = 24 * 60 * 60 * 1000;
var MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

activities.use(route, authorization);

activities.route(route)
.get(function activitiesGET(req, res, next) {
  res.status(200).json({
    location: route,
    product: req.params.product
  });
})
.post(function activitiesPOST(req, res, next) {
  var product = req.params.product;
  var token = req.query.token;
  var body = req.body;

  Activity.create({
    product: product,
    webhook_id: body.data.id,
    type: body.data.email_type,
    list_id: body.data.list_id,
    email: body.data.email
  })
  .then(function(activity) {
    checkUpdates(product, token);
    res.status(201).json(activity);
  })
  .catch(function(err) {
    console.error('Activity failed to save.');
    console.log(err);
    res.status(400).json(err);
  });
});

function alertProduct(count, product, token, timestamp) {
  // Assembly-only
  var endpoint = process.env.ASSEMBLY_API + '/products/' + product + '/updates?token=' + token;
  var date = new Date(timestamp);
  var month = MONTHS[date.getMonth()];
  var day = date.getDate();
  var since = month + ' ' + date;
  var message = 'There were ' + count + ' new signups since ' + since + '.';

  request({
    method: 'POST',
    uri: endpoint,
    body: {
      message: message,
      user_token: process.env.ASSEMBLY_AUTHENTICATION_TOKEN
    },
    json: true
  }, function(err, response, body) {
    if (err) {
      return console.log('Error sending message to ' + endpoint);
    }

    console.log(response.statusCode);
    console.log(body);
  });

  alertSubscribers(count, product, timestamp);
}

function alertSubscribers(count, product, timestamp) {
  Subscriber.findAll({ where: { product: product } })
  .then(function(subscribers) {
    subscribers.forEach(function(subscriber) {
      var endpoint = subscriber.get('endpoint');
      var countDays = timestamp > 0 ? Math.floor((Date.now() - timestamp) / ONE_DAY) : 1;
      var days = countDays === 1 ? 'the past day' : 'the past ' + countDays + ' days';
      var message = 'There were ' + count + ' new signups in ' + days + '.';

      request({
        method: 'POST',
        uri: endpoint,
        body: {
          message: message,
          user_token: process.env.ASSEMBLY_AUTHENTICATION_TOKEN
        },
        json: true
      }, function(err, response, body) {
        if (err) {
          return console.log('Error sending message to ' + endpoint);
        }

        console.log(response.statusCode);
        console.log(body);
      });
    });
  })
  .catch(function(error) {
    console.log('Error fetching subscribers.');
    console.error(error);
  });
}

function checkUpdates(product, token) {
  Update.find({ product: product })
  .then(function(update) {
    var now = Date.now();

    if (!update) {
      return countActivitiesSince(product, token);
    }

    if (now - update.get('sent_at') > ONE_DAY &&
        // don't check more than once per day
        now - update.get('checked_at') > ONE_DAY) {
      countActivitiesSince(product, token, update);
    }
  })
  .catch(function(error) {
    console.log('Error fetching update for ' + product);
    console.error(error);
  });
}

function countActivitiesSince(product, token, update) {
  if (!update) {
    update = Update.build({
      product: product,
      sent_at: new Date(0),
      current_count: 0
    });
  }

  var timestamp = update.get('sent_at');

  Activity.findAll({ where: { product: product, created_at: { gte: timestamp } } })
  .then(function(activities) {
    var count = activities.length + update.get('current_count');
    var now = new Date();

    if (count >= COUNT) {
      alertProduct(count, product, token, timestamp);

      return markUpdate(update, {
        sent_at: now,
        current_count: 0
      });
    }

    markUpdate(update, {
      checked_at: now,
      current_count: count
    });
  })
  .catch(function(error) {
    console.log('Error counting activities');
    console.error(error);
  });
}

function markUpdate(update, data) {
  update.set(data)
  .save()
  .then(function(u) {
    console.log('Saved.');
  })
  .catch(function(error) {
    console.log('Error marking update', data);
    console.error(error);
  });
}

module.exports = activities;
