/**
 * StorageManager - Unified storage interface for rate limiter data
 * Part of RateLimiter Component for Bootstrap 5.3
 */
class StorageManager {
	/**
	 * Available storage types
	 */
	static get STORAGE_TYPES() {
		return {
			MEMORY: 'memory',
			LOCAL_STORAGE: 'localStorage',
			SESSION_STORAGE: 'sessionStorage',
			INDEXED_DB: 'indexedDB'
		};
	}

	/**
	 * Constructor
	 * @param {string} storageType - Type of storage to use
	 * @param {string} identifier - Unique identifier for this storage instance
	 */
	constructor(storageType = 'memory', identifier = 'default') {
		this.storageType = storageType;
		this.identifier = identifier;
		this.keyPrefix = `rateLimiter_${identifier}_`;

		// Initialize storage based on type
		this.initializeStorage();

		// Memory storage fallback
		this.memoryStorage = new Map();

		// Check storage availability
		this.isAvailable = this.checkAvailability();

		if (!this.isAvailable && storageType !== StorageManager.STORAGE_TYPES.MEMORY) {
			console.warn(`Storage type ${storageType} not available, falling back to memory storage`);
			this.storageType = StorageManager.STORAGE_TYPES.MEMORY;
		}
	}

	/**
	 * Initialize storage based on type
	 */
	initializeStorage() {
		switch (this.storageType) {
			case StorageManager.STORAGE_TYPES.MEMORY:
				// Memory storage is always available
				break;

			case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
				this.storage = window.localStorage;
				break;

			case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
				this.storage = window.sessionStorage;
				break;

			case StorageManager.STORAGE_TYPES.INDEXED_DB:
				this.initializeIndexedDB();
				break;

			default:
				throw new Error(`Unsupported storage type: ${this.storageType}`);
		}
	}

	/**
	 * Check if the selected storage type is available
	 * @returns {boolean}
	 */
	checkAvailability() {
		try {
			switch (this.storageType) {
				case StorageManager.STORAGE_TYPES.MEMORY:
					return true;

				case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
					if (!window.localStorage) return false;
					// Test write/read
					const testKey = `${this.keyPrefix}test`;
					window.localStorage.setItem(testKey, 'test');
					window.localStorage.removeItem(testKey);
					return true;

				case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
					if (!window.sessionStorage) return false;
					// Test write/read
					const testKeySession = `${this.keyPrefix}test`;
					window.sessionStorage.setItem(testKeySession, 'test');
					window.sessionStorage.removeItem(testKeySession);
					return true;

				case StorageManager.STORAGE_TYPES.INDEXED_DB:
					return !!window.indexedDB;

				default:
					return false;
			}
		} catch (error) {
			return false;
		}
	}

	/**
	 * Set a value in storage
	 * @param {string} key - Storage key
	 * @param {*} value - Value to store
	 * @returns {boolean} - Success status
	 */
	set(key, value) {
		try {
			const fullKey = this.keyPrefix + key;

			switch (this.storageType) {
				case StorageManager.STORAGE_TYPES.MEMORY:
					this.memoryStorage.set(fullKey, value);
					return true;

				case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
				case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
					this.storage.setItem(fullKey, JSON.stringify({
						value,
						timestamp: Date.now(),
						identifier: this.identifier
					}));
					return true;

				case StorageManager.STORAGE_TYPES.INDEXED_DB:
					return this.setIndexedDB(fullKey, value);

				default:
					this.memoryStorage.set(fullKey, value);
					return true;
			}
		} catch (error) {
			console.warn('StorageManager: Failed to set value', error);
			// Fallback to memory storage
			this.memoryStorage.set(this.keyPrefix + key, value);
			return false;
		}
	}

	/**
	 * Get a value from storage
	 * @param {string} key - Storage key
	 * @param {*} defaultValue - Default value if key not found
	 * @returns {*} - Retrieved value
	 */
	get(key, defaultValue = null) {
		try {
			const fullKey = this.keyPrefix + key;

			switch (this.storageType) {
				case StorageManager.STORAGE_TYPES.MEMORY:
					return this.memoryStorage.get(fullKey) || defaultValue;

				case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
				case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
					const stored = this.storage.getItem(fullKey);
					if (!stored) return defaultValue;

					const parsed = JSON.parse(stored);
					return parsed.value !== undefined ? parsed.value : defaultValue;

				case StorageManager.STORAGE_TYPES.INDEXED_DB:
					return this.getIndexedDB(fullKey, defaultValue);

				default:
					return this.memoryStorage.get(fullKey) || defaultValue;
			}
		} catch (error) {
			console.warn('StorageManager: Failed to get value', error);
			return this.memoryStorage.get(this.keyPrefix + key) || defaultValue;
		}
	}

