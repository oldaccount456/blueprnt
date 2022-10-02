module.exports = (sequelize, DataTypes) => {
    return sequelize.define("verify_login", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        account_id: { type: DataTypes.INTEGER },
        ip_address: {type: DataTypes.STRING},
        verification_hash: {type: DataTypes.STRING},
        created_at: {type: DataTypes.DATE},
    })
}