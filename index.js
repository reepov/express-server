const UserViewModel = require('../express-server/ViewModels/UserViewModel');
const PoemsViewModel = require('../express-server/ViewModels/PoemsViewModel');
const express = require('express');
const bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const { Sequelize } = require('sequelize');
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
const User = require('../express-server/Models/UserModel');
const Poems = require('../express-server/Models/PoemsModel');
const host = 'localhost';
const port = 3333;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));
const UserController = require('../express-server/Controllers/UserController');
const PoemsController = require('../express-server/Controllers/PoemsController');
const UUIDV4 =  require('uuid');
app.use('/api/User/', UserController);
app.use('/api/Poems/', PoemsController);
app.listen(port, () => {
    console.log('Application listening on port 3333!');
});