<%@ Assembly Name="$SharePoint.Project.AssemblyFullName$" %>
<%@ Assembly Name="Microsoft.Web.CommandUI, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="asp" Namespace="System.Web.UI" Assembly="System.Web.Extensions, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35" %>
<%@ Import Namespace="Microsoft.SharePoint" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="Birthdays.ascx.cs" Inherits="LS.Widgets.Birthdays.Birthdays" %>

<!--css-->
<link href="<%= SPContext.Current.Site.ServerRelativeUrl.TrimEnd('/')  %>/style library/ls.widgets/birthdays/birthdays.min.css" rel="stylesheet">

<!-- load necessary scripts-->
<script src="<%= SPContext.Current.Site.ServerRelativeUrl.TrimEnd('/') %>/style library/ls.widgets/base/utilities.js"></script>

<script>
    //momentjs
    LS.SP.Utilities.EnsureScript(window.moment, "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js");

    //jQuery
    LS.SP.Utilities.EnsureScript(window.jQuery, "//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js");

    //handlebars
    LS.SP.Utilities.EnsureScript(window.handlebars, "//cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0/handlebars.min.js");
</script>

<script src="<%= SPContext.Current.Site.ServerRelativeUrl.TrimEnd('/') %>/style library/ls.widgets/base/handlebars-helpers.js"></script>
<script src="<%= SPContext.Current.Site.ServerRelativeUrl.TrimEnd('/') %>/style library/ls.widgets/birthdays/birthdays.js"></script>

<script id="birthdays-template" type="text/x-handlebars-template">
    {{#each Birthdays}}

    <div class="birthday-item clearfix">

        <div class="birthday-photo">
            <div class="photo-content">
                <a href="{{Path}}">
                <img src="{{PhotoUrl}}" /></a>
            </div>            
        </div>

        <div class="birthday-info">

             <h2 class="name"><a href="{{Path}}">{{Name}}</a></h2>
             <h3 class="birthday">{{Birthday}}{{#if BirthdayIsToday}}&nbsp;{{YearsString}}{{/if}}</h3>

            {{#if BirthdayIsToday}}
                <input type="text" class="happy-birthday-wish" data-user="{{AccountName}}" data-name="{{FirstName}}" placeholder="{{Placeholder}}" />
            {{else}}
                <div class="years-string">{{YearsString}}</div>
            {{/if}}
        </div>

    </div>

    {{/each}}
</script>

<div id="bdays_<%= this.ID %>" class="birthdays-container">
    <h3>Loading 
        <img src="<%= SPContext.Current.Site.ServerRelativeUrl.TrimEnd('/') %>/_layouts/15/images/gears_anv4.gif" /></h3>
</div>

<script>
    var eleId = 'bdays_<%= this.ID %>';

    jQuery('#' + eleId).SPBirthdays(
                <%= GetJSOptions() %>
            );

</script>
