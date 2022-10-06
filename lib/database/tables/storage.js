module.exports = (sequelize, DataTypes) => {
    return sequelize.define("storage", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        account_id: { type: DataTypes.INTEGER },
        name: {type: DataTypes.STRING},
        endpoint_hash: {type: DataTypes.STRING},
        encrypted: {type: DataTypes.BOOLEAN}
    })
}