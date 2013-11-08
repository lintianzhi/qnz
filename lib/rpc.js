var urllib = require('urllib');
var conf = require('./conf');

exports.postMultipart = postMultipart;
exports.postWithoutForm = postWithoutForm;
exports.post = post;

function postMultipart(url, form, onret) {
  post(url, form, form.headers(), onret);
}

function postWithoutForm(url, headers, onret) {
  post(url, null, headers, onret);
}

function post(url, body, headers, onret) {
  headers = headers || {};
  headers['User-Agent'] = headers['User-Agent'] || conf.globalConfig.userAgent;
  
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
  }

  var req = urllib.request(url, data, function(err, ret, res) {
    if (err) {
      err.code = res && res.statusCode || -1;
      err.error = ret.error;
      onret(err, ret, res);
    } else {
      onret(err, ret, res);
    }
  });
}
