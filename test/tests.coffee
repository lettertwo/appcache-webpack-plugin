{assert} = require 'chai'
{createHash} = require 'crypto'
AppCachePlugin = require '../lib'

describe 'AppCache', ->

  beforeEach ->
    @appCache = new AppCachePlugin.AppCache(
        ['cache.test']
        ['network.test']
        ['fallback.test']
        undefined
        createHash('md5').digest 'hex'
      )


  describe 'getManifestBody()', ->

    it 'should include CACHE section items', ->
      @appCache.network = @appCache.fallback = null
      assert.equal @appCache.getManifestBody(),
        """
        CACHE:
        cache.test

        """

    it 'should exclude empty CACHE section', ->
      @appCache.cache = []
      assert.equal @appCache.getManifestBody(),
        """
        NETWORK:
        network.test

        FALLBACK:
        fallback.test

        """

    it 'should include NETWORK section items', ->
      @appCache.cache = @appCache.fallback = null
      assert.equal @appCache.getManifestBody(),
        """
        NETWORK:
        network.test

        """

    it 'should exclude empty NETWORK section', ->
      @appCache.network = []
      assert.equal @appCache.getManifestBody(),
        """
        CACHE:
        cache.test

        FALLBACK:
        fallback.test

        """

    it 'should include FALLBACK section items', ->
      @appCache.network = @appCache.cache = null
      assert.equal @appCache.getManifestBody(),
        """
        FALLBACK:
        fallback.test

        """

    it 'should exclude empty FALLBACK section', ->
      @appCache.fallback = []
      assert.equal @appCache.getManifestBody(),
        """
        CACHE:
        cache.test

        NETWORK:
        network.test

        """

    it 'should include SETTINGS section', ->
      @appCache.settings = ["prefer-online"]
      assert.equal @appCache.getManifestBody(),
        """
        CACHE:
        cache.test

        NETWORK:
        network.test

        FALLBACK:
        fallback.test

        SETTINGS:
        prefer-online

        """

    it 'should exclude empty SETTINGS section', ->
      @appCache.settings = {}
      assert.equal @appCache.getManifestBody(),
        """
        CACHE:
        cache.test

        NETWORK:
        network.test

        FALLBACK:
        fallback.test

        """

  describe 'source()', ->
    it 'should include webpack build hash', ->
      assert new RegExp("# #{@appCache.hash}").test(@appCache.source()),
        'hash is not in source'

    it 'should include manifest body', ->
      assert new RegExp(@appCache.getManifestBody()).test(@appCache.source()),
        'manifest body not in source'


  describe 'size()', ->
    it 'should measure byte size', ->
      assert.equal @appCache.size(), 117