	/**
	 * Remove a value from storage
	 * @param {string} key - Storage key
	 * @returns {boolean} - Success status
	 */
	remove(key) {
		try {
			const fullKey = this.keyPrefix + key;

			switch (this.storageType) {
				case StorageManager.STORAGE_TYPES.MEMORY:
					return this.memoryStorage.delete(fullKey);

				case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
				case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
					this.storage.removeItem(fullKey);
					return true;

				case StorageManager.STORAGE_TYPES.INDEXED_DB:
					return this.removeIndexedDB(fullKey);

				default:
					return this.memoryStorage.delete(fullKey);
			}
		} catch (error) {
			console.warn('StorageManager: Failed to remove value', error);
			return this.memoryStorage.delete(this.keyPrefix + key);
		}
	}

	/**
	 * Check if a key exists in storage
	 * @param {string} key - Storage key
	 * @returns {boolean}
	 */
	has(key) {
		try {
			const fullKey = this.keyPrefix + key;

			switch (this.storageType) {
				case StorageManager.STORAGE_TYPES.MEMORY:
					return this.memoryStorage.has(fullKey);

				case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
				case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
					return this.storage.getItem(fullKey) !== null;

				case StorageManager.STORAGE_TYPES.INDEXED_DB:
					return this.hasIndexedDB(fullKey);

				default:
					return this.memoryStorage.has(fullKey);
			}
		} catch (error) {
			return this.memoryStorage.has(this.keyPrefix + key);
		}
	}

	/**
	 * Clear all data for this identifier
	 * @returns {boolean} - Success status
	 */
	clear() {
		try {
			switch (this.storageType) {
				case StorageManager.STORAGE_TYPES.MEMORY:
					// Clear only keys with our prefix
					for (const key of this.memoryStorage.keys()) {
						if (key.startsWith(this.keyPrefix)) {
							this.memoryStorage.delete(key);
						}
					}
					return true;

				case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
				case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
					// Clear only keys with our prefix
					const keysToRemove = [];
					for (let i = 0; i < this.storage.length; i++) {
						const key = this.storage.key(i);
						if (key && key.startsWith(this.keyPrefix)) {
							keysToRemove.push(key);
						}
					}
					keysToRemove.forEach(key => this.storage.removeItem(key));
					return true;

				case StorageManager.STORAGE_TYPES.INDEXED_DB:
					return this.clearIndexedDB();

				default:
					return false;
			}
		} catch (error) {
			console.warn('StorageManager: Failed to clear storage', error);
			// Clear memory storage as fallback
			for (const key of this.memoryStorage.keys()) {
				if (key.startsWith(this.keyPrefix)) {
					this.memoryStorage.delete(key);
				}
			}
			return false;
		}
	}

	/**
	 * Get all keys for this identifier
	 * @returns {Array<string>}
	 */
	keys() {
		try {
			const keys = [];

			switch (this.storageType) {
				case StorageManager.STORAGE_TYPES.MEMORY:
					for (const key of this.memoryStorage.keys()) {
						if (key.startsWith(this.keyPrefix)) {
							keys.push(key.substring(this.keyPrefix.length));
						}
					}
					break;

				case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
				case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
					for (let i = 0; i < this.storage.length; i++) {
						const key = this.storage.key(i);
						if (key && key.startsWith(this.keyPrefix)) {
							keys.push(key.substring(this.keyPrefix.length));
						}
					}
					break;

				case StorageManager.STORAGE_TYPES.INDEXED_DB:
					return this.getKeysIndexedDB();

				default:
					break;
			}

			return keys;
		} catch (error) {
			console.warn('StorageManager: Failed to get keys', error);
			return [];
		}
	}

