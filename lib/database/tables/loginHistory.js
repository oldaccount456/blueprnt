module.exports = (sequelize, DataTypes) => {
    return sequelize.define("login_history", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        account_id: { type: DataTypes.INTEGER },
        ip_address: {type: DataTypes.STRING},
        login_date: {type: DataTypes.DATE},
    });
}