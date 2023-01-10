const multer = require('multer');
const express = require("express");
const nodemailer = require("nodemailer")
const moment = require("moment");
const UserRouter = express.Router();
const bodyParser = require('body-parser');
const PoemsRouter = require("./PoemsController");
const Users = require('../Models/UserModel');
const Poems = require('../Models/PoemsModel');
const Comments = require('../Models/CommentModel')
const { Sequelize, STRING } = require('sequelize');
const { QueryTypes } = require('sequelize');
const UserViewModel = require("../ViewModels/UserViewModel");
const PoemsViewModel = require('../ViewModels/PoemsViewModel');
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
const UUIDV4 =  require('uuid');
const upload = multer({
  limits: { fieldSize: 25 * 1024 * 1024 }
})
var MD5 = require("crypto-js/md5");
const Op = Sequelize.Op;

Users.sync();
Poems.sync();

//   http://localhost:3333/api/User/LoginMobile?email=..password=
UserRouter.get("/LoginMobile", async function(req, res) {
    await db.sync();
    const email = req.query.email;
    const password = req.query.password;
    const passwordHash = MD5(password.toString()).toString();
    const user = await Users.findOne({
      where:{
        Email: email,
        Password: passwordHash
      }
    });
    if (user != null) res.send(user.Id);
    else res.send("false");
});

//   http://localhost:3333/api/User/GetUserById?userId=..currentUserId=
UserRouter.get("/GetUserById", async function (req, res) {
    db.sync();
    const currentUserId = req.query.currentUserId
    const userId = req.query.userId
    let viewedsend = [];
    let likedsend = [];
    await Poems.findAll({
      where:
      {
        LikersIds : {[Op.contains] : [userId]}
      }
    }).then(liked => {
      liked.forEach(async item => {
        let author = await Users.findOne({
          where:{
            Id: item.AuthorId
          }
        });
        likedsend.push(new PoemsViewModel(
          item.Id, item.Title, item.Text, 
          item.LikersIds.filter(() => true).length, 
          item.ViewersIds?.filter(() => true).length, 
          item.ViewersIds?.indexOf(currentUserId) >= 0, 
          item.LikersIds.indexOf(currentUserId) >= 0, 
          item.CommentIds, userId, item.Created, author.NickName, item.Description))
      })
    })
    const viewed = await Poems.findAll({
      where:{
        ViewersIds : {[Op.contains] : [userId]}
      }
    }).then(viewed => {
      
      viewed.forEach(async item => {
        let author = await Users.findOne({
          where:{
            Id: item.AuthorId
          }
        });
        viewedsend.push(new PoemsViewModel(
          item.Id, item.Title, item.Text, 
          item.LikersIds.filter(() => true).length, 
          item.ViewersIds?.filter(() => true).length, 
          item.ViewersIds?.indexOf(currentUserId) >= 0, 
          item.LikersIds.indexOf(currentUserId) >= 0, 
          item.CommentIds, userId, item.Created, author.NickName, item.Description))
      })
    })
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
          res.send(new UserViewModel(users.Id, users.NickName, poemsToSend, users.SubscribersIds, users.SubscribersIds.indexOf(currentUserId) >= 0, likedsend, viewedsend, users.Photo));
        })    
      }).catch(err=>res.send(err));
});

//   http://localhost:3333/api/User/RegisterMobile?email=
UserRouter.post("/RegisterMobile", async function(req, res){
    db.sync();
    const email = req.query.email;
    Users.findOne({
      where:{
        Email: email
      }
    }).then(user => {
      if (user != null) res.send("exists");
      else{
        let code = Math.ceil(Math.random() * 8999 + 1000).toString();
        let transporter = nodemailer.createTransport({
          port: 465,               // true for 465, false for other ports
          host: "smtp.yandex.ru",
          auth: {
            user: 'reepov@yandex.ru',
            pass: 'mxqjvyhptstusnji',
          },
          secure: true
        })
        let resultat = transporter.sendMail({
          from: 'reepov@yandex.ru',
          to: email,
          subject: 'Регистрация в приложении POEMS',
          text: 'Для окончания регистрации введите в приложении код: ' + code,
        })
        res.send(code)
      }
    })
});

