module.exports = (sequelize, DataTypes) => {
    return sequelize.define("account", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
        created_at: { type: DataTypes.DATE },
        api_key: { type: DataTypes.STRING },
    })
}