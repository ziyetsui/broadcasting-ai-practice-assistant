// 性能优化和智能缓存系统
class PerformanceCacheSystem {
    constructor() {
        this.memoryCache = new Map();
        this.storageCache = null;
        this.maxMemorySize = 50; // 最大内存缓存条目数
        this.maxStorageSize = 100 * 1024 * 1024; // 100MB存储缓存限制
        this.compressionEnabled = true;
        this.analyticsData = {
            hits: 0,
            misses: 0,
            storageOperations: 0
        };
        
        this.initializeStorageCache();
        this.setupPerformanceMonitoring();
    }

    // 初始化存储缓存
    async initializeStorageCache() {
        try {
            if ('indexedDB' in window) {
                this.storageCache = new IndexedDBCache('BroadcastingAI', 'cache', 1);
                await this.storageCache.initialize();
                console.log('IndexedDB缓存初始化成功');
            } else if ('localStorage' in window) {
                this.storageCache = new LocalStorageCache('BroadcastingAI');
                console.log('LocalStorage缓存初始化成功');
            }
        } catch (error) {
            console.warn('存储缓存初始化失败:', error);
        }
    }

    // 设置性能监控
    setupPerformanceMonitoring() {
        // 监控内存使用
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.9) {
                    console.warn('内存使用率过高，开始清理缓存');
                    this.cleanupMemoryCache();
                }
            }, 30000); // 每30秒检查一次
        }

        // 监控缓存命中率
        setInterval(() => {
            const total = this.analyticsData.hits + this.analyticsData.misses;
            if (total > 0) {
                const hitRate = (this.analyticsData.hits / total * 100).toFixed(1);
                console.log(`缓存命中率: ${hitRate}%`);
            }
        }, 60000); // 每分钟报告一次
    }

    // 获取缓存数据
    async get(key, options = {}) {
        const { useStorage = true, decompress = true } = options;
        
        // 首先检查内存缓存
        if (this.memoryCache.has(key)) {
            const cached = this.memoryCache.get(key);
            if (this.isValidCache(cached)) {
                this.analyticsData.hits++;
                return this.processRetrievedData(cached.data, decompress);
            } else {
                this.memoryCache.delete(key);
            }
        }

        // 检查存储缓存
        if (useStorage && this.storageCache) {
            try {
                const cached = await this.storageCache.get(key);
                if (cached && this.isValidCache(cached)) {
                    this.analyticsData.hits++;
                    
                    // 将热数据提升到内存缓存
                    this.setMemoryCache(key, cached);
                    
                    return this.processRetrievedData(cached.data, decompress);
                }
            } catch (error) {
                console.warn('存储缓存读取失败:', error);
            }
        }

        this.analyticsData.misses++;
        return null;
    }

    // 设置缓存数据
    async set(key, data, options = {}) {
        const { 
            ttl = 3600000, // 默认1小时过期
            useStorage = true, 
            compress = true,
            priority = 'normal'
        } = options;

        const cacheItem = {
            data: await this.processDataForStorage(data, compress),
            timestamp: Date.now(),
            ttl: ttl,
            priority: priority,
            size: this.estimateSize(data),
            compressed: compress
        };

        // 设置内存缓存
        this.setMemoryCache(key, cacheItem);

        // 设置存储缓存
        if (useStorage && this.storageCache) {
            try {
                await this.storageCache.set(key, cacheItem);
                this.analyticsData.storageOperations++;
            } catch (error) {
                console.warn('存储缓存写入失败:', error);
            }
        }
    }

    // 设置内存缓存
    setMemoryCache(key, cacheItem) {
        // 如果内存缓存已满，清理低优先级项目
        if (this.memoryCache.size >= this.maxMemorySize) {
            this.cleanupMemoryCache();
        }

        this.memoryCache.set(key, cacheItem);
    }

    // 清理内存缓存
    cleanupMemoryCache() {
        const entries = Array.from(this.memoryCache.entries());
        
        // 按优先级和时间排序
        entries.sort((a, b) => {
            const priorityWeight = { high: 3, normal: 2, low: 1 };
            const aPriority = priorityWeight[a[1].priority] || 2;
            const bPriority = priorityWeight[b[1].priority] || 2;
            
            if (aPriority !== bPriority) {
                return bPriority - aPriority; // 高优先级在前
            }
            
            return b[1].timestamp - a[1].timestamp; // 新的在前
        });

        // 删除低优先级和过期的项目
        const toDelete = entries.slice(Math.floor(this.maxMemorySize * 0.7));
        toDelete.forEach(([key]) => {
            this.memoryCache.delete(key);
        });

        console.log(`清理了${toDelete.length}个内存缓存项目`);
    }

    // 检查缓存是否有效
    isValidCache(cached) {
        if (!cached || !cached.timestamp) return false;
        
        const now = Date.now();
        const age = now - cached.timestamp;
        
        return age < (cached.ttl || 3600000);
    }

    // 处理检索到的数据
    async processRetrievedData(data, decompress) {
        if (decompress && data && data._compressed) {
            return await this.decompress(data.content);
        }
        return data;
    }

    // 处理存储数据
    async processDataForStorage(data, compress) {
        if (compress && this.compressionEnabled) {
            const compressed = await this.compress(data);
            if (compressed.size < this.estimateSize(data) * 0.8) {
                return {
                    _compressed: true,
                    content: compressed.data,
                    originalSize: this.estimateSize(data),
                    compressedSize: compressed.size
                };
            }
        }
        return data;
    }

    // 数据压缩
    async compress(data) {
        try {
            const jsonString = JSON.stringify(data);
            
            if ('CompressionStream' in window) {
                const stream = new CompressionStream('gzip');
                const writer = stream.writable.getWriter();
                const reader = stream.readable.getReader();
                
                writer.write(new TextEncoder().encode(jsonString));
                writer.close();
                
                const chunks = [];
                let done = false;
                
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) chunks.push(value);
                }
                
                const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
                let offset = 0;
                for (const chunk of chunks) {
                    compressed.set(chunk, offset);
                    offset += chunk.length;
                }
                
                return {
                    data: Array.from(compressed),
                    size: compressed.length
                };
            } else {
                // 简单的字符串压缩（LZ77-like）
                return {
                    data: this.simpleCompress(jsonString),
                    size: jsonString.length * 0.7 // 估算压缩后大小
                };
            }
        } catch (error) {
            console.warn('数据压缩失败:', error);
            return { data: data, size: this.estimateSize(data) };
        }
    }

    // 数据解压缩
    async decompress(compressedData) {
        try {
            if ('DecompressionStream' in window && Array.isArray(compressedData)) {
                const stream = new DecompressionStream('gzip');
                const writer = stream.writable.getWriter();
                const reader = stream.readable.getReader();
                
                writer.write(new Uint8Array(compressedData));
                writer.close();
                
                const chunks = [];
                let done = false;
                
                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;
                    if (value) chunks.push(value);
                }
                
                const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
                let offset = 0;
                for (const chunk of chunks) {
                    decompressed.set(chunk, offset);
                    offset += chunk.length;
                }
                
                const jsonString = new TextDecoder().decode(decompressed);
                return JSON.parse(jsonString);
            } else {
                // 简单解压缩
                return JSON.parse(this.simpleDecompress(compressedData));
            }
        } catch (error) {
            console.warn('数据解压缩失败:', error);
            return compressedData;
        }
    }

    // 简单压缩算法
    simpleCompress(str) {
        const dict = {};
        let data = str.split('');
        let out = [];
        let currChar;
        let phrase = data[0];
        let code = 256;
        
        for (let i = 1; i < data.length; i++) {
            currChar = data[i];
            if (dict[phrase + currChar] != null) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase = currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        
        return out;
    }

    // 简单解压缩算法
    simpleDecompress(data) {
        const dict = {};
        let currChar = String.fromCharCode(data[0]);
        let oldPhrase = currChar;
        let out = [currChar];
        let code = 256;
        let phrase;
        
        for (let i = 1; i < data.length; i++) {
            let currCode = data[i];
            if (currCode < 256) {
                phrase = String.fromCharCode(data[i]);
            } else {
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = phrase;
        }
        
        return out.join('');
    }

    // 估算数据大小
    estimateSize(data) {
        try {
            return new Blob([JSON.stringify(data)]).size;
        } catch {
            return JSON.stringify(data).length * 2; // 粗略估算
        }
    }

    // 删除缓存
    async delete(key) {
        this.memoryCache.delete(key);
        
        if (this.storageCache) {
            try {
                await this.storageCache.delete(key);
            } catch (error) {
                console.warn('存储缓存删除失败:', error);
            }
        }
    }

    // 清理过期缓存
    async cleanupExpired() {
        console.log('开始清理过期缓存...');
        
        // 清理内存缓存中的过期项
        const memoryKeys = Array.from(this.memoryCache.keys());
        for (const key of memoryKeys) {
            const cached = this.memoryCache.get(key);
            if (!this.isValidCache(cached)) {
                this.memoryCache.delete(key);
            }
        }

        // 清理存储缓存中的过期项
        if (this.storageCache) {
            try {
                await this.storageCache.cleanupExpired();
            } catch (error) {
                console.warn('存储缓存清理失败:', error);
            }
        }

        console.log('过期缓存清理完成');
    }

    // 获取缓存统计信息
    getStats() {
        const total = this.analyticsData.hits + this.analyticsData.misses;
        const hitRate = total > 0 ? (this.analyticsData.hits / total * 100).toFixed(1) : 0;
        
        return {
            memoryCache: {
                size: this.memoryCache.size,
                maxSize: this.maxMemorySize
            },
            analytics: {
                hits: this.analyticsData.hits,
                misses: this.analyticsData.misses,
                hitRate: `${hitRate}%`,
                storageOperations: this.analyticsData.storageOperations
            },
            performance: this.getPerformanceMetrics()
        };
    }

    // 获取性能指标
    getPerformanceMetrics() {
        const metrics = {
            memoryUsage: 'unknown',
            timing: performance.timing ? {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            } : null
        };

        if ('memory' in performance) {
            metrics.memoryUsage = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
            };
        }

        return metrics;
    }

    // 清理所有缓存
    async clearAll() {
        this.memoryCache.clear();
        
        if (this.storageCache) {
            try {
                await this.storageCache.clear();
            } catch (error) {
                console.warn('存储缓存清理失败:', error);
            }
        }

        // 重置统计数据
        this.analyticsData = { hits: 0, misses: 0, storageOperations: 0 };
        
        console.log('所有缓存已清理');
    }
}

