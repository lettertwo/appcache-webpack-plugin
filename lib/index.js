var AppCachePlugin, _;

_ = require('lodash');

AppCachePlugin = (function() {
  var AppCache;

  AppCachePlugin.AppCache = AppCache = (function() {
    function AppCache(cache, network, fallback, hash, exclude, include) {
      this.cache = cache;
      this.network = network;
      this.fallback = fallback;
      this.hash = hash;
      this.exclude = exclude;
      this.include = include;
      this.assets = [];
    }

    AppCache.prototype.addAsset = function(asset) {
      return this.assets.push(asset);
    };

    AppCache.prototype.size = function() {
      return Buffer.byteLength(this.source(), 'utf8');
    };

    AppCache.prototype.getManifestBody = function() {
      var _ref, _ref1, _ref2, _ref3;
      return [((_ref = this.assets) != null ? _ref.length : void 0) ? "" + (this.assets.join('\n')) + "\n" : void 0, ((_ref1 = this.cache) != null ? _ref1.length : void 0) ? "CACHE:\n" + (this.cache.join('\n')) + "\n" : void 0, ((_ref2 = this.network) != null ? _ref2.length : void 0) ? "NETWORK:\n" + (this.network.join('\n')) + "\n" : void 0, ((_ref3 = this.fallback) != null ? _ref3.length : void 0) ? "FALLBACK:\n" + (this.fallback.join('\n')) + "\n" : void 0].filter(function(v) {
        return v != null ? v.length : void 0;
      }).join('\n');
    };

    AppCache.prototype.source = function() {
      return "CACHE MANIFEST\n# " + this.hash + "\n\n" + (this.getManifestBody());
    };

    return AppCache;

  })();

  function AppCachePlugin(options) {
    this.cache = options != null ? options.cache : void 0;
    this.network = (options != null ? options.network : void 0) || ['*'];
    this.fallback = options != null ? options.fallback : void 0;
    this.exclude = options != null ? options.exclude : void 0;
    this.include = options != null ? options.include : void 0;
  }

  AppCachePlugin.prototype.apply = function(compiler) {
    return compiler.plugin('emit', (function(_this) {
      return function(compilation, callback) {
        var appCache;
        appCache = new AppCache(_this.cache, _this.network, _this.fallback, compilation.hash, _this.exclude, _this.include);
        Object.keys(compilation.assets).forEach(function(key) {
          if (_.isArray(_this.include)) {
            if (_.some(_this.include, (function(exp) {
              return exp.test(key);
            }))) {
              appCache.addAsset(key);
            }
            return;
          }
          if (_.isArray(_this.exclude)) {
            if (_.every(_this.exclude, (function(exp) {
              return !exp.test(key);
            }))) {
              appCache.addAsset(key);
            }
            return;
          }
          appCache.addAsset(key);
        });
        compilation.assets['manifest.appcache'] = appCache;
        return callback();
      };
    })(this));
  };

  return AppCachePlugin;

})();

module.exports = AppCachePlugin;
