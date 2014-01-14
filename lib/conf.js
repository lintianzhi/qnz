var _ = require('underscore');

var globalConfig = {
  userAgent: 'qiniu nodejs-sdk v7.0.0',
  apiHost: 'http://api.qiniu.com',
  upHost: 'http://up.qiniu.com',
  rsHost: 'http://rs.qiniu.com',
  rsfHost: 'http://rsf.qbox.me',
  accessKey: '<Please apply you access key>',
  secretKey: '<Dont send your secret key to anyone>',
}

exports.globalConfig = globalConfig;
exports.setConf = setConf;
exports.attr = attr;

function setConf(conf) {
  if (_.isObject(conf)) {
    _.extend(globalConfig, conf);
  }
}

function attr(name) {
  return globalConfig[name];
}
