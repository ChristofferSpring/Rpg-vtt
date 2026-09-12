const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

// 1. O Usuário (Global)
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
});

// 2. A Partida/Mesa
const Game = sequelize.define('Game', {
  name: { type: DataTypes.STRING, allowNull: false },
  inviteCode: { type: DataTypes.STRING, unique: true } // Código para convidar amigos
});

// 3. A Relação (Quem é o que em qual mesa)
const UserGame = sequelize.define('UserGame', {
  role: { 
    type: DataTypes.ENUM('MESTRE', 'JOGADOR'), 
    defaultValue: 'JOGADOR' 
  }
});

// Relacionamentos (Associações)
User.belongsToMany(Game, { through: UserGame });
Game.belongsToMany(User, { through: UserGame });

// Para facilitar buscas depois: "Game.hasMany(UserGame)"
Game.hasMany(UserGame);
UserGame.belongsTo(User);
UserGame.belongsTo(Game);

// alter:true força reconstrução de tabelas no SQLite (drop+recria) a cada boot,
// o que quebra com FOREIGN KEY constraint assim que há tabelas relacionadas.
// Schema já criado só precisa existir; mudanças de coluna devem virar migration.
sequelize.sync();

module.exports = { sequelize, User, Game, UserGame };