// IndexedDB缓存实现
class IndexedDBCache {
    constructor(dbName, storeName, version) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async get(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async set(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put({
                key: key,
                value: value,
                timestamp: Date.now()
            });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async delete(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async cleanupExpired() {
        // IndexedDB过期清理实现
        const now = Date.now();
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('timestamp');
        
        return new Promise((resolve, reject) => {
            const request = index.openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const record = cursor.value;
                    const age = now - record.timestamp;
                    if (age > (record.value.ttl || 3600000)) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// LocalStorage缓存实现
class LocalStorageCache {
    constructor(prefix) {
        this.prefix = prefix + '_';
    }

    async get(key) {
        try {
            const stored = localStorage.getItem(this.prefix + key);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.warn('LocalStorage读取失败:', error);
            return null;
        }
    }

    async set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (error) {
            console.warn('LocalStorage写入失败:', error);
            // 如果存储空间不足，清理一些旧数据
            this.cleanupOldest();
            throw error;
        }
    }

    async delete(key) {
        localStorage.removeItem(this.prefix + key);
    }

    async clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    async cleanupExpired() {
        const now = Date.now();
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                try {
                    const stored = JSON.parse(localStorage.getItem(key));
                    const age = now - stored.timestamp;
                    if (age > (stored.ttl || 3600000)) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    // 无效数据，删除
                    localStorage.removeItem(key);
                }
            }
        });
    }

    cleanupOldest() {
        const items = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                try {
                    const stored = JSON.parse(localStorage.getItem(key));
                    items.push({ key, timestamp: stored.timestamp });
                } catch (error) {
                    localStorage.removeItem(key);
                }
            }
        });

        // 删除最旧的25%
        items.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = items.slice(0, Math.floor(items.length * 0.25));
        toDelete.forEach(item => localStorage.removeItem(item.key));
    }
}

// 导出性能缓存系统
window.PerformanceCacheSystem = PerformanceCacheSystem;
