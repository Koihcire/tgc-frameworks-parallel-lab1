const bookshelf = require('../bookshelf')

const Poster = bookshelf.model("Poster",{
    tableName: "posters",
    mediaProperty(){
        return this.belongsTo('MediaProperty')
    },
    tags(){
        return this.belongsToMany('Tag')
    }
})

const MediaProperty = bookshelf.model("MediaProperty", {
    tableName: "mediaProperties",
    posters(){
        return this.hasMany('Poster')
    }
})

const Tag = bookshelf.model('Tag', {
    tableName: 'tags',
    posters(){
        return this.belongsToMany('Poster')
    }
})

module.exports = {Poster, MediaProperty, Tag};