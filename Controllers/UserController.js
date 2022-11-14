
const express = require("express");
const router = express.Router();
const Users = require('../Models/UserModel')
const { Sequelize } = require('sequelize');
const UserViewModel = require("../ViewModels/UserViewModel");
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');
Users.sync()
router.get("/api/User/GetUserById", function (req, res) {
    db.sync();
    let currentUserId = req.query.currentUserId
    let userId = req.query.userId
    Users.findOne({
        where: {
           Id: userId
        }
    }).then(users=>{
        let user = users;
        res.send(new UserViewModel(user.Id, user.NickName, []));
      }).catch(err=>res.send(err));
});

router.get("/about", function (req, res) {
  res.send("About this wiki");
});

module.exports = router;