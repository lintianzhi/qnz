var Q = require('q');
var _ = require('underscore');
var urllib = require('urllib');

var conf = require('./conf');
var qutil = require('./util');

exports.postMultipart = postMultipart;
exports.postWithoutForm = postWithoutForm;
exports.post = post;
exports.get = get;

function get(url, query, onret) {

  var deferrd = Q.defer();
  if (_.isFunction(query)) {
    onret = query;
    query = {};
  }

  urllib.request(url, {
    method: 'GET',
    data: query,
    dataType: 'json',
    headers: {'User-Agent': conf.attr('userAgent')},
  }, function(err, ret, res) {
    if (err) {
      err.code = res && res.statusCode || -1;
      deferrd.reject(err);
    } else if (Math.floor(res.statusCode/100) !== 2) {
      err = {code: res.statusCode, error: ret.error||''};
      deferrd.reject(err);
    } else {
      deferrd.resolve(ret);
    }
  });

  if (!_.isFunction(onret)) onret = qutil.noop;
  deferrd.promise.nodeify(onret);
  return deferrd.promise;
}

function postMultipart(url, form, onret) {
  return post(url, form, form.headers(), onret);
}

function postWithoutForm(url, headers, onret) {
  return post(url, null, headers, onret);
}

function post(url, body, headers, onret) {

  var deferrd = Q.defer();
  headers = headers || {};
  headers['User-Agent'] = headers['User-Agent'] || conf.attr('userAgent');

  var content = null;

  var data = {
    headers: headers,
    method: 'POST',
    dataType: 'json',
    timeout: 360000,
  };
  if (Buffer.isBuffer(body) || typeof body === 'string') {
    data.content = body;
  } else if (body) {
    data.stream = body;
  } else {
    data.headers['Content-Length'] = 0;
  }

  if (url.indexOf('://') < 0) {
    url = 'http://' + url
  }
  var req = urllib.request(url, data, function(err, ret, res) {
    if (err) {
      err.code = res && res.statusCode || -1;
      deferrd.reject(err);
    } else if (Math.floor(res.statusCode/100) !== 2) {
      err = {code: res.statusCode, error: ret&&ret.error||''};
      deferrd.reject(err);
    } else {
      deferrd.resolve(ret);
    }
  });

  if (!_.isFunction(onret)) onret = qutil.noop;
  deferrd.promise.nodeify(onret);
  return deferrd.promise;
}
