var express = require('express');
var session = require('express-session')
var passport = require('passport');
var DB = require("sequelize");
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var auth = express.Router();
var crypto = require('crypto');
var uuid = require('uuid');

module.exports = auth;

var tokens = {};

var db = new DB('auth', null, null, {
    dialect: 'sqlite',
    storage: 'auth.db'
});

var User = db.define('user', {
    mail: { type: DB.TEXT, allowNull: false, unique: true },
    password: { type: DB.TEXT, allowNull: false },
    isAdmin: { type: DB.BOOLEAN, defaultValue: false }
});

db.sync();

passport.use('local', new LocalStrategy(
    (username, password, done) => {
        User.findOne({ where: { mail: username } })
            .then(x => {
                if (!x) {
                    return done(null, false);
                }
                if (x.password != crypto.createHmac('sha256', password).digest('hex')) {
                    return done(null, false);
                }
                return done(null, x);
            })
    }
))

passport.use('bearer', new BearerStrategy(
    (token, done) => {
        if (tokens[token] === undefined) {
            return done(null, false);
        }
        if (Date.now() - tokens[token].create_time > 60 * 60 * 1000) {
            delete tokens[token];
            return done(null, false);
        }
        User.findById(tokens[token].user_id).then(
            x => done(null, x)
        );
    }
))

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id)
        .then(x => {
            done(null, x);
        });
});



auth.use(session({ secret: 'nova', resave: false, saveUninitialized: false }));
auth.use(passport.initialize());
auth.use(passport.session());
auth.use('/api/*', passport.authenticate('bearer', { session: false }))
auth.get('/register', (req, res) => {
    res.render('auth/register.html');
});

auth.post('/register', (req, res) => {
    var data = {
        mail: req.body.mail,
        mail_error: false,
        password_error: false,
        password_not_same: false
    };
    User.count({ where: { mail: req.body.mail } })
        .then(x => {
            if (x != 0 || null == data.mail.match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/)) {
                data.mail_error = true;
            };
            if (null == req.body.password.match(/(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{8,}/)) {
                data.password_error = true;
            }
            if (req.body.password != req.body.password2) {
                data.password_not_same = true;
            }
            if (data.mail_error || data.password_error || data.password_not_same) {
                res.render('auth/register.html', data);
            } else {
                return User.create({ mail: data.mail, password: crypto.createHmac('sha256', req.body.password).digest('hex') });
            }
        }).then(() => {
            res.render('auth/regsuccess.html');
        })
});

auth.get('/login', (req, res) => {
    res.render('auth/login.html');
})

auth.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

auth.post('/gettoken', (req, res) => {
    User.findOne({ where: { mail: req.body.username } })
        .then(x => {
            if (!x) {
                res.json({ result: "failed", msg: "User not existed" });
            }
            if (x.password != crypto.createHmac('sha256', req.body.password).digest('hex')) {
                res.json({ result: "failed", msg: "Wrong password" });
            }
            var token = new Buffer(uuid.v1().replace(/-/g, ''), 'hex').toString('base64').replace(/=/g, '');
            tokens.token = { user_id: x.id, create_time: Date.now() };
            res.json({ result: "succeed", token: token });
        });
});