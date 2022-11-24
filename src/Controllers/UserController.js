const multer = require('multer');
const express = require("express");
const UserRouter = express.Router();
const bodyParser = require('body-parser');
const PoemsRouter = require("./PoemsController");
const Users = require('../Models/UserModel');
const Poems = require('../Models/PoemsModel');
const Comments = require('../Models/CommentModel')
const { Sequelize, STRING } = require('sequelize');
const UserViewModel = require("../ViewModels/UserViewModel");
const PoemsViewModel = require('../ViewModels/PoemsViewModel');
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
const UUIDV4 =  require('uuid');
const upload = multer();
Users.sync();
Poems.sync();

//   http://localhost:3333/api/User/LoginMobile?email=..password=
UserRouter.get("/LoginMobile", async function(req, res) {
    await db.sync();
    const email = req.query.email;
    const password = req.query.password;
    let result;
    const user = await Users.findOne({
      where:{
        Email: email,
        Password: password
      }
    });
    res.send(user.Id);
});

//   http://localhost:3333/api/User/GetUserById?userId=..currentUserId=
UserRouter.get("/GetUserById", async function (req, res) {
    db.sync();
    const currentUserId = req.query.currentUserId
    const userId = req.query.userId 
    await Users.findOne({
        where: {
           Id: userId
        }
    }).then(users=>{
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
              item.CommentIds, userId, item.Created, users.NickName, item.Description));
          });
          if (users.SubscribersIds === null) 
          {
            users.SubscribersIds = [];
            users.save();
          }
          res.send(new UserViewModel(users.Id, users.NickName, poemsToSend, users.SubscribersIds, users.SubscribersIds.indexOf(currentUserId) >= 0));
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
      ListOfLikedComments: [],
      SubscribersIds: []
    }).catch(err => result = false);
    res.send(result);
});

UserRouter.post("/SubscribeToUser", async function(req, res){
  db.sync();
  const userId = req.query.userId;
  const subscriberId = req.query.currentUserId;

  const author = await Users.findOne({
    where: {
      Id: userId
    }
  });
  if(author.SubscribersIds === null) author.SubscribersIds = [];
  const subs = [...author.SubscribersIds]
  if (subs.indexOf(subscriberId) < 0) author.SubscribersIds = [...author.SubscribersIds, subscriberId]
  else {
    let arr = [...author.SubscribersIds];
    const array = arr.filter(function (id) {
        return id !== subscriberId;
    });
    author.SubscribersIds = [...array];
  }
  author.save();
  res.send([...author.SubscribersIds].indexOf(subscriberId) >= 0)
});

module.exports = UserRouter;  