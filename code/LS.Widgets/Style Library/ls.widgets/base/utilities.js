var LS = LS || {};
LS.SP = LS.SP || {};
LS.SP.Utilities = LS.SP.Utilities || {};

(function () {
    if (LS.SP.Utilities.Loaded) {
        LS.SP.Utilities.Log('utilities.js is already loaded');
        return;
    }
    else {
        LS.SP.Utilities.Loaded = true;
    }

    this.GetListType = function (title) {
        //replace spaces
        title = title.replace(/\s+/g, '_x0020_');
        return "SP.Data." + title[0].toUpperCase() + title.substring(1) + "ListItem";
    };

    this.GetRandom = function (from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    };

    this.Log = function (msg) {
        if (window.console && console.log) {
            console.log(msg);
        }
    };

    this.EnsureScript = function (windowObject, location) {
        if (typeof windowObject === 'undefined') {
            document.write('<script type="text/javascript" src="' + location + '"><\/script>');
        }
    };

    this.ShowError = function (containerId, error, message) {
        if (!message)
            message = "We're sorry. An error occurred.";

        this.Log(error);

        var html = '<div class="errorMsg">';
        html += '<h3>';
        html += message;
        html += '</h3>';
        html += '</div>';

        $('#' + containerId).html(html);
    };

}).apply(LS.SP.Utilities);
