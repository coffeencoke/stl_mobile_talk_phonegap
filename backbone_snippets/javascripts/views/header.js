(function($) {
  window.HeaderView = Backbone.View.extend({
    el: $('body'),
    template: _.template($.ajax('templates/shared/header.html', {async: false}).responseText),

    initialize: function() {
      _.bindAll(this, 'render');
    },

    render: function(currentPage) {
      $(this.el).append(this.template());
      this.show();
    },

    show: function(){
      var $this = this;
      $('#header', this.el).animate(
        { top: -50 }, 
        {
          duration: 0,
          complete: function(){
            $('#header', $this.el).animate(
              { top: 0 }, 
              { duration: 1000 }
            );
          }
        }
      );
    }
  });
})(jQuery);


