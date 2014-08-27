/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'facebook-test';

describe('User', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new User object', function(){
      var u = new User();
      expect(u).to.be.instanceof(User);
    });
  });

  describe('#save', function(){
    it('should upate an existing user in the db', function(done){
      var user = new User({_id:'000000000000000000000001', email:'bob@aol.com', password:'$2a$10$XR.IQktUUujLBxed70GQn.jWY1wZ9ThM0Tar9wTqzkI4Uk1uP2Or2'}),
          body = {email:'bobby@aol.com', photo:'photo.com', tagline:'people call me bob', facebook:'facebook.com', twitter:'twitter.com', phone:'5553595241', visibility:'public'};
      user.save(body, function(err, user){
        expect(user.email).to.equal('bobby@aol.com');
        done();
      });
    });
  });

  describe('.find', function(){
    it('should show find all visible users', function(done){
      User.find({isVisible:'true'}, function(err, users){
        expect(users).to.have.length(3);
        done();
      });
    });
  });

  describe('.findOne', function(){
    it('should show one visible users', function(done){
      User.findOne({email:'jill@aol.com', isVisible:true}, function(err, user){
        done();
      });
    });
  });
});

