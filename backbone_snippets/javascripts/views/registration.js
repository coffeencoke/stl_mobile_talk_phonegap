(function($){
  window.RegistrationView = Backbone.View.extend({
    el: $('body'),
    template: _.template($.ajax('templates/registration.html', {async: false}).responseText),

    initialize: function() {
      _.bindAll(this, 'render', 'register', 'complete', 'addErrorMessages', 'clearExistingErrorMessages', 'createCurrentUserData', 'renderLoginPage', 'loginExists');
    },

    loginExists: function(){
      return window.currentUser && !!window.currentUser.get('auth_token');
    },

    renderNewAccountPage: function(){
      var newAccountView = new NewAccountView;
      newAccountView.render();
    },

    renderLoginPage: function(){
      var loginView = new LoginView;
      loginView.render();
    },

    render: function() {
      if(this.loginExists()){
        this.renderNewAccountPage();
      }else{
        this.registration = new Registration;
        applicationHelper.loadHtml($("#mainContentLoader"), this.template());
        $(this.el).addClass('unscrollable');
        var $this = this;
        $('a#loginLink', this.el).click(function(e){
          e.preventDefault();
          $this.renderLoginPage();
        });
        $('#registration form', this.el).unbind('submit').submit(function(e){
          e.preventDefault();
          $this.register();
        });
      }
    },

    register: function() {
      this.registration.set({
        email: $('input[name="email"]', this.el).attr('value'),
        password: $('input[name="password"]', this.el).attr('value'),
        password_confirmation: $('input[name="password_confirmation"]', this.el).attr('value')
      });
      if (this.registration.isValid()) {
        this.complete();
      } else {
        this.clearExistingErrorMessages();
        this.addErrorMessages();
      }
    },

    clearExistingErrorMessages: function(){
      $('#registration article .errors', this.el).html('');
    },

    addErrorMessages: function() {
      $('#registration article.errors', this.el).html("<p>" + this.registration.get('errors').join('</p><p>') + "</p>");
    },

    createCurrentUserData: function(){
      if(!window.currentUser)
        window.currentUser = new CurrentUser;
      window.currentUser.storeAuthToken(this.registration.get('auth_token'));
    },

    complete: function() {
      this.registration.complete();
      this.createCurrentUserData();

      this.renderNewAccountPage();
    }
  });
})(jQuery);
