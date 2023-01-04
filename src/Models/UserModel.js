var today = new Date();
const UUIDV4 =  require('uuid');
const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');
const moment = require("moment");
const { DataTypes, UUIDV1, DATE } = require('sequelize')
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');

const Users = db.define("Users",
  {
    Id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      default : DataTypes.UUIDV4
    },
    NickName: {
      type: DataTypes.STRING,
      allowNull: false,
      default: "Guest_" + uuidv4()
    },
    DateOfCreate: {
      type: DataTypes.STRING,
      allowNull: false,
      default: moment().format("DD.MM.YYYY")
    },
    ListOfViewsPoems: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    ListOfLikedPoems: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false
      },
    ListOfLikedComments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    Password: {
        type: DataTypes.STRING,
        allowNull: false
      },
    SubscribersIds: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    Photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    timestamps: false
  }
)

module.exports = Users