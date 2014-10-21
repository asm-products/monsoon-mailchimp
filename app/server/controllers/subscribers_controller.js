var express = require('express');
var authorization = require('../middleware/authorization');
var Subscriber = require('../models/subscriber');
var uuid = require('node-uuid');

var subscribers = express.Router();
var route = '/products/:product/subscribers'

subscribers.use(route, authorization);

subscribers.route(route)
.get(function subscribersGET(req, res, next) {
  res.status(200).json({
    location: route,
    product: req.params.product
  });
})
.post(function subscribersPOST(req, res, next) {
  var product = req.params.product;
  var endpoint = req.body.endpoint;

  var subscriber = new Subscriber({
    product: product,
    endpoint: endpoint
  })
  .save()
  .then(function(s) {
    res.status(201).json(s);
  })
  .otherwise(function(err) {
    console.error('Subscriber failed to save.');
    res.status(400).json(err);
  });
});

module.exports = subscribers;
