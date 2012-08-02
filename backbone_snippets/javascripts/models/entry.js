(function($) {
  window.Entry = Backbone.Model.extend({
    params: function() {
      var weight = encodeURI(this.get('weight'));
      var timestamp = encodeURI(this.get('timestamp'));
      var body_fat = encodeURI(this.get('body_fat'));
      var muscle_mass = encodeURI(this.get('muscle_mass'));

      return "entry[weight]=" + weight + "&entry[timestamp]=" + timestamp + "&entry[body_fat]=" + body_fat +
              "&entry[muscle_mass]=" + muscle_mass;
    },

    save: function() {
      var entryCollectionRecord = entryCollection.create(
              {
                weight: this.get('weight'),
                body_fat: this.get('body_fat'),
                muscle_mass: this.get('muscle_mass'),
                timestamp: this.get('timestamp')
              }
      );
      sync.pushEntry(entryCollectionRecord);
    }
  });
})(jQuery);