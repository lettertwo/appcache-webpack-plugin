class AppCachePlugin

  @AppCache = class AppCache
    constructor: (@cache, @network, @fallback, @settings, @hash) -> @assets = []

    addAsset: (asset) -> @assets.push encodeURI(asset)

    size: -> Buffer.byteLength @source(), 'utf8'

    getManifestBody: ->
      [
        if @assets?.length then "#{@assets.join '\n'}\n"
        if @cache?.length then "CACHE:\n#{@cache.join '\n'}\n"
        if @network?.length then "NETWORK:\n#{@network.join '\n'}\n"
        if @fallback?.length then "FALLBACK:\n#{@fallback.join '\n'}\n"
        if @settings?.length then "SETTINGS:\n#{@settings.join '\n'}\n"
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
    @settings = options?.settings

  apply: (compiler) ->
    compiler.plugin 'emit', (compilation, callback) =>
      appCache = new AppCache @cache, @network, @fallback, @settings, compilation.hash
      appCache.addAsset key for key in Object.keys compilation.assets
      compilation.assets['manifest.appcache'] = appCache
      callback()


module.exports = AppCachePlugin
