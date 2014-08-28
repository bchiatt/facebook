'use strict';

var Mongo  = require('mongodb'),
    _      = require('lodash');

function Message(o){
  this.sent    = new Date();
  this.toId    = Mongo.ObjectID(o.toId);
  this.frId    = Mongo.ObjectID(o.from._id);
  this.from    = o.from.email;
  this.subject = o.subject;
  this.body    = o.body;
  this.isRead  = false;
}

Object.defineProperty(Message, 'collection', {
  get: function(){return global.mongodb.collection('messages');}
});

Message.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Message.collection.findOne({_id:_id}, function(err, obj){
    cb(err, _.create(Message.prototype, obj));
  });
};

Message.find = function(filter, cb){
  //add sort by date & async map to get email address rather than hard-code
  Message.collection.find(filter).toArray(cb);
};

Message.findOne = function(filter, cb){
  Message.collection.findOne(filter, cb);
};

Message.prototype.save = function(cb){
  Message.collection.save(this, cb);
};

Message.prototype.read = function(cb){
  this.isRead = true;
  Message.collection.save(this, cb);
};

Message.unread = function(receiverId, cb){
  Message.collection.find({toId:receiverId, isRead:false}).count(cb);
};

module.exports = Message;

//private functions
