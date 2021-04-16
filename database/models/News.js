const { sequelize, DataTypes:Types }  = require('../database');

const News = sequelize.define('News', {
    id: { type: Types.BIGINT, autoIncrement: true, primaryKey: true },
    title: { type: Types.STRING, allowNull: false },
    text: { type: Types.TEXT, allowNull: false },
    preview: { type: Types.TEXT, allowNull: false },
    img_url: { type: Types.TEXT, allowNull: false },
    displayOnJumbotron: { type: Types.BOOLEAN, defaultValue: false },
}, { tableName: 'news' });

module.exports = News;
