/* eslint-env mocha */
import assert from 'power-assert';
import {createHash} from 'crypto';
import AppCachePlugin from '../src';

const {AppCache} = AppCachePlugin;
const DEFAULT_MANIFEST_NAME = 'manifest.appcache';

describe('AppCachePlugin', () => {

  describe('constructor', () => {

    describe('cache option', () => {

      it('is undefined by default', () => {
        const plugin = new AppCachePlugin();
        assert(plugin.cache === undefined);
      });

      it('accepts CACHE section entries', () => {
        const plugin = new AppCachePlugin({cache: ['cache.test']});
        assert(plugin.cache.length === 1);
        assert(plugin.cache[0] === 'cache.test');
      });

    });

    describe('network option', () => {

      it('allows all (*) by default', () => {
        const plugin = new AppCachePlugin();
        assert(plugin.network.length === 1);
        assert(plugin.network[0] === '*');
      });

      it('accepts NETWORK section entries', () => {
        const plugin = new AppCachePlugin({network: ['network.test']});
        assert(plugin.network.length === 1);
        assert(plugin.network[0] === 'network.test');
      });

    });

    describe('fallback option', () => {

      it('is undefined by default', () => {
        const plugin = new AppCachePlugin();
        assert(plugin.fallback === undefined);
      });

      it('accepts FALLBACK section entries', () => {
        const plugin = new AppCachePlugin({fallback: ['fallback.test']});
        assert(plugin.fallback.length === 1);
        assert(plugin.fallback[0] === 'fallback.test');
      });

    });

    describe('settings option', () => {

      it('is undefined by default', () => {
        const plugin = new AppCachePlugin();
        assert(plugin.settings === undefined);
      });

      it('accepts SETTINGS section entries', () => {
        const plugin = new AppCachePlugin({settings: ['prefer-online']});
        assert(plugin.settings.length === 1);
        assert(plugin.settings[0] === 'prefer-online');
      });

    });

    describe('exclude option', () => {

      it('is an empty Array by default', () => {
        const plugin = new AppCachePlugin();
        assert(plugin.exclude.length === 0);
      });

      it('accepts a list of exclude patterns (compiled to RegExp)', () => {
        const plugin = new AppCachePlugin({exclude: ['something', /somethingelse/]});
        assert(plugin.exclude.length === 2);
        assert(plugin.exclude[0] instanceof RegExp);
        assert(plugin.exclude[0].toString() === '/^something$/');
        assert(plugin.exclude[1] instanceof RegExp);
        assert(plugin.exclude[1].toString() === '/somethingelse/');
      });

    });

    describe('output option', () => {

      it('is manifest.appcache by default', () => {
        const plugin = new AppCachePlugin();
        assert(plugin.output === DEFAULT_MANIFEST_NAME);
      });

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
      assert(compilation.assets[DEFAULT_MANIFEST_NAME]);
      assert(compilation.assets[DEFAULT_MANIFEST_NAME] instanceof AppCache);
    });

    it('names the asset as specified by the output option', () => {
      const OUTPUT_NAME = 'my-special-manifest.appcache';

      new AppCachePlugin({output: OUTPUT_NAME}).apply(compiler);
      assert(Object.keys(compilation.assets).length === 2);
      assert(compilation.assets[DEFAULT_MANIFEST_NAME] === undefined);
      assert(compilation.assets[OUTPUT_NAME]);
      assert(compilation.assets[OUTPUT_NAME] instanceof AppCache);
    });

    it('it adds compilation assets to the app cache', () => {
      new AppCachePlugin().apply(compiler);
      const appCache = compilation.assets[DEFAULT_MANIFEST_NAME];
      assert(appCache);
      assert(appCache.assets.length === 1);
      assert(appCache.assets[0] === 'test.asset');
    });

    it('excludes compilation assets that match an exclude pattern', () => {
      new AppCachePlugin({exclude: [/asset/]}).apply(compiler);
      const appCache = compilation.assets[DEFAULT_MANIFEST_NAME];
      assert(appCache.assets.length === 0);
    });

    it('excludes compilation assets that match an exclude string', () => {
      new AppCachePlugin({exclude: ['test.asset']}).apply(compiler);
      const appCache = compilation.assets[DEFAULT_MANIFEST_NAME];
      assert(appCache.assets.length === 0);
    });

    it('calls the apply callback', () => {
      new AppCachePlugin().apply(compiler);
      assert(cbWasCalled);
    });

    it('incorporates the output.publicPath option', () => {
      compiler.options = {output: {publicPath: '/test/'}};
      new AppCachePlugin().apply(compiler);
      const appCache = compilation.assets[DEFAULT_MANIFEST_NAME];
      assert(appCache.assets[0] === '/test/test.asset');
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
