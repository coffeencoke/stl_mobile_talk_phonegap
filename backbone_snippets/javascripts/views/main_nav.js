(function($) {
  window.MainNavView = Backbone.View.extend({
    el: $('body'),
    template: _.template($.ajax('templates/shared/main_nav.html', {async: false}).responseText),

    initialize: function() {
      _.bindAll(this, 'render');
    },

    render: function() {
      $(this.el).append(this.template());

      this.setupLinks();
      this.loadNavAsHidden();
    },

    setCurrentPage: function(page){
      $('#mainNav .current').removeClass('current');
      $('#mainNav a[data-page_name=' + page + ']').addClass('current');
    },

    show: function(page){
      this.setCurrentPage(page);
      var $this = this;
      $('#mainNav', $this.el).animate(
        { bottom: 0 }, 
        { duration: 1000 }
      );
    },

    loadNavAsHidden: function(){
      $('#mainNav', this.el).animate(
        { bottom: -50 }, 
        {
          duration: 0
        }
      );
    },

    hide: function(){
      $('#mainNav', this.el).animate(
        { bottom: -50 }, 
        {
          duration: 1000
        }
      );
    },

    setupLinks: function(){
      var $this = this;

      $('#mainNav a[data-page_name=summary]', this.el).click(function(e) {
        e.preventDefault();
        $this.setCurrentPage('summary');
        var summaryView = new SummaryView;
        summaryView.render();
      });
      $('#mainNav a[data-page_name=entry]', this.el).click(function(e) {
        e.preventDefault();
        $this.setCurrentPage('entry');
        var newEntryView = new NewEntryView();
        newEntryView.render();
      });
      $('#mainNav a[data-page_name=history]', this.el).click(function(e) {
        e.preventDefault();
        $this.setCurrentPage('history');
        var entryHistoryView = new EntryHistoryView();
        entryHistoryView.render();
      });
      $('#mainNav a[data-page_name=logout]', this.el).click(function(e) {
        e.preventDefault();
        $this.showLogoutConfirm();
      });
    },

    showLogoutConfirm: function(){
      var $this = this;

      if(typeof(device) == 'undefined'){
        var buttonSelectedOnConfirm = confirm('Are you sure you want to logout?');
        if(buttonSelectedOnConfirm)
          applicationHelper.logout();
      }else{
        navigator.notification.confirm(
          'Are you sure you want to logout?',  // message
          function(button){
            if(button == 2)
              applicationHelper.logout();
          },
          'Logging Out',            // title
          'Cancel,Logout'          // buttonLabels
        );
      }
    }
  });
})(jQuery);

