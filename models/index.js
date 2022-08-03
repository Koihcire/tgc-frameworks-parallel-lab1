const bookshelf = require('../bookshelf')

const Poster = bookshelf.model("Poster",{
    tableName: "posters",
    media_property(){
        return this.belongsTo('Media_property')
    },
    tags(){
        return this.belongsToMany('Tag')
    }
})

const Media_property = bookshelf.model("Media_property", {
    tableName: "media_properties",
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

const User = bookshelf.model('User', {
    tableName: 'users'
})

module.exports = {Poster, Media_property, Tag, User};