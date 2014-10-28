var fs = require('fs');

var controllers = fs.readdirSync(__dirname);

for (var i = 0, l = controllers.length; i < l; i++) {
  var controller = controllers[i];

  if (controller.indexOf('.') !== 0 && controller !== 'index.js') {
    var underscoreLocation = controller.indexOf('_');
    var controllerName = controller.substr(0, underscoreLocation);

    exports[controllerName] = require('./' + controller);
  }
}
