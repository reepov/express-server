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
const CommentViewModel = require("../ViewModels/CommentViewModel");
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
const UUIDV4 =  require('uuid');
const Comments = require('../Models/CommentModel');
const upload = multer();
Users.sync();
Poems.sync();

//   http://localhost:3333/api/Poems/GetCommentsByPoemId?userId=..poemId=..
PoemsRouter.get("/GetCommentsByPoemId", function(req, res){
    db.sync();
    const currentUserId = req.query.userId;
    const poemId = req.query.poemId;
    Comments.findAll({
        where:{
            PoemId: poemId
        }
    }).then(comments => {
        Users.findOne({
            where:{
                Id: currentUserId
            }
        }).then(user => {
            let comms = [];
            comments.forEach(item => 
            {
                Users.findOne({
                    where: {
                        Id : item.UserId
                    }
                }).then(author =>{
                    comms.push(new CommentViewModel(
                        item.Id, author.NickName, item.Text, 
                        item.LikersIds.filter(() => true).length, 
                        item.LikersIds.indexOf(currentUserId) >= 0, 
                        item.Created, item.RepliesId, item.UpReplyId, poemId));
                    res.send(comms.sort((a, b) => Number(a.isLikedByCurrentUser) - Number(b.isLikedByCurrentUser)));
                });
            });
            
        });
    });
});

//   http://localhost:3333/api/Poems/GetCommentById?commId=..currentUserId=..
PoemsRouter.get("/GetCommentById", function(req, res) {
        db.sync();
        const commId = req.query.commId;
        const currentId = req.query.currentUserId;

        Comments.findOne({
            where: {
                Id: commId
            }
        }).then(comment => {
            Users.findOne({
                where: {
                    Id: comment.UserId
                }
            }).then(user => {
                res.send(new CommentViewModel(comment.Id, user.NickName, 
                    comment.Text, comment.LikersIds.filter(() => true).length, 
                    comment.LikersIds.indexOf(currentId) >= 0, comment.Created, 
                    comment.RepliesId, comment.UpReplyId, comment.PoemId));
            }); 
        });
});

//   http://localhost:3333/api/Poems/GetAllPoemsByAuthorId?authorId=..currentUserId=..
PoemsRouter.get("/GetAllPoemsByAuthorId", function(req, res){
        db.sync();
        const authorId = req.query.authorId;
        const currentUserId = req.query.currentUserId;

        Poems.findAll({
            where: {
                AuthorId: authorId
            }
        }).then(poems =>
            {
                let poemsToSend = [];
                poems.forEach(item => {
                    poemsToSend.push(new PoemsViewModel(
                        item.Id, item.Title, item.Text, 
                        item.LikersIds.filter(() => true).length, 
                        item.ViewersIds?.filter(() => true).length, 
                        item.ViewersIds?.indexOf(currentUserId) >= 0, 
                        item.LikersIds.indexOf(currentUserId) >= 0, 
                        item.CommentIds, item.AuthorId));
                });
                res.send(poemsToSend);
            });
});

//   http://localhost:3333/api/Poems/GetPoemById?userId=..poemId=..
PoemsRouter.get("/GetPoemById", function(req, res){
        db.sync();
        const currentUserId = req.query.userId;
        const poemId = req.query.poemId;
        
        Poems.findOne({
            where: {
                Id: poemId
            }
        }).then(item => {
            res.send(new PoemsViewModel(
                item.Id, item.Title, item.Text, 
                item.LikersIds.filter(() => true).length, 
                item.ViewersIds?.filter(() => true).length, 
                item.ViewersIds?.indexOf(currentUserId) >= 0, 
                item.LikersIds.indexOf(currentUserId) >= 0, 
                item.CommentIds, item.AuthorId));
        });
});

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