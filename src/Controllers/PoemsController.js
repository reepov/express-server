const multer = require('multer');
const express = require("express");
const PoemsRouter = express.Router();
const bodyParser = require('body-parser');
const UserRouter = require("./UserController");
const Users = require('../Models/UserModel')
const Poems = require('../Models/PoemsModel');
const moment = require("moment");
const Comments = require('../Models/CommentModel'); 
const { Sequelize, STRING } = require('sequelize');
const UserViewModel = require("../ViewModels/UserViewModel");
const PoemsViewModel = require('../ViewModels/PoemsViewModel');
const CommentViewModel = require("../ViewModels/CommentViewModel");
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
const UUIDV4 =  require('uuid');
const { use } = require('./UserController');
const upload = multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
  })
const Op = Sequelize.Op;
Users.sync();
Poems.sync();

//   http://localhost:3333/api/Poems/GetCommentsByPoemId?userId=..poemId=..
PoemsRouter.get("/GetCommentsByPoemId", async function(req, res){
    db.sync();
    const currentUserId = req.query.userId;
    const poemId = req.query.poemId;
    let i = 0;
    const wholeMainComments = await Comments.findAll({
        where:{
            PoemId: poemId,
            UpReplyId:{
                [Op.is]: null
            }
        }
    });
    const wholeReplyComments = await Comments.findAll({
        where: {
            UpReplyId: {
                [Op.not]: null
            },
            PoemId: poemId
        }
    });
    const comms = [];
    for(let i = 0; i < wholeMainComments.length; i++)
    {
        let item = wholeMainComments[i]
        const author = await Users.findOne({
            where: {
                Id : item.UserId
            }
        });
        comms.push(new CommentViewModel(
            item.Id, author.NickName, item.Text, 
            item.LikersIds.filter(() => true).length, 
            item.LikersIds.indexOf(currentUserId) >= 0, 
            item.Created, item.RepliesId, item.UpReplyId, poemId, author.Id, author.Photo));
        for(let j = 0; j < wholeReplyComments.length; j++)
        {
            let replyItem = wholeReplyComments[j];
            if (replyItem.UpReplyId === item.Id) {
                const replyAuthor = await Users.findOne({
                    where: {
                        Id : replyItem.UserId
                    }
                });
                comms.push(new CommentViewModel(
                    replyItem.Id, replyAuthor.NickName, replyItem.Text, 
                    replyItem.LikersIds.filter(() => true).length, 
                    replyItem.LikersIds.indexOf(currentUserId) >= 0, 
                    replyItem.Created, replyItem.RepliesId, replyItem.UpReplyId, poemId, replyAuthor.Id, replyAuthor.Photo));
            }
        }
    };
    if(comms.length == wholeMainComments.length + wholeReplyComments.length) res.send(comms); 
});
    

//   http://localhost:3333/api/Poems/GetCommentById?commId=..currentUserId=..
PoemsRouter.get("/GetCommentById", async function(req, res) {
        db.sync();
        const commId = req.query.commId;
        const currentId = req.query.currentUserId;

        const comment = await Comments.findOne({
            where: {
                Id: commId
            }
        });

        Users.findOne({
            where: {
                Id: comment.UserId
            }
        }).then(user => {
            res.send(new CommentViewModel(comment.Id, user.NickName, 
                comment.Text, comment.LikersIds.filter(() => true).length, 
                comment.LikersIds.indexOf(currentId) >= 0, comment.Created, 
                comment.RepliesId, comment.UpReplyId, comment.PoemId, user.Id, user.Photo));
        }); 
});

//   http://localhost:3333/api/Poems/GetAllPoemsByAuthorId?authorId=..currentUserId=..
PoemsRouter.get("/GetAllPoemsByAuthorId", async function(req, res){
        db.sync();
        const authorId = req.query.authorId;
        const currentUserId = req.query.currentUserId;
        const user = await Users.findOne({
            where: {
                Id: authorId
            }
        });
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
                        item.CommentIds, item.AuthorId, item.Created, user.NickName, item.Description));
                });
                res.send(poemsToSend.sort((a, b) => Number(a.isViewedByCurrentUser) - Number(b.isViewedByCurrentUser)));
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
            Users.findOne({
                where: {
                    Id: item.AuthorId
                }
            }).then(user => {
                res.send(new PoemsViewModel(
                    item.Id, item.Title, item.Text, 
                    item.LikersIds.filter(() => true).length, 
                    item.ViewersIds?.filter(() => true).length, 
                    item.ViewersIds?.indexOf(currentUserId) >= 0, 
                    item.LikersIds.indexOf(currentUserId) >= 0, 
                    item.CommentIds, item.AuthorId, item.Created, user.NickName, item.Description));
            });
        });
});

