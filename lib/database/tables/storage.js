module.exports = (sequelize, DataTypes) => {
    return sequelize.define("storage", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        account_id: { type: DataTypes.INTEGER },
        endpoint_hash: {type: DataTypes.STRING},
        encrypted: {type: DataTypes.BOOLEAN},
        view_amount: { type: DataTypes.INTEGER },
        view_count: { type: DataTypes.INTEGER },
        expiry: { type: DataTypes.INTEGER },
        note: {type: DataTypes.STRING}
    })
}