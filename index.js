const UserViewModel = require('../express-server/ViewModels/UserViewModel');
const express = require('express');
const { Sequelize } = require('sequelize');
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
const User = require('../express-server/Models/UserModel')
const host = 'localhost';
const port = 3333;
const app = express();
const UserController = require('../express-server/Controllers/UserController')
const UUIDV4 =  require('uuid');
app.use('/', UserController);
app.listen(port, () => {
    console.log('Application listening on port 3333!');
});