PoemsRouter.get("/Redirect", function(req, res){
    const poemId = req.query.poemId;
    res.redirect('https://www.rustore.ru');
});

//  http://localhost:3333/api/Poems/GetListOfRandomPoems?userId=
PoemsRouter.get("/GetListOfRandomPoems", async function(_req, res){
    db.sync();
    const currentUserId = _req.query.userId;
    let poems;
    poems = await Poems.findAll({
        order: Sequelize.literal('random()')
    });
    let poemsToSend = [];
    for(let i = 0; i < poems.length; i++)
    {
        let user = await Users.findOne({
            where: {
                Id: poems[i].AuthorId
            }
        });
        poemsToSend.push(new PoemsViewModel(
            poems[i].Id, poems[i].Title, poems[i].Text, 
            poems[i].LikersIds.filter(() => true).length, 
            poems[i].ViewersIds?.filter(() => true).length, 
            poems[i].ViewersIds?.indexOf(currentUserId) >= 0, 
            poems[i].LikersIds.indexOf(currentUserId) >= 0, 
            poems[i].CommentIds, poems[i].AuthorId, poems[i].Created, user.NickName, poems[i].Description));
    };
    
    res.send(poemsToSend.sort((a, b) => Number(a.isViewedByCurrentUser) - Number(b.isViewedByCurrentUser)));
});

PoemsRouter.get("/GetListOfSubscribedPoems", async function(_req, res){
    db.sync();
    const currentUserId = _req.query.userId;
    let poems = []
    const poemsToSend = [];
    await Users.findAll({
        where: {
            SubscribersIds : {[Op.contains] : [currentUserId]}
        }
    }).then(async mySubs => {
        for (let i = 0; i < mySubs.length; i++){
            let p = await Poems.findAll({
                order: Sequelize.literal('random()'),
                where: {
                    AuthorId: mySubs[i].Id
                }
            });
            poems = [...poems, ...p];
        }
        for (let i = poems.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = poems[i];
            poems[i] = poems[j];
            poems[j] = temp;
        }
        for(let i = 0; i < poems.length; i++)
        {
            let user = await Users.findOne({
                where:{
                    Id: poems[i].AuthorId
                }
            });
            poemsToSend.push(new PoemsViewModel(
                poems[i].Id, poems[i].Title, poems[i].Text, 
                poems[i].LikersIds.filter(() => true).length, 
                poems[i].ViewersIds?.filter(() => true).length, 
                poems[i].ViewersIds?.indexOf(currentUserId) >= 0, 
                poems[i].LikersIds.indexOf(currentUserId) >= 0, 
                poems[i].CommentIds, poems[i].AuthorId, poems[i].Created, user.NickName, poems[i].Description));
        }
        res.send(poemsToSend.sort((a, b) => Number(a.isLikedByCurrentUser) - Number(b.isLikedByCurrentUser)));
    });
});

//  http://localhost:3333/api/Poems/AuthorSendPoem?userId=..title=.. (+form-data calls message)
PoemsRouter.post("/AuthorSendPoem", async function(req, res){
    db.sync();
    const Title = req.query.title;
    console.log(Title);
    let today = new Date();
    const userId = req.query.userId;
    const description = req.query.description
    const text = req.body.message.toString().split('').reverse().join('').replace(']', '')
                            .split('').reverse().join('').replace('[', '').split("|, ");
    console.log(text);
    let textpoem = "";
    text.forEach(item => {
        textpoem += item + "\n";
    });
    let a = true;
    let newPoem = await Poems.create({
        Id: UUIDV4.v4(),
        Title: Title,
        Text: textpoem,
        LikersIds: [],
        ViewersIds: [],
        CommentIds: [],
        AuthorId: userId,
        Created: moment().format("DD.MM.YYYY"),
        Description: description
    }).catch(a = false);
    res.send(a);
});

