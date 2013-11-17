var util = require('util');
var conf = require('./conf');
var key = require('./key');
var rpc = require('./rpc');
var qutil = require('./util');

exports.Batch = Batch;
exports.batch = batch;

function Batch(_conf) {
  this.conf = _conf || {};
}

function batch(_conf) {
  return new Batch(_conf)
}

Batch.prototype.attr = function(name) {
  return this.conf[name] || conf.attr(name);
}

Batch.prototype.stat = function(keys, onret) {
  return this.op('stat', keys, onret);
}

Batch.prototype.remove = function(keys, onret) {
  return this.op('delete', keys, onret);
}

Batch.prototype.copy = function(keyPairs, onret) {
  return this.op('copy', keyPairs, onret);
}

Batch.prototype.move = function(keyPairs, onret) {
  return this.op('move', keyPairs, onret);
}

Batch.prototype.op = function(op, list, onret) {

  var oplist = [];
  if (op == 'stat' || op == 'delete') {
    for (var i in list) {
      oplist.push(genOp(op, list[i]));
    }
  } else {
    for (var i in list) {
      oplist.push(genOp(op, list[i][0], list[i][1]));
    }
  }
  body = oplist.join('');

  var uri = this.attr('rsHost') + '/batch';
  var auth = qutil.genAccessToken(uri, body, this.attr('accessKey'), this.attr('secretKey'));
  return rpc.post(uri, body, {Authorization: auth}, onret);
}

function genOp(op, src, dst) {
  return util.format('op=%s&', key.genOp(op, src, dst));
}
