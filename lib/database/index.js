const sequelize = require('sequelize');

const database = new sequelize({
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: 'postgres',
    dialectModule: require('pg'),
    logging: false,
    dialectOptions: {
        timezone: process.env.db_timezone
    },
    define: {
        freezeTableName: true,
        timestamps: false
    }
});


const account = require('./tables/account.js')(database, sequelize.DataTypes);
const storage = require('./tables/storage.js')(database, sequelize.DataTypes);
const bucketObject = require('./tables/bucketObject.js')(database, sequelize.DataTypes);
const blacklistedJwt = require('./tables/blacklistedJwt.js')(database, sequelize.DataTypes);
const currentJwt = require('./tables/currentJwt.js')(database, sequelize.DataTypes);
const loginHistory = require('./tables/loginHistory.js')(database, sequelize.DataTypes);


account.hasMany(storage, {foreignKey: 'account_id'});
storage.belongsTo(account, {foreignKey: 'account_id'});

storage.hasMany(bucketObject, {foreignKey: 'storage_id'});
bucketObject.belongsTo(storage, {foreignKey: 'storage_id'});

account.hasMany(currentJwt, {foreignKey: 'account_id'});
currentJwt.belongsTo(account, {foreignKey: 'account_id'});


account.hasMany(loginHistory, {foreignKey: 'account_id'});
loginHistory.belongsTo(account, {foreignKey: 'account_id'});

module.exports = {
    account,
    storage,
    bucketObject,
    blacklistedJwt,
    currentJwt,
    loginHistory
};