var authorization = require('../middleware/authorization');
var express = require('express');
var models = require('../models');
var request = require('request');
var util = require('util');

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
  var listId = body.data.list_id;

  Activity.create({
    product: product,
    webhook_id: body.data.id,
    type: body.data.email_type,
    list_id: listId,
    email: body.data.email
  })
  .then(function(activity) {
    checkUpdates(product, token, listId);
    res.status(201).json(activity);
  })
  .catch(function(err) {
    console.error('Activity failed to save.');
    console.log(err);
    res.status(400).json(err);
  });
});

function alertProduct(count, product, token, timestamp, listId) {
  // Assembly-only

  getTotalSubscribers(listId, function(err, total) {
    if (err) {
      console.log(err);
      return console.error('Error getting total subscirbers.');
    }

    var endpoint = util.format(
      '%s/products/%s/updates?token=%s',
      process.env.ASSEMBLY_API,
      product,
      token
    );

    var date = new Date(timestamp);
    var month = MONTHS[date.getMonth()];
    var day = date.getDate();
    var since = month + ' ' + day;
    var message = util.format(
      'There were %d new signups since %s. There are now %d subscribers.',
      parseInt(count, 10),
      since,
      parseInt(total, 10)
    );

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

function checkUpdates(product, token, listId) {
  Update.find({ product: product })
  .then(function(update) {
    var now = Date.now();

    if (!update) {
      return countActivitiesSince(product, token, null, listId);
    }

    if (now - update.get('sent_at') > ONE_DAY &&
        // don't check more than once per day
        now - update.get('checked_at') > ONE_DAY) {
      countActivitiesSince(product, token, update, listId);
    }
  })
  .catch(function(error) {
    console.log('Error fetching update for ' + product);
    console.error(error);
  });
}

function countActivitiesSince(product, token, update, listId) {
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
      alertProduct(count, product, token, timestamp, listId);

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

function getTotalSubscribers(listId, callback) {
  var uri = process.env.MAILCHIMP_API;
  var key = process.env.MAILCHIMP_API_KEY;

  request({
    method: 'POST',
    uri: uri + '/lists/members',
    json: true,
    body: {
      apikey: key,
      id: listId
    }
  }, function(err, response, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, body.total);
  });
}

module.exports = activities;
