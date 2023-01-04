const UUIDV4 =  require('uuid');
const multer = require('multer');
const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const User = require('./Models/UserModel');
const Poems = require('./Models/PoemsModel');
const Comments = require("./Models/CommentModel");
const UserViewModel = require('./ViewModels/UserViewModel');
const PoemsViewModel = require('./ViewModels/PoemsViewModel');
const CommentViewModel = require("./ViewModels/CommentViewModel");
const UserController = require('./Controllers/UserController');
const PoemsController = require('./Controllers/PoemsController');
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
Comments.sequelize.sync();
Poems.sequelize.sync();
const port = 3333;
const app = express();
const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
  })
app.use(upload.array()); 
const host = 'localhost';
app.use(bodyParser.json()); 
app.use(express.static('public'));
db.sync();
app.use('/api/User/', UserController);
app.use('/api/Poems/', PoemsController);
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => console.log('Application listening on port 3333!'));