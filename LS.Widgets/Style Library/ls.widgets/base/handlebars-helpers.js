LS.SP.HandlebarsHelpers = LS.SP.HandlebarsHelpers || {};

Handlebars.registerHelper('formatDate', function (value, options) {
    if (value) {
        var format = 'M/DD/YYYY';
        if (options.hash['format'])
            format = options.hash['format'];

        var html = moment(value.toString()).format(format);

        return new Handlebars.SafeString(html);
    }
});