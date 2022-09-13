module.exports = (sequelize, DataTypes) => {
    return sequelize.define("blacklisted_jwt", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        jwt_token: {type: DataTypes.STRING}
    })
}