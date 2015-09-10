export class AppCache {

  constructor(cache, network, fallback, settings, hash) {
    this.cache = cache;
    this.network = network;
    this.fallback = fallback;
    this.settings = settings;
    this.hash = hash;
    this.assets = [];
  }

  addAsset(asset) {
    this.assets.push(encodeURI(asset));
  }

  size() {
    return Buffer.byteLength(this.source(), 'utf8');
  }

  getManifestBody() {
    return [
      this.assets && this.assets.length ? `${this.assets.join('\n')}\n` : null,
      this.cache && this.cache.length ? `CACHE:\n${this.cache.join('\n')}\n` : null,
      this.network && this.network.length ? `NETWORK:\n${this.network.join('\n')}\n` : null,
      this.fallback && this.fallback.length ? `FALLBACK:\n${this.fallback.join('\n')}\n` : null,
      this.settings && this.settings.length ? `SETTINGS:\n${this.settings.join('\n')}\n` : null,
    ].filter(v => v && v.length).join('\n');
  }

  source() {
    return [
      'CACHE MANIFEST',
      `# ${this.hash}`,
      '',
      this.getManifestBody(),
    ].join('\n');
  }
}

export default class AppCachePlugin {

  static AppCache = AppCache

  constructor({cache, network = ['*'], fallback, settings} = {}) {
    this.cache = cache;
    this.network = network;
    this.fallback = fallback;
    this.settings = settings;
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const appCache = new AppCache(this.cache, this.network, this.fallback, this.settings, compilation.hash);
      Object.keys(compilation.assets).forEach(::appCache.addAsset);
      compilation.assets['manifest.appcache'] = appCache;
      callback();
    });
  }
}
