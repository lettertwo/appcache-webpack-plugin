/* eslint-env mocha */
import assert from 'power-assert';
import {createHash} from 'crypto';
import {AppCache} from '../lib';

describe('AppCache', () => {
  let cacheEntries, networkEntries, fallbackEnteries, settingsEntries;

  beforeEach(() => {
    cacheEntries = ['cache.test'];
    networkEntries = ['network.test'];
    fallbackEnteries = ['fallback.test'];
    settingsEntries = ['prefer-online'];
  });

  describe('getManifestBody()', () => {

    describe('CACHE section', () => {

      it('should include CACHE section items', () => {
        const appCache = new AppCache(cacheEntries);
        assert(appCache.getManifestBody() === 'CACHE:\ncache.test\n');
      });

      it('should exclude empty CACHE section', () => {
        const appCache = new AppCache([]);
        assert(appCache.getManifestBody() === '');
      });

    });

    describe('NETWORK section', () => {

      it('should include NETWORK section items', () => {
        const appCache = new AppCache(null, networkEntries);
        assert(appCache.getManifestBody() === 'NETWORK:\nnetwork.test\n');
      });

      it('should exclude empty NETWORK section', () => {
        const appCache = new AppCache(null, []);
        assert(appCache.getManifestBody() === '');
      });

    });

    describe('FALLBACK section', () => {

      it('should include FALLBACK section items', () => {
        const appCache = new AppCache(null, null, fallbackEnteries);
        assert(appCache.getManifestBody() === 'FALLBACK:\nfallback.test\n');
      });

      it('should exclude empty FALLBACK section', () => {
        const appCache = new AppCache(null, null, []);
        assert(appCache.getManifestBody() === '');
      });

    });

    describe('SETTINGS section', () => {

      it('should include SETTINGS section', () => {
        const appCache = new AppCache(null, null, null, settingsEntries);
        assert(appCache.getManifestBody() === 'SETTINGS:\nprefer-online\n');
      });

      it('should exclude empty SETTINGS section', () => {
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

    it('should include webpack build hash', () => {
      assert(new RegExp(`# ${hash}`).test(appCache.source()), 'hash is not in source');
    });

    it('should include manifest body', () => {
      assert(new RegExp(appCache.getManifestBody()).test(appCache.source()), 'manifest body not in source');
    });

  });

  describe('size()', () => {

    it('should measure byte size', () => {
      const hash = createHash('md5').digest('hex');
      const appCache = new AppCache(cacheEntries, networkEntries, fallbackEnteries, settingsEntries, hash);
      assert(appCache.size() === 142);
    });

  });

});
