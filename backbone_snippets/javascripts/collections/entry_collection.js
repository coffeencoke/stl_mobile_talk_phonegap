(function($){
  window.EntryCollection = Backbone.Collection.extend({
    localStorage: new Store("entries"),

    findByServerId: function(server_id){
      return this.filter(function(entry) { return entry.get('server_id') == server_id })[0];
    },

    comparator: function(entry) {
      return entry.get("timestamp");
    }
  });

  window.entryCollection = new EntryCollection;
})(jQuery);