//   http://localhost:3333/api/Poems/UpdatePoem?poemId=..title=.. (+form-data calls text)
PoemsRouter.post("/UpdatePoem", async function(req, res) {
        db.sync();
        const poemId = req.query.poemId;
        const title = req.query.title;
        const description = req.query.description
        const text = req.body.message.toString().split('').reverse().join('').replace(']', '')
                            .split('').reverse().join('').replace('[', '').split("|, ");
        let textpoem = "";
        text.forEach(item => {
            textpoem += item + "\n";
        });
        const poem = await Poems.findOne({
            where:{
                Id: poemId
            }
        });
        poem.Text = textpoem;
        poem.Title = title;
        poem.Description = description;
        poem.save();
        res.send(true);
});

//   http://localhost:3333/api/Poems/DeletePoem?poemId=..
PoemsRouter.post("/DeletePoem", async function(req, res){
        db.sync();
        const poemId = req.query.poemId;
        Poems.destroy({
            where: {
                Id: poemId
            }
        });
        Comments.destroy({
            where: {
                PoemId: poemId
            }
        });
        res.send(true);
});

//   http://localhost:3333/api/Poems/SetLikeToPoem?userId=..&poemId=..
PoemsRouter.post("/SetLikeToPoem", async function(req, res){
    db.sync();
    const userId = req.query.userId;
    const poemId = req.query.poemId;
    const poem = await Poems.findOne({
        where: {
            Id: poemId
        }
    });
    const user = await Users.findOne({
        where:{
            Id: userId
        }
    });
    poem.LikersIds = [...poem.LikersIds, userId];
    user.ListOfLikedPoems = [...user.ListOfLikedPoems, poemId];
    poem.save();
    user.save();
    res.send(true);
});

//   http://localhost:3333/api/Poems/RemoveLikeFromPoem?userId=..&poemId=..
PoemsRouter.post("/RemoveLikeFromPoem", async function(req, res){
    db.sync();
    const userId = req.query.userId;
    const poemId = req.query.poemId;
    const poem = await Poems.findOne({
        where: {
            Id: poemId
        }
    });
    const user = await Users.findOne({
        where:{
            Id: userId
        }
    });
    let arr_1 = [...poem.LikersIds];
    const array_1 = arr_1.filter(function (id) {
        return id !== userId;
    });
    poem.LikersIds = [...array_1];

    let arr_2 = [...user.ListOfLikedPoems];
    const array_2 = arr_2.filter(function (id) {
        return id !== poemId;
    });
    user.ListOfLikedPoems = [...array_2];

    poem.save();
    user.save();
    res.send(true);
});

//   http://localhost:3333/api/Poems/SetCommentToPoem?userId=..&poemId=..&text=..
PoemsRouter.post("/SetCommentToPoem", async function(req, res){
    db.sync();
    const userId = req.query.userId;
    const poemId = req.query.poemId;
    const text = req.query.text;
    let today = new Date();

    let poem = await Poems.findOne({
        where: {
            Id: poemId
        }
    });
    let newComm = await Comments.create({
        Id: UUIDV4.v4(),
        UserId: userId,
        Text: text,
        LikersIds: [],
        Created: moment().format("DD.MM.YYYY"),
        RepliesId: [],
        UpReplyId: null,
        PoemId: poemId
    });
    poem.CommentIds = [...poem.CommentIds, newComm.Id];
    poem.save();
    res.send(true);
});

