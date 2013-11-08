var _ = require('underscore');
var gConf = require('./conf');
var key = require('./key');

exports.Bucket = Bucket;
exports.bucket = bucket;

function bucket(name, conf) {
  return new Bucket(name, conf);
}

function Bucket(name, conf) {
  /*
   * this.conf = {
   *  bucketName: 'bucket',
   *  isPublic: true,
   *  dnHost: 'http://bucket.qiniudn.com',
   *  // from globalconfig
   * }
   * */
  this.conf = {isPublic: true, bucketName: name};

  if (_.isObject(conf)) {
    _.extend(this.conf, conf);
  }

}

Bucket.prototype.attr = function(name) {
  return this.conf[name] || gConf.attr(name);
}

Bucket.prototype.key = function(keyName) {
  return new key.Key(this, keyName || '');
}

Bucket.prototype.upToken = function(expire, putPolicy) {
}

Bucket.prototype.listPrefix = function(opts, onret) {
  var prefix = opts.prefix || '';
  var marker = opts.marker || '';
  var limit = opts.limit || 0;
  var delimiter = opts.delimiter || '';
  
  // ...
}
