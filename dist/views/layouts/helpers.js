var hbs = require('handlebars');
hbs.registerHelper('isFilmInList', function (list, filmId) {
    if(list && list.length > 0){
        return list.includes(parseInt(filmId))
    }else{
        return false
    }
});
module.exports = hbs;