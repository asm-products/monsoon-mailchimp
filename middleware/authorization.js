var request = require('request');
var util = require('util');

module.exports = function(req, res, next) {
  var slug = req.params.product;
  var token = req.query.token;

  request.get({
    uri: util.format(
      '%s/products/%s/authorization?token=%s',
      process.env.ASSEMBLY_API,
      slug,
      token
    ),
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json'
    }
  }, function(error, response, body) {
    if (error) {
      return res.send(error);
    }

    var authorized, body;
    try {
      body = JSON.parse(response.body);
      authorized = body.authorized;
    } catch (e) {
      res.send(e);
    }

    if (!authorized) {
      return res.json(body);
    }

    next();
  });
};