	/**
	 * Get storage size in bytes (approximate)
	 * @returns {number}
	 */
	getSize() {
		try {
			let size = 0;

			switch (this.storageType) {
				case StorageManager.STORAGE_TYPES.MEMORY:
					for (const [key, value] of this.memoryStorage.entries()) {
						if (key.startsWith(this.keyPrefix)) {
							size += key.length + JSON.stringify(value).length;
						}
					}
					break;

				case StorageManager.STORAGE_TYPES.LOCAL_STORAGE:
				case StorageManager.STORAGE_TYPES.SESSION_STORAGE:
					for (let i = 0; i < this.storage.length; i++) {
						const key = this.storage.key(i);
						if (key && key.startsWith(this.keyPrefix)) {
							const value = this.storage.getItem(key);
							size += key.length + (value ? value.length : 0);
						}
					}
					break;

				case StorageManager.STORAGE_TYPES.INDEXED_DB:
					// IndexedDB size calculation is complex, return estimate
					size = this.keys().length * 1000; // Rough estimate
					break;

				default:
					size = 0;
			}

			return size;
		} catch (error) {
			return 0;
		}
	}

	/**
	 * Get storage information
	 * @returns {Object}
	 */
	getInfo() {
		return {
			storageType: this.storageType,
			identifier: this.identifier,
			isAvailable: this.isAvailable,
			keyCount: this.keys().length,
			size: this.getSize(),
			keyPrefix: this.keyPrefix
		};
	}

	// IndexedDB specific methods (simplified implementation)

	/**
	 * Initialize IndexedDB
	 */
	initializeIndexedDB() {
		this.dbName = `RateLimiter_${this.identifier}`;
		this.dbVersion = 1;
		this.objectStoreName = 'rateLimiterData';
	}

	/**
	 * Set value in IndexedDB
	 * @param {string} key - Storage key
	 * @param {*} value - Value to store
	 * @returns {Promise<boolean>}
	 */
	async setIndexedDB(key, value) {
		try {
			const db = await this.openIndexedDB();
			const transaction = db.transaction([this.objectStoreName], 'readwrite');
			const store = transaction.objectStore(this.objectStoreName);

			await store.put({
				key,
				value,
				timestamp: Date.now()
			});

			return true;
		} catch (error) {
			console.warn('StorageManager: IndexedDB set failed', error);
			return false;
		}
	}

	/**
	 * Get value from IndexedDB
	 * @param {string} key - Storage key
	 * @param {*} defaultValue - Default value
	 * @returns {Promise<*>}
	 */
	async getIndexedDB(key, defaultValue = null) {
		try {
			const db = await this.openIndexedDB();
			const transaction = db.transaction([this.objectStoreName], 'readonly');
			const store = transaction.objectStore(this.objectStoreName);

			const result = await store.get(key);
			return result ? result.value : defaultValue;
		} catch (error) {
			console.warn('StorageManager: IndexedDB get failed', error);
			return defaultValue;
		}
	}

	/**
	 * Open IndexedDB connection
	 * @returns {Promise<IDBDatabase>}
	 */
	openIndexedDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result);

			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				if (!db.objectStoreNames.contains(this.objectStoreName)) {
					db.createObjectStore(this.objectStoreName, { keyPath: 'key' });
				}
			};
		});
	}

	// Static factory methods

	/**
	 * Create memory storage manager
	 * @param {string} identifier - Storage identifier
	 * @returns {StorageManager}
	 */
	static createMemory(identifier = 'default') {
		return new StorageManager(StorageManager.STORAGE_TYPES.MEMORY, identifier);
	}

	/**
	 * Create localStorage storage manager
	 * @param {string} identifier - Storage identifier
	 * @returns {StorageManager}
	 */
	static createLocalStorage(identifier = 'default') {
		return new StorageManager(StorageManager.STORAGE_TYPES.LOCAL_STORAGE, identifier);
	}

	/**
	 * Create sessionStorage storage manager
	 * @param {string} identifier - Storage identifier
	 * @returns {StorageManager}
	 */
	static createSessionStorage(identifier = 'default') {
		return new StorageManager(StorageManager.STORAGE_TYPES.SESSION_STORAGE, identifier);
	}

	/**
	 * Create IndexedDB storage manager
	 * @param {string} identifier - Storage identifier
	 * @returns {StorageManager}
	 */
	static createIndexedDB(identifier = 'default') {
		return new StorageManager(StorageManager.STORAGE_TYPES.INDEXED_DB, identifier);
	}
}