//   http://localhost:3333/api/Poems/RemoveCommentFromPoem?commentId=
PoemsRouter.post("/RemoveCommentFromPoem", async function(req, res){
    db.sync();
    const commentId = req.query.commentId;
    let a = "";
    let comment = await Comments.findOne({
        where:{
            Id: commentId
        }
    });
    Poems.findOne({
        where:{
            Id: comment.PoemId
        }
    }).then(async poem=>{
        if(comment.UpReplyId !== null){
            const upReply = await Comments.findOne({
                where: {
                    Id: comment.UpReplyId
                }
            });
            Comments.destroy({
                where:{
                    Id: commentId
                }
            });
            let arr_1 = [...poem.CommentIds];
            const array_1 = arr_1.filter(function (id) {
                return id !== commentId;
            });
            poem.CommentIds = [...array_1];

            let arr = [...upReply.RepliesId]
            const array = arr.filter(function(id){
                return id !== commentId;
            })
            upReply.RepliesId = [...array];
            upReply.save();
            poem.save();
            res.send("Ответ");
        }
        else{
            comment.Text = "Комментарий удален пользователем.";
            comment.LikersIds = [];
            comment.Created = "-1";
            comment.save();
            res.send("Главный");
        }
    });
});

//   http://localhost:3333/api/Poems/SetLikeToComment?userId=..&commentId=..
PoemsRouter.post("/SetLikeToComment", async function(req, res){
    db.sync();
    const userId = req.query.userId;
    const commentId = req.query.commentId;
    let a = true;
    Users.findOne({
        where: {
            Id: userId
        }
    }).then(user => {
        Comments.findOne({
            where:{
                Id: commentId
            }
        }).then(comment => {
            user.ListOfLikedComments = [...user.ListOfLikedComments, commentId];
            comment.LikersIds = [...comment.LikersIds, userId];

            user.save();
            comment.save();
        });
    }).catch(a = false);
    res.send(a);
});

//   http://localhost:3333/api/Poems/RemoveLikeFromComment?userId=..&commentId=..
PoemsRouter.post("/RemoveLikeFromComment", async function(req, res){
    db.sync();
    const userId = req.query.userId;
    const commentId = req.query.commentId;
    const user = await Users.findOne({
        where: {
            Id: userId
        }
    });
    const comment = await Comments.findOne({
        where:{
            Id: commentId
        }
    });
    let arr_2 = [...user.ListOfLikedComments];
    const array_2 = arr_2.filter(function (Id) {
        return Id !== commentId;
    });
    user.ListOfLikedComments = [...array_2];

    let arr = [...comment.LikersIds];
    const array = arr.filter(function(Id){
        return Id !== userId;
    });
    comment.LikersIds = [...array];

    user.save();
    comment.save();
    res.send(true);
});

//   http://localhost:3333/api/Poems/SetReplyToComment?commentId=..&userId=..&text=..
PoemsRouter.post("/SetReplyToComment", async function(req, res){
    db.sync();
    const commentId = req.query.commentId;
    const userId = req.query.userId;
    const text = req.query.text;
    const today = new Date();
    const comment = await Comments.findOne({
        where:{
            Id: commentId
        }
    });
    const poem = await Poems.findOne({
        where: {
            Id: comment.PoemId
        }
    });
    var replyId;
    if(comment.UpReplyId !== null) replyId = comment.UpReplyId;
    else replyId = comment.Id; 
    let newComm = await Comments.create({
        Id: UUIDV4.v4(),
        UserId: userId,
        Text: text,
        LikersIds: [],
        Created: moment().format("DD.MM.YYYY"),
        RepliesId: [],
        UpReplyId: replyId,
        PoemId: comment.PoemId
    });
    poem.CommentIds = [...poem.CommentIds, newComm.Id];
    poem.save();
    comment.RepliesId = [...comment.RepliesId, newComm.Id];
    comment.save();
    res.send(true);
});

PoemsRouter.post("/SetViewToPoem", async function(req, res) {
    db.sync();
    const poemId = req.query.poemId;
    const userId = req.query.userId;

    const poem = await Poems.findOne({
        where: {
            Id: poemId
        }
    })
    const user = await Users.findOne({
        where:{
            Id: userId
        }
    })
    if([...poem.ViewersIds].indexOf(userId) < 0) { poem.ViewersIds = [...poem.ViewersIds, userId]; }
    if([...user.ListOfViewsPoems].indexOf(poemId) < 0) {user.ListOfViewsPoems = [...user.ListOfViewsPoems, poemId];}
    poem.save();
    user.save();
    res.send(true);
});

module.exports = PoemsRouter;