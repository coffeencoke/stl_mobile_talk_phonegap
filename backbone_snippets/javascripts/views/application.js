(function($){
  window.ApplicationView = Backbone.View.extend({
    el: $('body'),
    
    initialize: function() {
      _.bindAll(this, 'render');
      window.mainNav = new MainNavView();
      window.header = new HeaderView();
      window.currentUser = new CurrentUser;
      window.sync = new Sync;
    },

    render: function() {
      var registrationView = new RegistrationView;
      registrationView.render();
      header.render();
      mainNav.render();
    }
  });
})(jQuery);