UserRouter.post("/EndRegisterMobile", async function(req, res){
  db.sync();
  const email = req.query.email;
  const nickname = req.query.nickname;
  const password = req.query.password;
  const code = req.query.code;
  const today = new Date();
  let result = true;
  let date = moment().format("DD.MM.YYYY");
  let newUser = Users.create({
    Id: UUIDV4.v4(),
    NickName: nickname,
    DateOfCreate: date,
    Email: email,
    Password: MD5(password.toString()).toString(),
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

UserRouter.post("/SetAvatarToUser", async function(req, res) {
  db.sync()
  const currentUserId = req.query.currentUserId
  const array = req.body.formData

  let user = await Users.findOne({
    where:{
      Id: currentUserId
    }
  });
  user.Photo = array;
  user.save();
  res.send(true);
});

UserRouter.post("/ResetPasswordRequest", async function(req, res) {
  const email = req.query.email;
  Users.findOne({
    where:{
      Email: email
    }
  }).then(user => {
      let transporter = nodemailer.createTransport({
        port: 465,               // true for 465, false for other ports
        host: "smtp.yandex.ru",
        auth: {
          user: 'reepov@yandex.ru',
          pass: 'mxqjvyhptstusnji',
        },
        secure: true
      })
      let resultat = transporter.sendMail({
        from: 'reepov@yandex.ru',
        to: email,
        subject: 'Смена пароля в приложении POEMS',
        text: 'Для смены пароля перейдите по ссылке: http://185.119.56.91/api/User/LinkToResetPassword?email=' + email
      })
      res.send(true)
    })
});

UserRouter.get("/LinkToResetPassword", async function(req, res){
  const email = req.query.email;
  res.redirect('https://www.rustore.ru');
});

UserRouter.get("/ResultOfUserSearch", async function(req, res) {
  const userId = req.query.userId;
  const searchText = req.query.searchText;
  let results = [];
  if(searchText != ""){
      results = await db.query(`SELECT "Id", "NickName", "DateOfCreate", "ListOfViewsPoems", "ListOfLikedPoems", "Email", "ListOfLikedComments", "Password", "SubscribersIds", "Photo" FROM "Users" AS "Users" WHERE ("Users"."NickName" ILIKE N'%` + searchText + `%')`, { type: QueryTypes.SELECT })
      results.sort((a, b) => Number(b.SubscribersIds.filter(() => true).length) - Number(a.SubscribersIds.filter(() => true).length))
  }
  if (results.length < 3) {
    let popular = await Users.findAll({
      where:{
          
      }
    });
    popular.sort((a, b) => Number(b.SubscribersIds.filter(() => true).length) - Number(a.SubscribersIds.filter(() => true).length))
    for(let r = 0; r < popular.length; r++)
    {
      for(let j = 0; j < results.length; j++)
      {
          if(results[j].Id == popular[r].Id) popular.splice(r, 1);
      }
    }
    let i = 0;
    while(results.length < 3) {
      results.push(popular[i]);
      i++;
    }
  }
  let usersToSend = [];
    for(let k = 0; k < 3; k++)
      {
          usersToSend.push(new UserViewModel(results[k].Id, results[k].NickName, null, results[k].SubscribersIds, 
            results[k].SubscribersIds.indexOf(userId) >= 0,
            null, null, results[k].Photo));
      }
  res.send(usersToSend);
});


UserRouter.post("/ResetPassword", async function(req, res){
  const email = req.query.email;
  const password = req.query.password;

  const user = await Users.findOne({
    where:{
        Email: email
    }
  });
  user.Password = MD5(password.toString()).toString();
  user.save();
  res.send(true);
});

module.exports = UserRouter;