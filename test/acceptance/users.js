/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'facebook-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /profile/edit', function(){
    it('should show the edit profile page', function(done){
      request(app)
      .get('/profile/edit')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        expect(res.text).to.include('Private');
        expect(res.text).to.include('bob@aol.com');
        done();
      });
    });
  });

  describe('put /profile', function(){
    it('should edit the profile', function(done){
      request(app)
      .post('/profile')
      .set('cookie', cookie)
      .send('_method=put&email=name%40example.com&photo=http%3A%2F%2Fwww.example.com&phone=5556783473&visible=private&tagline=woot&facebook=http%3A%2F%2Ffacebookurl.com&twitter=http%3A%2F%2Ftwitterurl.com')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('get /profile', function(){
    it('should show the profile', function(done){
      request(app)
      .get('/profile')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Edit Profile');
        expect(res.text).to.include('Visibility');
        expect(res.text).to.include('bob@aol.com');
        done();
      });
    });
  });

  describe('get /users', function(){
    it('should show the users page', function(done){
      request(app)
      .get('/users')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob');
        expect(res.text).to.include('jill');
        expect(res.text).to.not.include('sue');
        done();
      });
    });
  });

  describe('get /users/sue@aol.com', function(){
    it('should show a user profile page', function(done){
      request(app)
      .get('/users/sue@aol.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users');
        done();
      });
    });
  });

  describe('get /users/sara@aol.com', function(){
    it('should not show a user profile page', function(done){
      request(app)
      .get('/users/sara@aol.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('sara@aol.com');
        done();
      });
    });
  });

  describe('post /message/3', function(){
    it('should send a user a text message', function(done){
      request(app)
      .post('/message/000000000000000000000003')
      .set('cookie', cookie)
      .send('mtype=text&message=hey')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/nodetest@outlook.com');
        done();
      });
    });
  });

  describe('post /message/3', function(){
    it('should send a user an email message', function(done){
      request(app)
      .post('/message/000000000000000000000003')
      .set('cookie', cookie)
      .send('mtype=email&subject=howdy&message=hey')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/nodetest@outlook.com');
        done();
      });
    });
  });

  describe('post /message/3', function(){
    it('should send a user an internal message', function(done){
      request(app)
      .post('/message/000000000000000000000003')
      .set('cookie', cookie)
      .send('mtype=internal&subject=howdy&message=hey')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/nodetest@outlook.com');
        done();
      });
    });
  });

  describe('get /inbox', function(){
    it('should show all user internal messages', function(done){
      request(app)
      .get('/inbox')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Howdy');
        expect(res.text).to.include('Hi');
        done();
      });
    });
  });

  describe('get /inbox/2', function(){
    it('should show an internal messages', function(done){
      request(app)
      .get('/inbox/a00000000000000000000002')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Howdy');
        done();
      });
    });
  });

  describe('get /inbox/3', function(){
    it('should redirect to inbox', function(done){
      request(app)
      .get('/inbox/a00000000000000000000003')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/inbox');
        done();
      });
    });
  });
});
