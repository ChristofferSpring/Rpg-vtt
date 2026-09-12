const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

// 1. The User (global)
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
});

// 2. The Game/Table
const Game = sequelize.define('Game', {
  name: { type: DataTypes.STRING, allowNull: false },
  inviteCode: { type: DataTypes.STRING, unique: true } // Code to invite friends
});

// 3. The relation (who is what in which game)
const UserGame = sequelize.define('UserGame', {
  role: {
    type: DataTypes.ENUM('MASTER', 'PLAYER'),
    defaultValue: 'PLAYER'
  }
});

// Associations
User.belongsToMany(Game, { through: UserGame });
Game.belongsToMany(User, { through: UserGame });

// To make lookups easier later: "Game.hasMany(UserGame)"
Game.hasMany(UserGame);
UserGame.belongsTo(User);
UserGame.belongsTo(Game);

// alter:true forces SQLite to rebuild tables (drop+recreate) on every boot,
// which breaks with a FOREIGN KEY constraint as soon as related tables exist.
// The schema just needs to exist once; column changes should become a migration.
sequelize.sync();

module.exports = { sequelize, User, Game, UserGame };