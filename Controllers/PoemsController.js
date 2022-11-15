const express = require("express");
const PoemsRouter = express.Router();
const Users = require('../Models/UserModel')
const Poems = require('../Models/PoemsModel');
const { Sequelize } = require('sequelize');
const UserViewModel = require("../ViewModels/UserViewModel");
const PoemsViewModel = require('../ViewModels/PoemsViewModel');
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

module.exports = PoemsRouter;