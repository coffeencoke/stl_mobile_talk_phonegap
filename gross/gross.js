/* 
 * Example: passing the callback method
 *
 * $(function() {
 *   db.runWhenReady(function(){
 *    db.scaleModeSetting(loadScaleTypeForm);
 *  });
 * });
 *
 */

var db = (function() {
  var dbOptions = {
    fileName: "sqlite_sherpaWeight",
    version: "1.0",
    displayName: "HTML 5 Database for Sherpa Weight",
    maxSize: 1024
  };

  var database = window.openDatabase(
    dbOptions.fileName,
    dbOptions.version,
    dbOptions.displayName,
    dbOptions.maxSize
  );

  var _scaleModeSetting;
  var ready = false;

  setup();

  function setup() {
    database.transaction(function(tx) {
      // Create settings table to store which scale mode the user uses
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS settings (" +
          "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
          "name TEXT NOT NULL, " +
          "value TEXT NOT NULL " +
        ");"
      );

      // Create weightless bc entries table to store entries for weightless bc
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS entries (" +
          "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, " +
          "timestamp DATETIME NOT NULL, " +
          "data_entry_1 FLOAT, " +
          "data_entry_2 FLOAT, " +
          "data_entry_3 FLOAT, " +
          "data_entry_4 FLOAT" +
        ");"
      );
    }, function(error){ // error callback
      alert('Error with database: ' + error.message);
    }, function(){  // success callback
      reloadScaleModeSetting();
      ready = true;
    });
  }

  function setupSeedData(){
    setScaleModeSetting('weightless_bc');
  }

  function drop() {
    database.transaction(function(tx) {
      tx.executeSql('DROP TABLE IF EXISTS settings');
      tx.executeSql('DROP TABLE IF EXISTS entries');
    });
  }

  function runWhenReady(callback){
    if(!ready){
      setTimeout(function(){
        runWhenReady(callback);
      }, 500);
    }else{
      callback.call();
    }
  }

  /*
   * Scale Mode Setting
   *
   * A scale mode setting is which scale mode / type the user selected
   */
  function scaleModeSetting(callback) {
    if(_scaleModeSetting != undefined){
      if(callback)
        callback.call(_scaleModeSetting);
      return _scaleModeSetting;
    } else {
      reloadScaleModeSetting(callback);
      return _scaleModeSetting;
    }
  }

  function reloadScaleModeSetting(callback){
    database.transaction(function (tx) {
      tx.executeSql('SELECT * FROM settings WHERE name = ?', ['scale_mode'], function (tx, results) {
        if(results.rows.length > 0){
          _scaleModeSetting = results.rows.item(0);
        }
        if(callback)
          callback.call(_scaleModeSetting);
      });
    });
  }

  function setScaleModeSetting(mode) {
    if (scaleModeSetting()) {
      updateScaleMode(mode);
    } else {
      insertScaleMode(mode);
    }
  }

  function updateScaleMode(mode) {
    database.transaction(function(tx) {
      tx.executeSql(("UPDATE settings SET value = ? WHERE name = ?;"), [mode, 'scale_mode'], function(tx, results) {
        reloadScaleModeSetting();
      });
    });
  }

  function insertScaleMode(mode) {
    database.transaction(function(tx) {
      tx.executeSql(("INSERT INTO settings (name, value) VALUES (?, ?);"), ['scale_mode', mode], function(tx, results) {
        reloadScaleModeSetting();
      },function(tx, error){
        alert('error: ' + error.message);
      });
    });
  }

  /*
   * Weight Entries
   */
  function createWeightlessBCEntry(data, callback) {
    database.transaction(function(tx) {
      tx.executeSql(
        ("INSERT INTO entries (timestamp, data_entry_1, data_entry_2, data_entry_3, data_entry_4) VALUES (?, ?, ?, ?, ?);"),
        [data.timestamp, data.data_entry_1, data.data_entry_2, data.data_entry_3, data.data_entry_4],
        callback
      );
    });
  }

  function createFitSyncEntry(data, callback) {
    database.transaction(function(tx) {
      tx.executeSql(
        ("INSERT INTO entries (timestamp, data_entry_1, data_entry_2, data_entry_3, data_entry_4) VALUES (?, ?, ?, ?, ?);"),
        [data.timestamp, data.data_entry_1, data.data_entry_2, data.data_entry_3, data.data_entry_4],
        callback
      );
    });
  }

  function createWeightlessEntry(data, callback) {
    database.transaction(function(tx) {
      tx.executeSql(
        ("INSERT INTO entries (timestamp, data_entry_1) VALUES (?, ?);"),
        [data.timestamp, data.data_entry_1],
        callback
      );
    });
  }

  function createBasicEntry(data, callback) {
    database.transaction(function(tx) {
      tx.executeSql(
        ("INSERT INTO entries (timestamp, data_entry_1) VALUES (?, ?);"),
        [data.timestamp, data.data_entry_1],
        callback
      );
    });
  }

  function entries(callback){
    var entries = [];

    database.transaction(function (tx) {
      tx.executeSql('SELECT * FROM entries ORDER BY timestamp desc', [], function (tx, results) {
        for (i = 0; i < results.rows.length; i++) {
          var entry = results.rows.item(i);
          var date = new Date(entry.timestamp);
          if(date != 'Invalid Date'){
            entry.human_timestamp = dateFormat(date, "dddd, mmmm dS, yyyy, h:MM:ss TT");
          }else{
            entry.human_timestamp = 'no date entered';
          }
          entries.push(entry);
        }
        if(callback)
          callback.call(entries);
      });
    });

    return entries;
  }

  return {
    /* Returns the scale mode setting record
     * return value:
     *   {
     *     id: unique id,
     *     name: 'scale_mode',
     *     value: 'weightless_bc'
     *   }
     */
    scaleModeSetting: scaleModeSetting,
    /* Set the scale mode
     * arguments:
     *   mode: String value
     *     example: 'weightless_bc'
     */
    setScaleModeSetting: setScaleModeSetting,
    /* Setup the database */
    setup: setup,
    /* Reset the database
     * Drops and sets up the database
     */
    reset: function() {
      drop();
      setup();
    },
    /* Create an entry
     * arguments:
     *   formData: JSON object of entry data
     *     {
     *       timestamp: 'created timestamp',
     *       data_entry_1: 'value for data entry 1',
     *       data_entry_2: 'value for data entry 2',
     *       data_entry_3: 'value for data entry 3',
     *       data_entry_4: 'value for data entry 4'
     *     }
      *  callback: function to call on success
      *    function(){ // do something }
     */
    createEntry: function(formData, callback){
      var scaleMode = scaleModeSetting().value;
      if(scaleMode == 'weightless_bc'){
        createWeightlessBCEntry(formData, callback);
      } else if(scaleMode == 'weightless'){
        createWeightlessEntry(formData, callback);
      } else if(scaleMode == 'fit_sync'){
        createFitSyncEntry(formData, callback);
      } else if(scaleMode == 'basic'){
        createBasicEntry(formData, callback);
      }
    },
    /* Get All Entries
     * return value:
     *   [
     *     {
     *       timestamp: 'created timestamp',
     *       data_entry_1: 'value for data entry 1',
     *       data_entry_2: 'value for data entry 2',
     *       data_entry_3: 'value for data entry 3',
     *       data_entry_4: 'value for data entry 4'
     *     },
     *     ...
     *   ]
     */
    entries: entries,
    /* Returns the state of the database setup
     * returns values:
     *   true  => completed
     *   false => not yet completed
     *   error => had an error
     */
    ready: function(){
      return ready;
    },
    /* Load seed data for demo */
    setupSeedData: setupSeedData,
    /* Run a method after database is ready */
    runWhenReady: runWhenReady
  }
})();


