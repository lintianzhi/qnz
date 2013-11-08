var _ = require('underscore');
var conf = require('./conf');

exports.Batch = Batch;

function Batch(_conf) {
  this.conf = _.clone(conf.globalConfig);

  if _.isObject(_conf) {
    _.extend(this.conf, _conf);
  }
}

Batch.prototype.stat = function(keys, onret) {
}

Batch.prototype.remove = function(keys, onret) {
}

Batch.prototype.copy = function(keyPairs, onret) {
}

Batch.prototype.move = function(keyPairs, onret) {
}

