const multer = require('multer');
const express = require("express");
const PoemsRouter = express.Router();
const bodyParser = require('body-parser');
const UserRouter = require("./UserController");
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

//  http://localhost:3333/api/Poems/GetListOfRandomPoems?userId=
PoemsRouter.get("/GetListOfRandomPoems", function(_req, res){
    db.sync();
    const currentUserId = _req.query.userId;
    Poems.findAll({
        order: Sequelize.literal('random()')
    }).then(poems => {
        let wholePoems = poems;
        let poemsToSend = [];
        wholePoems.forEach(item => {
            poemsToSend.push(new PoemsViewModel(
                item.Id, item.Title, item.Text, 
                item.LikersIds.filter(() => true).length, 
                item.ViewersIds?.filter(() => true).length, 
                item.ViewersIds?.indexOf(currentUserId) >= 0, 
                item.LikersIds.indexOf(currentUserId) >= 0, 
                item.CommentIds, item.AuthorId));
        });
        res.send(poemsToSend.sort((a, b) => Number(a.isLikedByCurrentUser) - Number(b.isLikedByCurrentUser)));
    });
});

//  http://localhost:3333/api/Poems/AuthorSendPoem?userId=..title=.. (+form-data calls text)
PoemsRouter.post("/AuthorSendPoem", function(req, res){
    db.sync();
    const Title = req.query.title
    const userId = req.query.userId
    const text = req.body.text.toString().split('').reverse().join('').replace(']', '').split('').reverse().join('').replace('[', '').split("|, ");
    let textpoem = "";
    text.forEach(item => {
        textpoem += item + "\n";
    })
    let newPoem = Poems.create({
        Id: UUIDV4.v4(),
        Title: Title,
        Text: textpoem,
        LikersIds: [],
        ViewersIds: [],
        CommentIds: [],
        AuthorId: userId
    }).catch(res.send(false));
    res.send(true);
});

module.exports = PoemsRouter;