const UserViewModel = require('../express-server/ViewModels/UserViewModel');
const PoemsViewModel = require('../express-server/ViewModels/PoemsViewModel');
const express = require('express');
const { Sequelize } = require('sequelize');
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
const User = require('../express-server/Models/UserModel');
const Poems = require('../express-server/Models/PoemsModel');
const host = 'localhost';
const port = 3333;
const app = express();
const UserController = require('../express-server/Controllers/UserController');
const PoemsController = require('../express-server/Controllers/PoemsController');
const UUIDV4 =  require('uuid');
app.use('/api/User/', UserController);
app.use('/api/Poems/', PoemsController);
app.listen(port, () => {
    console.log('Application listening on port 3333!');
});