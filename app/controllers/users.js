'use strict';

var User    = require('../models/user'),
    moment  = require('moment');

exports.new = function(req, res){
  res.render('users/new');
};

exports.login = function(req, res){
  res.render('users/login');
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};

exports.create = function(req, res){
  User.register(req.body, function(err, user){
    if(user){
      res.redirect('/');
    }else{
      res.redirect('/register');
    }
  });
};

exports.authenticate = function(req, res){
  User.authenticate(req.body, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id;
        req.session.save(function(){
          res.redirect('/');
        });
      });
    }else{
      res.redirect('/login');
    }
  });
};

exports.edit = function(req, res){
  res.render('users/edit');
};

exports.update = function(req, res){
  res.locals.user.save(req.body,function(){
    res.redirect('/profile');
  });
};

exports.show = function(req, res){
  res.render('users/show');
};

exports.client = function(req, res){
  User.findOne({email:req.params.email, isVisible:'true'}, function(err, client){
    if(!client){return res.redirect('/users');}
    res.render('users/showUser', {client:client});
  });
};

exports.index = function(req, res){
  User.find({isVisible:'true'}, function(err, users){
    res.render('users/index', {users:users});
  });
};

exports.message = function(req, res){
  User.findById(req.params.userId, function(err, receiver){
    res.locals.user.send(receiver, req.body, function(){
      res.redirect('/users/' + receiver.email);
    });
  });
};

exports.inbox = function(req, res){
  res.locals.user.findMessages(function(err, messages){
    res.render('users/inbox', {messages:messages, moment:moment});
  });
};

exports.mail = function(req, res){
  res.locals.user.findOneMessage(req.params.mailId, function(err, message){
    if(!message){return res.redirect('/inbox');}
    res.locals.user.unreadCount(function(err, count){
      res.locals.count = count;
      res.render('users/mail', {message:message, moment:moment});
    });
  });
};
