const express = require("express");
const bodyParser = require('body-parser');
const PoemsRouter = express.Router();
var multer = require('multer');
var upload = multer();
const Users = require('../Models/UserModel')
const Poems = require('../Models/PoemsModel');
const { Sequelize } = require('sequelize');
const UserViewModel = require("../ViewModels/UserViewModel");
const PoemsViewModel = require('../ViewModels/PoemsViewModel');
const router = require("./UserController");
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
Users.sync();
Poems.sync();
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

PoemsRouter.post("/AuthorSendPoem", function(req, res){
    db.sync();
    const Title = req.query.title
    const userId = req.query.userId
    const text = req.body.text.trimEnd(']').trimStart('[').split("|, ");
    res.send(text);

})

module.exports = PoemsRouter;