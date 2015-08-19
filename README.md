# Application Cache plugin for Webpack

## Usage

```javascript

var AppCachePlugin = require('appcache-webpack-plugin');

module.exports = {
  plugins: [
    new AppCachePlugin({
      cache: ['someOtherAsset.jpg'],
      network: null,  // No network access allowed!
      fallback: ['failwhale.jpg'],
      settings: ['prefer-online']
    })
  ]
}
```

Arguments:

* `cache`: An array of additional assets to cache.
* `network`: An array of assets that may be accessed via the network.
  Defaults to `['*']`.
* `fallback`: An array of fallback assets.
* `settings`: An array of settings.

## License

[MIT](http://www.opensource.org/licenses/mit-license.php)
