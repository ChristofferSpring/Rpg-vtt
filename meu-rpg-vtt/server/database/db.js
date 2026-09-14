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
  inviteCode: { type: DataTypes.STRING, unique: true }, // Code to invite friends
  backgroundImageUrl: { type: DataTypes.STRING, allowNull: true },
  gridWidth: { type: DataTypes.INTEGER, defaultValue: 40 },
  gridHeight: { type: DataTypes.INTEGER, defaultValue: 30 }
});

// 3. The relation (who is what in which game)
const UserGame = sequelize.define('UserGame', {
  role: {
    type: DataTypes.ENUM('MASTER', 'PLAYER'),
    defaultValue: 'PLAYER'
  }
});

// 4. A token/piece on a game's board
const Token = sequelize.define('Token', {
  x: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  y: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  color: { type: DataTypes.STRING, allowNull: false, defaultValue: '#3182ce' },
  label: { type: DataTypes.STRING, allowNull: false },
  visibility: { type: DataTypes.ENUM('all', 'owner'), defaultValue: 'all' },
  imageUrl: { type: DataTypes.STRING, allowNull: true }
});

// 5. A chat line in a game's room
const ChatMessage = sequelize.define('ChatMessage', {
  username: { type: DataTypes.STRING, allowNull: false },
  text: { type: DataTypes.STRING, allowNull: false }
});

// Associations
User.belongsToMany(Game, { through: UserGame });
Game.belongsToMany(User, { through: UserGame });

// To make lookups easier later: "Game.hasMany(UserGame)"
Game.hasMany(UserGame);
UserGame.belongsTo(User);
UserGame.belongsTo(Game);

Game.hasMany(Token);
Token.belongsTo(Game);
User.hasMany(Token, { foreignKey: 'ownerId', as: 'ownedTokens' });
Token.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Game.hasMany(ChatMessage);
ChatMessage.belongsTo(Game);
User.hasMany(ChatMessage);
ChatMessage.belongsTo(User);

// alter:true rebuilds tables on every boot and blows up once foreign keys
// exist, so new columns get added by hand below instead
async function ensureColumns(table, columns) {
  const [existingColumns] = await sequelize.query(`PRAGMA table_info(\`${table}\`)`);
  const existing = existingColumns.map((column) => column.name);

  const missing = columns.filter((column) => !existing.includes(column.name));
  for (const column of missing) {
    await sequelize.query(column.sql);
  }
}

async function ensureGameColumns() {
  await ensureColumns('Games', [
    { name: 'backgroundImageUrl', sql: 'ALTER TABLE `Games` ADD COLUMN `backgroundImageUrl` VARCHAR(255)' },
    { name: 'gridWidth', sql: 'ALTER TABLE `Games` ADD COLUMN `gridWidth` INTEGER DEFAULT 40' },
    { name: 'gridHeight', sql: 'ALTER TABLE `Games` ADD COLUMN `gridHeight` INTEGER DEFAULT 30' }
  ]);

  await ensureColumns('Tokens', [
    { name: 'imageUrl', sql: 'ALTER TABLE `Tokens` ADD COLUMN `imageUrl` VARCHAR(255)' }
  ]);
}

const ready = sequelize.sync().then(ensureGameColumns);

module.exports = { sequelize, User, Game, UserGame, Token, ChatMessage, ready };
