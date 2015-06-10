_ = require 'underscore'

class AppCachePlugin

  @AppCache = class AppCache
    constructor: (@cache, @network, @fallback, @hash, @exclude, @include) -> @assets = []

    addAsset: (asset) -> @assets.push asset

    size: -> Buffer.byteLength @source(), 'utf8'

    getManifestBody: ->
      [
        if @assets?.length then "#{@assets.join '\n'}\n"
        if @cache?.length then "CACHE:\n#{@cache.join '\n'}\n"
        if @network?.length then "NETWORK:\n#{@network.join '\n'}\n"
        if @fallback?.length then "FALLBACK:\n#{@fallback.join '\n'}\n"
      ].filter((v) -> v?.length).join '\n'

    source: ->
      """
      CACHE MANIFEST
      # #{@hash}

      #{@getManifestBody()}
      """

  constructor: (options) ->
    @cache = options?.cache
    @network = options?.network or ['*']
    @fallback = options?.fallback
    @exclude = options?.exclude
    @include = options?.include

  apply: (compiler) ->
    compiler.plugin 'emit', (compilation, callback) =>
      appCache = new AppCache @cache, @network, @fallback, compilation.hash, @exclude, @include
      Object.keys(compilation.assets).forEach (key) ->
        if _.isArray(_this.include)
          if _.some(_this.include, ((exp) ->
              exp.test key
            ))
            appCache.addAsset key
          return
        if _.isArray(_this.exclude)
          if _.every(_this.exclude, ((exp) ->
              !exp.test(key)
            ))
            appCache.addAsset key
          return
        appCache.addAsset key
        return
      compilation.assets['manifest.appcache'] = appCache
      callback()


module.exports = AppCachePlugin
