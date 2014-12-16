using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Web;
using System.Web.UI.WebControls.WebParts;

namespace LS.Widgets.Birthdays {
    [ToolboxItemAttribute(false)]
    public partial class Birthdays : WebPart {

        // Uncomment the following SecurityPermission attribute only when doing Performance Profiling on a farm solution
        // using the Instrumentation method, and then remove the SecurityPermission attribute when the code is ready
        // for production. Because the SecurityPermission attribute bypasses the security check for callers of
        // your constructor, it's not recommended for production purposes.
        // [System.Security.Permissions.SecurityPermission(System.Security.Permissions.SecurityAction.Assert, UnmanagedCode = true)]
        public Birthdays() {
        }

        #region WebPart Properties
        int _dayForward = 7;
        [WebBrowsable(true),
         WebDisplayName("Days Forward"),
         WebDescription(""),
         Personalizable(PersonalizationScope.Shared),
         Category("Custom")]
        public int DaysForward {
            get { return _dayForward; }
            set { _dayForward = value; }
        }

        int _cacheTime = 30;
        [WebBrowsable(true),
         WebDisplayName("Client Cache Minutes"),
         WebDescription("Length of cache in minutes"),
         Personalizable(PersonalizationScope.Shared),
         Category("Custom")]
        public int Cache_Time {
            get { return _cacheTime; }
            set { _cacheTime = value; }
        }

        string _wishPlaceholder = "Say happy birthday...";
        [WebBrowsable(true),
         WebDisplayName("Wish Placeholder"),
         WebDescription(""),
         Personalizable(PersonalizationScope.Shared),
         Category("Custom")]
        public string WishPlaceholder {
            get { return _wishPlaceholder; }
            set { _wishPlaceholder = value; }
        }

        string _noResultsMessage = "Sorry. No birthdays upcoming.";
        [WebBrowsable(true),
         WebDisplayName("No Results Message"),
         WebDescription(""),
         Personalizable(PersonalizationScope.Shared),
         Category("Custom")]
        public string NoResultsMessage {
            get { return _noResultsMessage; }
            set { _noResultsMessage = value; }
        }

        string _srchProperty = "Birthday";
        [WebBrowsable(true),
         WebDisplayName("Search Property"),
         WebDescription(""),
         Personalizable(PersonalizationScope.Shared),
         Category("Custom")]
        public string SearchProperty {
            get { return _srchProperty; }
            set { _srchProperty = value; }
        }

        string _cmprProperty = string.Empty;
        [WebBrowsable(true),
         WebDisplayName("Comparison Property"),
         WebDescription(""),
         Personalizable(PersonalizationScope.Shared),
         Category("Custom")]
        public string ComparisonProperty {
            get { return _cmprProperty; }
            set { _cmprProperty = value; }
        }

        string _cmprMessage = string.Empty;
        [WebBrowsable(true),
         WebDisplayName("Comparison Message"),
         WebDescription(""),
         Personalizable(PersonalizationScope.Shared),
         Category("Custom")]
        public string ComparisonMessage {
            get { return _cmprMessage; }
            set { _cmprMessage = value; }
        }

        int _maxToDisplay = 4;
        [WebBrowsable(true),
         WebDisplayName("Max to Display"),
         WebDescription(""),
         Personalizable(PersonalizationScope.Shared),
         Category("Custom")]
        public int MaxDisplay {
            get { return _maxToDisplay; }
            set { _maxToDisplay = value; }
        }

        #endregion

        protected override void OnInit(EventArgs e) {
            base.OnInit(e);
            InitializeControl();
        }

        protected void Page_Load(object sender, EventArgs e) {
        }

        protected string GetJSOptions() {
            var options = new List<string>();

            options.Add(GetOptionString("daysForward", this.DaysForward));

            options.Add(GetOptionString("localStoreTimeout", this.Cache_Time));

            options.Add(GetOptionString("maxDisplay", this.MaxDisplay));

            options.Add(GetOptionString("noDataMessage", this.NoResultsMessage));

            options.Add(GetOptionString("wishPlaceholder", this.WishPlaceholder));

            options.Add(GetOptionString("cmprProperty", this.ComparisonProperty));

            options.Add(GetOptionString("cmprMessage", this.ComparisonMessage));

            options.Add(GetOptionString("srchProperty", this.SearchProperty));

            return string.Format("{{ {0} }}", string.Join(",", options.ToArray()));
        }

        private string GetOptionString(string key, string value) {
            value = HttpUtility.JavaScriptStringEncode(value.ToString());

            return string.Format("{0} : '{1}'", key, value);
        }

        private string GetOptionString(string key, int value) {
            return string.Format("{0} : {1}", key, value);
        }
    }
}
