/* eslint-env mocha */
import assert from 'power-assert';
import {createHash} from 'crypto';
import AppCachePlugin, {AppCache} from '../lib';

describe('AppCachePlugin', () => {

  describe('constructor', () => {

    it('provides default section entries', () => {
      const plugin = new AppCachePlugin();
      assert(plugin.cache === undefined);
      assert(plugin.network.length === 1);
      assert(plugin.network[0] === '*');
      assert(plugin.fallback === undefined);
      assert(plugin.settings === undefined);
    });

    it('accepts section entries as arguments', () => {
      const plugin = new AppCachePlugin({
        cache: ['cache.test'],
        network: ['network.test'],
        fallback: ['fallback.test'],
        settings: ['prefer-online'],
      });

      assert(plugin.cache.length === 1);
      assert(plugin.cache[0] === 'cache.test');
      assert(plugin.network.length === 1);
      assert(plugin.network[0] === 'network.test');
      assert(plugin.fallback.length === 1);
      assert(plugin.fallback[0] === 'fallback.test');
      assert(plugin.settings.length === 1);
      assert(plugin.settings[0] === 'prefer-online');
    });

  });

  describe('apply()', () => {
    let compiler, compilation, cb, cbWasCalled;

    beforeEach(() => {
      cbWasCalled = false;
      cb = () => { cbWasCalled = true; };

      compilation = {
        assets: {'test.asset': null},
      };

      compiler = {
        plugin(_, fn) { fn(compilation, cb); },
      };
    });

    it('creates a new AppCache compilation asset', () => {
      new AppCachePlugin().apply(compiler);
      assert(Object.keys(compilation.assets).length === 2);
      assert(compilation.assets['manifest.appcache']);
      assert(compilation.assets['manifest.appcache'] instanceof AppCache);
    });

    it('it adds compilation assets to the app cache', () => {
      new AppCachePlugin().apply(compiler);
      const appCache = compilation.assets['manifest.appcache'];
      assert(appCache);
      assert(appCache.assets.length === 1);
      assert(appCache.assets[0] === 'test.asset');
    });

    it('calls the apply callback', () => {
      new AppCachePlugin().apply(compiler);
      assert(cbWasCalled);
    });

  });

});

describe('AppCache', () => {
  let cacheEntries, networkEntries, fallbackEnteries, settingsEntries;

  beforeEach(() => {
    cacheEntries = ['cache.test'];
    networkEntries = ['network.test'];
    fallbackEnteries = ['fallback.test'];
    settingsEntries = ['prefer-online'];
  });

  describe('getManifestBody()', () => {

    it('includes added assets', () => {
      const appCache = new AppCache();
      appCache.addAsset('test.asset');
      assert(appCache.getManifestBody() === 'test.asset\n');
    });

    describe('CACHE section', () => {

      it('includes CACHE section items', () => {
        const appCache = new AppCache(cacheEntries);
        assert(appCache.getManifestBody() === 'CACHE:\ncache.test\n');
      });

      it('excludes empty CACHE section', () => {
        const appCache = new AppCache([]);
        assert(appCache.getManifestBody() === '');
      });

    });

    describe('NETWORK section', () => {

      it('includes NETWORK section items', () => {
        const appCache = new AppCache(null, networkEntries);
        assert(appCache.getManifestBody() === 'NETWORK:\nnetwork.test\n');
      });

      it('excludes empty NETWORK section', () => {
        const appCache = new AppCache(null, []);
        assert(appCache.getManifestBody() === '');
      });

    });

    describe('FALLBACK section', () => {

      it('includes FALLBACK section items', () => {
        const appCache = new AppCache(null, null, fallbackEnteries);
        assert(appCache.getManifestBody() === 'FALLBACK:\nfallback.test\n');
      });

      it('excludes empty FALLBACK section', () => {
        const appCache = new AppCache(null, null, []);
        assert(appCache.getManifestBody() === '');
      });

    });

    describe('SETTINGS section', () => {

      it('includes SETTINGS section', () => {
        const appCache = new AppCache(null, null, null, settingsEntries);
        assert(appCache.getManifestBody() === 'SETTINGS:\nprefer-online\n');
      });

      it('excludes empty SETTINGS section', () => {
        const appCache = new AppCache(null, null, null, []);
        assert(appCache.getManifestBody() === '');
      });

    });

  });

  describe('source()', () => {
    let hash, appCache;

    beforeEach(() => {
      hash = createHash('md5').digest('hex');
      appCache = new AppCache(cacheEntries, networkEntries, fallbackEnteries, settingsEntries, hash);
    });

    it('includes webpack build hash', () => {
      assert(new RegExp(`# ${hash}`).test(appCache.source()), 'hash is not in source');
    });

    it('includes manifest body', () => {
      assert(new RegExp(appCache.getManifestBody()).test(appCache.source()), 'manifest body not in source');
    });

  });

  describe('size()', () => {

    it('measures byte size', () => {
      const hash = createHash('md5').digest('hex');
      const appCache = new AppCache(cacheEntries, networkEntries, fallbackEnteries, settingsEntries, hash);
      assert(appCache.size() === 142);
    });

  });

});
