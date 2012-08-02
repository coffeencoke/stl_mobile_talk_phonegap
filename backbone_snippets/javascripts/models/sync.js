(function ($) {
  window.Sync = Backbone.Model.extend({
    intervalTime: 60000, // set interval to one minute

    start: function () {
      var $this = this;

      // Wait a second for the Store to load
      setTimeout(function () {
        $this.sync();
      }, 1000);

      // Set regular interval to perform sync
      this.syncInterval = setInterval(function () {
        $this.sync();
      }, $this.intervalTime);
    },

    stop: function(){
      clearInterval(this.syncInterval);
    },

    sync: function () {
      // Get from server
      this.getBaseEntry();
      this.getEntries();

      // Push to server
      this.pushBaseEntry();
      this.pushEntries();
      this.pushAccount();
    },

    getEntries: function () {
      if (environment.online) {
        entryCollection.fetch();

        $.ajax({
          url: applicationHelper.urlWithAuthToken('entries.json'),
          type: 'GET',
          dataType: 'json',
          statusCode: {
            200: function (data) {
              $(data).each(function () {
                if (!entryCollection.findByServerId(this.id)) {
                  entryCollection.create(
                    {
                      server_id: this.id,
                      weight: parseFloat(this.weight),
                      body_fat: parseFloat(this.body_fat),
                      muscle_mass: parseFloat(this.muscle_mass),
                      timestamp: this.timestamp
                    }
                  );
                }
              });
            },
            401: function() {
              applicationHelper.logout();
            }
          }
        });
      }
    },

    pushEntry: function (entryCollectionRecord) {
      if (environment.online) {
        var entry = new Entry(entryCollectionRecord.attributes);
        $.ajax({
          url: applicationHelper.urlWithAuthToken('entries.json'),
          type: 'POST',
          dataType: 'json',
          data: entry.params(),
          statusCode: {
            201: function (data) {
              entryCollectionRecord.set({server_id: data.id});
              entryCollectionRecord.save();
            },
            401: function() {
              applicationHelper.logout();
            }
          }
        });
      }
    },

    pushEntries: function () {
      if (environment.online) {
        entryCollection.fetch();
        var entries = entryCollection.models;
        var $this = this;

        $(entries).each(function () {
          var entry = this;
          if (!entry.get('server_id')) {
            $this.pushEntry(entry);
          }
        });
      }
    },

    getBaseEntry: function () {
      if (environment.online) {
        $.ajax({
          url: applicationHelper.urlWithAuthToken('/base_entry.json'),
          type: 'GET',
          dataType: 'json',
          statusCode: {
            200: function (data) {
              if (data.weight && data.weight != '') {
                baseEntryCollection.create(
                  {
                    weight: parseFloat(data.weight),
                    body_fat: parseFloat(data.body_fat),
                    muscle_mass: parseFloat(data.muscle_mass)
                  }
                );
              }
            },
            401: function() {
              applicationHelper.logout();
            }
          }
        });
      }
    },

    pushBaseEntry: function () {
      if (environment.online) {
        baseEntryCollection.fetch();
        var baseEntryCollectionRecord = baseEntryCollection.models[baseEntryCollection.models.length - 1];
        if(baseEntryCollectionRecord){
          var base_entry = new BaseEntry(baseEntryCollectionRecord.attributes);
          $.ajax({
            url: applicationHelper.urlWithAuthToken('/base_entry.json'),
            type: 'PUT',
            dataType: 'json',
            data: base_entry.params(),
            statusCode: {
              401: function() {
                applicationHelper.logout();
              }
            }
          });
        }
      }
    },

    pushAccount: function () {
      if (environment.online) {
        accountCollection.fetch();
        var accountCollectionRecord = accountCollection.models[0];

        if (accountCollectionRecord && !accountCollectionRecord.get('server_id')) {
          var account = new Account(accountCollectionRecord.attributes);

          $.ajax({
            url: applicationHelper.urlWithAuthToken('/account.json'),
            type: 'POST',
            dataType: 'json',
            data: account.params(),
            statusCode: {
              201: function (data) {
                accountCollectionRecord.set({server_id: data.id});
                accountCollectionRecord.save();
              },
              401: function() {
                applicationHelper.logout();
              }
            }
          });
        }
      }
    }
  });
})(jQuery);
