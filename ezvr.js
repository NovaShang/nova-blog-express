var express = require("express");
var Sequelize = require("sequelize")
var _ = require("lodash")
var sequelize = new Sequelize('ezvr', null, null, {
    dialect: 'sqlite',
    storage: 'ezvr.db'
});

var Model = sequelize.define('model', {
    name: Sequelize.STRING,
    urn: Sequelize.STRING,
    shared: Sequelize.BOOLEAN,
    description: Sequelize.TEXT,
});

var ezvr = express.Router();
module.exports = ezvr;

ezvr.get('/ezvr', (req, res) => {
    res.render("ezvr/index.html");
});

ezvr.get('/ezvr/model/:id', (req, res) => {
    res.render('ezvr/model.html')
});

ezvr.get('/ezvr/vrmodel/:id', (req, res) => {
    res.render('ezvr/vrmodel.html')
});

ezvr.get('/ezvr/upload', (req, res) => {
    res.render('ezvr/vrmodel.html')
});

ezvr.get('/api/models', (req, res) => {
    Model.findAll()
});
ezvr.post('/api/models', (req, res) => {

});