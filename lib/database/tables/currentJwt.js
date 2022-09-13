module.exports = (sequelize, DataTypes) => {
    return sequelize.define("current_jwt", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        account_id: { type: DataTypes.INTEGER },
        jwt_token: {type: DataTypes.STRING},
    })
}