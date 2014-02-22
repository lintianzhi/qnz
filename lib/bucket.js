var _ = require('underscore');
var util = require('util');
var gConf = require('./conf');
var key = require('./key');
var qutil = require('./util');
var rpc = require('./rpc');

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

  var k = this.key();
  return k.upToken(expire, putPolicy);
}

Bucket.prototype.list = function(opts, onret) {

  if (arguments.length < 2) {
    onret = qutil.noop;
    if (_.isFunction(opts)) {
      onret = opts;
      opts = {};
    } else if (!_.isObject(opts)){
      opts = {};
    }
  }

  var prefix = opts.prefix || '';
  var marker = opts.marker || '';
  var limit = opts.limit || 0;
  var delimiter = opts.delimiter || '';

  var uri = util.format('%s/list?bucket=%s', this.attr('rsfHost'), this.attr('bucketName'));

  if (marker != '') {
    uri += util.format('&marker=%s', marker);
  }
  if (prefix != '') {
    uri += util.format('&prefix=%s', encodeURIComponent(prefix));
  }
  if (delimiter != '') {
    uri += util.format('&delimiter=%s', encodeURIComponent(delimiter));
  }
  if (limit > 0) {
    uri += util.format('&limit=%d', limit);
  }

  var auth = qutil.genAccessToken(uri, null, this.attr('accessKey'), this.attr('secretKey'));
  return rpc.postWithoutForm(uri, {Authorization: auth}, onret);
}

Bucket.prototype.alias = function(styleName, style, onret) {

}
