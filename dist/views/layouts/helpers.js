import { registerHelper } from "handlebars";
registerHelper('isFilmInList', function (list, film) {
    return list.includes(parseInt(film))
});