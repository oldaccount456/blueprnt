module.exports = (sequelize, DataTypes) => {
    return sequelize.define("verify_request", {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        account_id: { type: DataTypes.INTEGER },
        verification_hash: {type: DataTypes.STRING},
        verification_action: {type: DataTypes.STRING},
        given_data: {type: DataTypes.STRING},
        created_at: {type: DataTypes.DATE},
    })
}