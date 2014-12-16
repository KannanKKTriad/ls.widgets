
(function ($) {
    LS.SP.Scripts = LS.SP.Scripts || {};
    LS.SP.Scripts.Birthdays = LS.SP.Scripts.Birthdays || {};
    if (LS.SP.Scripts.Birthdays.Loaded) {
        LS.SP.Utilities.Log('Birthdays.js is already loaded');
        return;
    }
    else {
        LS.SP.Scripts.Birthdays.Loaded = true;

        jQuery(document).on('click', '.birthdays-container .expand-more', function () {
            $(this).toggleClass('showing');

            var text = $(this).text();

            if ($(this).hasClass('showing'))
                text = text.replace('Show', 'Hide');
            else
                text = text.replace('Hide', 'Show');

            $(this).prev().slideToggle();
            $(this).text(text);
        });
    }

    var SPBirthdays = function (element, options) {
        var elem = $(element);

        var defaultOptions = {
            localStoreTimeout: 30,
            daysForward: 7,
            wishPlaceholder: 'Say happy birthday...',
            templateId: 'birthdays-template',
            noDataMessage: 'Sorry. No birthdays upcoming.',
            maxDisplay: 4,
            srchProperty: 'Birthday',
            cmprProperty: '',
            cmprMessage: 'years old'
        };

        var settings = $.extend({}, defaultOptions, options || {});

        settings.StorageKey = 'Birthdays_' + elem.attr('id');

        var getDataFromStorage = function () {
            var data = window.sessionStorage.getItem(settings.StorageKey)

            if (data) {
                try {
                    data = JSON.parse(data);
                }
                catch (ex) {
                }
            }

            if (data && data.ExpiresAt) {
                var expireDate = moment(data.ExpiresAt);

                if (expireDate > moment())
                    return data;
            }

            return undefined;
        };

        var storeDataInStorage = function (results) {
            var data = JSON.stringify({
                ExpiresAt: moment().add('minutes', settings.localStoreTimeout),
                results: results
            });

            window.sessionStorage.setItem(settings.StorageKey, data);
        };

        var getData = function () {
            var data = {};
            //if data is passed in, use it
            if (settings.data) {
                data.results = buildDataObject(settings.data);
            }
            else {
                data = getDataFromStorage();
            }

            if (data) {
                renderData(data.results);
            }
            else {
                getDataFromSearch();
            }
        };

        var getDataFromSearch = function () {

            var qryUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/search/postquery";
            //sharepoint defaults the year of the Birthday profile properties to 2000.
            //so set our time back to have accurate querires

            var start = moment();
            start.year(2000);

            var qrytxt = settings.srchProperty + '>="' + start.format("MM-DD-YYYY") + '"';

            var end = start.clone();
            end.add('days', settings.daysForward);

            if (end.year() > start.year()) {
                qrytxt += ' OR (' + settings.srchProperty + '>="01-01-2000" AND ' + settings.srchProperty + '<="' + end.format("MM-DD-2000") + '")';
            }
            else {
                qrytxt += ' AND ' + settings.srchProperty + '<="' + end.format("MM-DD-YYYY") + '"'
            }

            //build a JSON object for our search query
            var searchQry = {
                'request': {
                    '__metadata': { 'type': 'Microsoft.Office.Server.Search.REST.SearchRequest' },
                    'Querytext': qrytxt,
                    'EnableQueryRules': 'false',
                    'SourceId': 'b09a7990-05ea-4af9-81ef-edfab16c4e31', //only search within the Local People Results
                    'SelectProperties': {
                        'results': [
                            'PreferredName',
                            'PictureURL',
                             settings.srchProperty,
                            'Path',
                            'AccountName',
                            'FirstName',
                            'LastName'
                        ] //only return these properties
                    },
                    'SortList': {
                        'results': [
                            {
                                'Property': settings.srchProperty,
                                'Direction': '0'
                            }
                        ] //sort by Birthday in ASC order
                    }
                }
            };

            if (settings.cmprProperty) {
                searchQry.request.SelectProperties.results.push(settings.cmprProperty);
            }

            //go get my data
            $.ajax({
                url: qryUrl,
                type: 'POST',
                contentType: "application/json;odata=verbose",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                data: JSON.stringify(searchQry), //stringify my search query object
                dataType: 'json',
                success: $.proxy(callSuccess, this),
                error: $.proxy(callFailed, this)
            });
        };

        var callSuccess = function (data) {
            //convert from what sharepoint gives me to something more usable for handlebars
            data = buildDataObject(data.d.postquery.PrimaryQueryResult.RelevantResults.Table.Rows.results);

            //store the data
            storeDataInStorage(data);

            renderData(data);
        };

        var renderData = function (data) {
            if (data.Birthdays.length === 0) {
                elem.html('<h3>' + settings.noDataMessage + '</h3>');
                return;
            }
            //get the html contents of the template we appended to the body
            var source = $('#' + settings.templateId).html();
            //thank God for Handlebars
            var template = Handlebars.compile(source);
            //let Handlebars do all the hard work
            var html = template(data);

            //take the html handlebars generates and add it to the container
            elem.html(html);

            if (settings.maxDisplay > 0) {
                //manipulate the html to add show/hide wrapper
                var count = elem.children().length;

                if (count > settings.maxDisplay) {
                    var idx = settings.maxDisplay - 1;
                    elem.children(':gt(' + idx + ')').wrapAll('<div class="more-content clearfix"></div>');
                    elem.append('<a class="expand-more">Show more</a>');
                }
            }

            elem.find('.happy-birthday-wish').keypress(sendWish);
        };

        var buildDataObject = function (rows) {
            var data = {
                Birthdays: []
            };

            //foreach row of results
            for (var i = 0; i < rows.length; i++) {
                var r = rows[i];
                //get the row properties (cells)
                var cells = r.Cells.results;

                var path = '';
                var photoUrl = '';
                var preferredName = '';
                var birthday = '';
                var accountName = '';
                var firstName = '';
                var lastName = '';
                var yearsString = '';
                var years;
                var cmpr;

                //foreach property
                for (var x = 0; x < cells.length; x++) {
                    var c = cells[x];
                    //the Key will be the Managed property name
                    switch (c.Key) {
                        case "Path": path = c.Value; break; //the path to the user's profile
                        case settings.srchProperty: birthday = c.Value; break;
                        case settings.cmprProperty: cmpr = c.Value; break;
                        case "PictureURL": photoUrl = c.Value; break;
                        case "PreferredName": preferredName = c.Value; break;
                        case "AccountName": accountName = c.Value; break; //login name. used for posting to news feed
                        case "FirstName": firstName = c.Value; break;
                        case "LastName": lastName = c.Value; break;
                    }
                }

                //set the default image of the photo
                if (!photoUrl) {
                    photoUrl = _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/images/person.gif';
                }
                else {
                    photoUrl = photoUrl.replace('_MThumb.jpg', '_LThumb.jpg');
                    photoUrl = _spPageContextInfo.webAbsoluteUrl + '/_layouts/15/userphoto.aspx?url=' + encodeURIComponent(photoUrl)
                }

                var realDate = moment.utc(birthday);
                var now = moment();

                //check to see if the user's birthday month and day match today's month and day
                var birthdayToday = (realDate.month() == now.month() && realDate.date() == now.date());
                var isNextYear = realDate.dayOfYear() < now.dayOfYear();
                var bDayText;

                if (birthdayToday)
                    bDayText = 'Today!';
                else
                    bDayText = realDate.format('MMMM D');

                if (isNextYear)
                    bDayText += ', ' + (moment().year() + 1);

                //get the date in years
                if (settings.cmprProperty && cmpr) {
                    var comparisonYear = moment.utc(cmpr).year();
                    years = now.year() - comparisonYear;
                    yearsString = years + ' ' + settings.cmprMessage.trim();
                }

                data.Birthdays.push({
                    Name: preferredName ? preferredName : firstName + ' ' + lastName,
                    Birthday: bDayText, //if today is their birthday, say Today! Otherwise, show their birthday
                    Birthdate: realDate,
                    Path: path,
                    PhotoUrl: photoUrl,
                    AccountName: accountName,
                    BirthdayIsToday: birthdayToday,
                    FirstName: firstName,
                    LastName: lastName,
                    Placeholder: birthdayToday ? settings.wishPlaceholder : '',
                    YearsString: yearsString,
                    Years: years
                });
            }

            //sort the data
            data.Birthdays = (data.Birthdays).sort(sortBirthdays);

            return data;
        }

        var sortBirthdays = function (a, b) {
            var today = moment().startOf('day').year(2000);
            var aBDay = a.Birthdate.clone().startOf('day');
            var bBDay = b.Birthdate.clone().startOf('day');

            if (aBDay.dayOfYear() < today.dayOfYear()) {
                aBDay.add('year', 1);
            }

            if (bBDay.dayOfYear() < today.dayOfYear()) {
                bBDay.add('year', 1);
            }

            if (aBDay.year() !== bBDay.year())
                return aBDay.year() > bBDay.year() ? 1 : -1;

            if (aBDay.dayOfYear() === bBDay.dayOfYear() && (typeof (a.Years) !== 'undefined' && typeof (b.Years) !== 'undefined')) {
                var aYears = parseInt(a.Years);
                var bYears = parseInt(b.Years);

                //sort by oldest
                return aYears < bYears ? 1 : -1;
            }

            return aBDay.dayOfYear() > bBDay.dayOfYear() ? 1 : -1;
        };

        var callFailed = function (xhr, status, error) {
            LS.SP.Utilities.ShowError(elem.attr('id'), error, "We're sorry. Something didn't go right.");
        };

        var sendWish = function (e) {
            if (e.keyCode == 13 && !e.shiftKey) {
                e.preventDefault();

                //disable the textarea
                $(this).prop('disabled', true);

                var url = _spPageContextInfo.webAbsoluteUrl + '/_api/social.feed/my/feed/post';
                var userName = $(this).attr('data-user');
                var message = $(this).val();

                var wish = {
                    'restCreationData': {
                        '__metadata': {
                            'type': 'SP.Social.SocialRestPostCreationData'
                        },
                        'ID': null,
                        'creationData': {
                            '__metadata': {
                                'type': 'SP.Social.SocialPostCreationData'
                            },
                            'Attachment': null,
                            'ContentItems': {
                                'results': [
                                    {
                                        '__metadata': {
                                            'type': 'SP.Social.SocialDataItem'
                                        },
                                        'AccountName': userName,
                                        'ItemType': 0,
                                        'Uri': null
                                    }
                                ]
                            },
                            'ContentText': '@{0} ' + message,
                            'UpdateStatusText': false
                        }
                    }
                };

                $.ajax({
                    url: url,
                    type: 'POST',
                    contentType: "application/json;odata=verbose",
                    headers: {
                        "Accept": "application/json;odata=verbose",
                        "X-RequestDigest": $("#__REQUESTDIGEST").val()
                    },
                    data: JSON.stringify(wish),
                    dataType: 'json',
                    context: $(this),
                    success: function (data) {
                        var name = $(this).attr('data-name');

                        var html = "<span class=\"birthday-wish-result\">You wrote on " + name + "'s newfeed.</span>";
                        var p = $(this).parent();
                        $(this).remove();
                        p.append(html);
                    },
                    error: function (xhr, status, error) {
                        LS.SP.Utilities.Log(error);

                        var html = "<span class=\"birthday-wish-result\">We're sorry. Your post failed.</span>";
                        var p = $(this).parent();
                        $(this).remove();
                        p.append(html);
                    }
                });
            }

        };

        getData();
    };

    $.fn.SPBirthdays = function (options) {
        return this.each(function () {
            var element = $(this);

            // Return early if this element already has a plugin instance
            if (element.data('spbirthdays')) return;

            // pass options to plugin constructor
            var spbirthdays = new SPBirthdays(this, options);

            // Store plugin object in this element's data
            element.data('spbirthdays', spbirthdays);
        });
    };
})(jQuery);

