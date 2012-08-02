(function ($) {
  window.CurrentUser = Backbone.Model.extend({
    initialize: function () {
      currentUserDataStore.fetch();
      if (currentUserDataStore.models.length > 0) {
        this.dataStore = currentUserDataStore.models[currentUserDataStore.models.length - 1];
        var account = this.dataStore.get('account');
        if (account) {
          this.set({account: new Account(account)});
        }
        this.set({auth_token: this.dataStore.get('auth_token')});
      } else {
        this.dataStore = currentUserDataStore.create();
      }
    },

    storeAuthToken: function (auth_token) {
      this.set({ auth_token: auth_token });
      this.dataStore.set({auth_token: auth_token});
      this.dataStore.save();
    },

    storeAccount: function (account) {
      this.set({account: account});
      this.dataStore.set({account: account});
      this.dataStore.save();
    },

    hasAccount: function () {
      this.getAccount();
      return !!this.get('account');
    },

    getAccount: function () {
      if (!this.get('account')) {
        var accountModel = new Account;
        var account = accountModel.find();
        if (account)
          this.storeAccount(account);
      }
    },

    scaleType: function () {
      return this.get('account').get('scale_type');
    }
  });
})(jQuery);
