var today = new Date();
const UUIDV4 =  require('uuid');
const { v4: uuidv4 } = require('uuid');
const { Sequelize } = require('sequelize');
const { DataTypes, UUIDV1, DATE } = require('sequelize')
const db = new Sequelize('postgresql://postgres:postgres@185.119.56.91:5432/postgres');

const Poems = db.define("Poems",
  {
    Id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      default : DataTypes.UUIDV4.v4
    },
    Title: {
      type: DataTypes.STRING,
      allowNull: false,
      default: "Без названия"
    },
    Text: {
        type: DataTypes.TEXT,
        allowNull: false,
        default: "Empty text"
      },
    LikersIds: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    ViewersIds: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    CommentIds: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
    AuthorId: {
        type: DataTypes.STRING,
        allowNull: false,

        references: {
          model: 'Users',
          key: 'Id'
        }
      }
  },
  {
    timestamps: false
  }
)

module.exports = Poems;