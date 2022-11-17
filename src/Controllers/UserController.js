const multer = require('multer');
const express = require("express");
const UserRouter = express.Router();
const bodyParser = require('body-parser');
const PoemsRouter = require("./PoemsController");
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

//   http://localhost:3333/api/User/LoginMobile?email=..password=
UserRouter.get("/LoginMobile", function(req, res) {
    db.sync();
    const email = req.query.email;
    const password = req.query.password;
    Users.findOne({
      where:{
        Email: email,
        Password: password
      }
    }).then(user => {
      res.send(user.Id);
    }).catch(res.send(""));
});

//   http://localhost:3333/api/User/GetUserById?userId=..currentUserId=
UserRouter.get("/GetUserById", function (req, res) {
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

//   http://localhost:3333/api/User/RegisterMobile?email=..nickname=..password=..
UserRouter.post("/RegisterMobile", function(req, res){
    db.sync();
    const email = req.query.email;
    const nickname = req.query.nickname;
    const password = req.query.password;
    const today = new Date();
    let result = true;
    let newUser = Users.create({
      Id: UUIDV4.v4(),
      NickName: nickname,
      DateOfCreate: today.getDate() + "." + (today.getMonth() + 1).toString() + "." + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes(),
      Email: email,
      Password: password,
      ListOfViewsPoems: [],
      ListOfLikedPoems: [],
      ListOfLikedComments: []
    }).catch(err => result = false);
    res.send(result);
});

module.exports = UserRouter;