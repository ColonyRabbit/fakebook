/*! idb v7.0.1 - https://github.com/jakearchibald/idb */
"use strict";
(function () {
  function e(e) {
    return new Promise(function (t, n) {
      e.onsuccess = function () {
        t(e.result);
      };
      e.onerror = function () {
        n(e.error);
      };
    });
  }
  function t(t, n, r) {
    r.forEach(function (r) {
      Object.defineProperty(t.prototype, r, {
        get: function () {
          return this[n][r];
        },
        set: function (e) {
          this[n][r] = e;
        },
      });
    });
  }
  function n(e, t, n, r) {
    r.forEach(function (r) {
      r in n.prototype &&
        (e.prototype[r] = function () {
          return this[t][r].apply(this[t], arguments);
        });
    });
  }
  function r(e, t, n, r) {
    r.forEach(function (r) {
      r in n.prototype &&
        (e.prototype[r] = function () {
          return (
            (e = this[t][r].apply(this[t], arguments)),
            e instanceof IDBRequest ? e(e) : e
          );
          var e;
        });
    });
  }
  function o(e, t, n, r) {
    r.forEach(function (r) {
      r in n.prototype &&
        (e.prototype[r] = function () {
          return (function (e, t) {
            var n = new Promise(function (n, r) {
              e.onsuccess = function () {
                n(e.result);
              };
              e.onerror = function () {
                r(e.error);
              };
            });
            return t && (n = n.then(t)), n;
          })(this[t][r].apply(this[t], arguments));
        });
    });
  }
  var i = ["get", "getKey", "getAll", "getAllKeys", "count"],
    u = ["put", "add", "delete", "clear"],
    c = ["openCursor", "openKeyCursor"],
    s = ["advance", "continue", "continuePrimaryKey"],
    a = ["cursor", "keyCursor"];
  function f(t) {
    var n = this;
    this._dbp = new Promise(function (r, o) {
      var i = indexedDB.open(t.name, t.version);
      i.onupgradeneeded = function (e) {
        t.upgrade &&
          t.upgrade(
            new d(i.result, i.transaction),
            e.oldVersion,
            e.newVersion,
            new d(i.result, i.transaction)
          );
      };
      i.onsuccess = function () {
        r(i.result);
      };
      i.onerror = function () {
        o(i.error);
      };
    });
  }
  f.prototype.transaction = function (e, t) {
    var n = this;
    return this._dbp.then(function (r) {
      return new p(r.transaction(e, t));
    });
  };
  f.prototype.close = function () {
    this._dbp.then(function (e) {
      e.close();
    });
  };
  f.prototype.delete = function (e) {
    var t = indexedDB.deleteDatabase(e);
    return e(t);
  };
  f.prototype.openDB = function (e) {
    return new f(e);
  };
  function d(e, t) {
    this._db = e;
    this._tx = t;
    this._store = e.objectStoreNames;
  }
  t(d, "_db", ["name", "version"]);
  n(d, "_db", IDBDatabase, ["createObjectStore", "deleteObjectStore", "close"]);
  function p(e) {
    this._tx = e;
    this.complete = new Promise(function (t, n) {
      e.oncomplete = function () {
        t();
      };
      e.onerror = function () {
        n(e.error);
      };
      e.onabort = function () {
        n(e.error);
      };
    });
  }
  p.prototype.objectStore = function (e) {
    return new v(this._tx.objectStore(e));
  };
  function v(e) {
    this._store = e;
  }
  t(v, "_store", ["name"]);
  n(v, "_store", IDBObjectStore, ["index", "createIndex", "deleteIndex"]);
  r(v, "_store", IDBObjectStore, u);
  o(v, "_store", IDBObjectStore, i);
  o(v, "_store", IDBIndex, i);
  r(v, "_store", IDBIndex, u);
  o(v, "_store", IDBObjectStore, c);
  o(v, "_store", IDBIndex, c);
  s.forEach(function (e) {
    v.prototype[e] = function () {
      var t = this;
      return e(function (e) {
        return e.result;
      }, this._store[e].apply(this._store, arguments));
    };
  });
  a.forEach(function (e) {
    v.prototype[e] = function () {
      return new v(this._store[e].apply(this._store, arguments));
    };
  });
  self.idb = {
    openDB: function (e, t, n) {
      var r = new f({
        name: e,
        version: t,
        upgrade: n,
      });
      return r._dbp;
    },
  };
})();
