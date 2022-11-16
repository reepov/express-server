const multer = require('multer');
const express = require("express");
const PoemsRouter = express.Router();
const bodyParser = require('body-parser');
const router = require("./UserController");
const Users = require('../Models/UserModel')
const Poems = require('../Models/PoemsModel');
const { Sequelize, STRING } = require('sequelize');
const UserViewModel = require("../ViewModels/UserViewModel");
const PoemsViewModel = require('../ViewModels/PoemsViewModel');
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
const UUIDV4 =  require('uuid');
const upload = multer();
Users.sync();
Poems.sync();

//   http://localhost:3333/api/User/GetUserById?userId=..currentUserId=
router.get("/GetUserById", function (req, res) {
    db.sync();
    const currentUserId = req.query.currentUserId
    const userId = req.query.userId 
    Users.findOne({
        where: {
           Id: userId
        }
    }).then(users=>{
        let user = users;
        Poems.findAll({
          where:{
            AuthorId: userId
          }
        }).then(poems =>{
          let poemsToSend = [];
          poems.forEach(item =>{
            poemsToSend.push(new PoemsViewModel(
              item.Id, item.Title, item.Text, 
              item.LikersIds.filter(() => true).length, 
              item.ViewersIds?.filter(() => true).length, 
              item.ViewersIds?.indexOf(currentUserId) >= 0, 
              item.LikersIds.indexOf(currentUserId) >= 0, 
              item.CommentIds, userId));
          });
          res.send(new UserViewModel(user.Id, user.NickName, poemsToSend));
        })    
      }).catch(err=>res.send(err));
});

module.exports = router;