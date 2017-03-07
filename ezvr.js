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
    description: Sequelize.TEXT
});

var ezvr = express.Router();
module.exports = ezvr;

ezvr.use((req, res, next) => {});

ezvr.get('/api/models', (req, res) => {
    Model.findAll()
});
ezvr.post('/api/models', (req, res) => {

})

ezvr.use()