module.exports = (sequelize, DataTypes) => {
    return sequelize.define("bucket_object", {
        storage_id: {type: DataTypes.INTEGER, primaryKey: true},
        bucket_key: {type: DataTypes.STRING, primaryKey: true},
        mimetype: {type: DataTypes.STRING}
    })
}