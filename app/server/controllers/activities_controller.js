var express = require('express');
var authorization = require('../middleware/authorization');
var request = require('request');
var Activity = require('../models/activity');
var Subscriber = require('../models/subscriber');
var Update = require('../models/update');

var activities = express.Router();
var route = '/products/:product/activities';

var COUNT = 10;
var ONE_DAY = 24 * 60 * 60 * 1000;

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
  var body = req.body;

  var activity = new Activity({
    product: product,
    webhook_id: body.data.id,
    type: body.data.email_type,
    list_id: body.data.list_id,
    email: body.data.email
  })
  .save()
  .then(function(a) {
    checkUpdates(product);
    res.status(201).json(a);
  })
  .otherwise(function(err) {
    console.error('Activity failed to save.');
    res.status(400).json(err);
  });
});

function alertProduct(count, product, timestamp) {
  Subscriber.where({ product: product })
  .fetchAll()
  .then(function(subscribers) {
    subscribers.forEach(function(subscriber) {
      var endpoint = subscriber.get('endpoint');
      var countDays = timestamp > 0 ? Math.floor((Date.now() - timestamp) / ONE_DAY) : 1;
      var days = countDays === 1 ? 'the past day' : 'the past' + countDays + ' days';
      var message = 'There were ' + count + ' new signups in ' + days + '.';

      request({
        method: 'POST',
        uri: endpoint,
        body: {
          news_feed_item: {
            message: message
          },
          user_token: process.env.ASSEMBLY_AUTHENTICATION_TOKEN
        },
        json: true
      }, function(err, response, body) {
        if (err) {
          console.log('Error sending message to ' + endpoint);
        }

        console.log(body);
      });
    });
  })
  .otherwise(function(error) {
    console.log('Error fetching subscribers.');
    console.error(error);
  });
}

function checkUpdates(product) {
  Update.where({ product: product })
  .fetch()
  .then(function(update) {
    var now = Date.now();

    if (!update) {
      return countActivitiesSince(product);
    }

    if (now - update.get('sent_at') > ONE_DAY &&
        // don't check more than once per day
        now - update.get('checked_at') > ONE_DAY) {
      countActivitiesSince(product, update);
    }
  })
  .otherwise(function(error) {
    console.log('Error fetching update for ' + product);
    console.error(error);
  });
}

function countActivitiesSince(product, update) {
  if (!update) {
    update = new Update({
      product: product,
      sent_at: new Date(0),
      current_count: 0
    });
  }

  var timestamp = update.get('sent_at');

  Activity.where({ product: product })
  .query('where', 'created_at', '>=', timestamp)
  .fetchAll()
  .then(function(activities) {
    var count = activities.length + update.get('current_count');
    var now = new Date();

    if (count >= COUNT) {
      alertProduct(count, product, timestamp);
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
  .otherwise(function(error) {
    console.log('Error counting activities');
    console.error(error);
  });
}

function markUpdate(update, data) {
  update.set(data)
  .save()
  .then(function(u) {
    console.log('Saved:', u);
  })
  .otherwise(function(error) {
    console.log('Error marking update', data);
    console.error(error);
  })
}

module.exports = activities;
