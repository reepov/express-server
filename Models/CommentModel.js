var today = new Date();
const UUIDV4 =  require('uuid');
const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');
const { DataTypes, UUIDV1, DATE } = require('sequelize')
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');

const Comments = db.define("Comments",
  {
    Id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      default : DataTypes.UUIDV4
    },
    UserId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: 'Users',
        referenceKey: 'Id'
      },
    Text: {
        type: DataTypes.STRING,
        allowNull: false,
        default: "Empty text"
      },
    LikersIds: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
    Created: {
        type: DataTypes.STRING,
        allowNull: false,
        default: today.getDate() + "." + (today.getMonth() + 1).toString() + "." + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes()
      },
    RepliesId: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
    UpReplyId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: 'Comments',
      referenceKey: 'Id'
    },
    PoemId: {
        type: DataTypes.STRING,
        allowNull: true,
        references: 'Poems',
        referenceKey: 'Id'  
      },
    
  },
  {
    timestamps: false
  }
)

module.exports = Comments;