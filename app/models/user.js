'use strict';

var bcrypt  = require('bcrypt'),
    _       = require('lodash'),
    Message = require('./message'),
    Mailgun = require('mailgun-js'),
    Mongo   = require('mongodb');

function User(){
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, function(err, obj){
    cb(err, _.create(User.prototype, obj));
  });
};

User.find = function(filter, cb){
  User.collection.find(filter).toArray(cb);
};

User.findOne = function(filter, cb){
  User.collection.findOne(filter, cb);
};

User.register = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(user){return cb();}
    o.password = bcrypt.hashSync(o.password, 10);
    User.collection.save(o, cb);
  });
};

User.authenticate = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(!user){return cb();}
    var isOk = bcrypt.compareSync(o.password, user.password);
    if(!isOk){return cb();}
    cb(user);
  });
};

User.prototype.save = function(o, cb){
  var properties = Object.keys(o),
      self       = this;

  properties.forEach(function(property){
    switch(property){
      case 'visible':
        self.isVisible = o[property] === 'public';
        break;
      default:
        self[property] = o[property];
    }
  });

  User.collection.save(this, cb);
};

User.prototype.send = function(receiver, obj, cb){
  switch(obj.mtype){
    case 'text':
      sendText(receiver.phone, obj.message, cb);
      break;
    case 'email':
      sendEmail(this.email, receiver.email, obj.subject, obj.message, cb);
      break;
    case 'internal':
      sendInternal(this, receiver._id, obj.subject, obj.message, cb);
      break;
  }
};

User.prototype.findMessages = function(cb){
  Message.find({toId:this._id}, cb);
};

User.prototype.findOneMessage = function(messageId, cb){
  var _id = Mongo.ObjectID(messageId);
  Message.collection.findOne({_id:_id, toId:this._id}, function(err, obj){
    if(!obj){return cb();}
    var message = _.create(Message.prototype, obj);
    message.read(function(){
      cb(err, message);
    });
  });
};

User.prototype.unreadCount = function(cb){
  Message.collection.find({toId:this._id, isRead:false}).count(cb);
};

module.exports = User;

//private functions

function sendText(to, body, cb){
  if(!to){return cb();}

  var accountSid = process.env.TWSID,
      authToken  = process.env.TWTOK,
      from       = process.env.FROM,
      client     = require('twilio')(accountSid, authToken);

  client.messages.create({to:to, from:from, body:body}, cb);
}

function sendEmail(from, to, subject, html, cb){
  if(!to){return cb();}

  var mailgun = new Mailgun({apiKey:process.env.MGAPI, domain: process.env.MGDOM}),
      data    = {from:from, to:to, subject:subject, html:html};

  mailgun.messages().send(data, cb);
}

function sendInternal(from, to, subject, message, cb){
  var msg = new Message({from:from, toId:to, subject:subject, body:message});
  msg.save(cb);
}
