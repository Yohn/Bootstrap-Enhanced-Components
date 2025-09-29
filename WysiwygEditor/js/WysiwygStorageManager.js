/**
 * WYSIWYG Storage Manager
 * Handles autosave and local storage operations
 *
 * @class WysiwygStorageManager
 * @version 1.0.0
 */
class WysiwygStorageManager {
	/**
	 * Create storage manager instance
	 *
	 * @param {WysiwygEditor} editor - Parent editor instance
	 * @param {Object} config - Storage configuration
	 * @param {boolean} config.enabled - Enable autosave
	 * @param {number} config.interval - Autosave interval in ms
	 * @param {string} config.key - Storage key prefix
	 * @param {string} config.storage - Storage type ('local', 'session')
	 * @param {number} config.maxVersions - Maximum versions to keep
	 * @param {Function} config.onSave - Save callback
	 * @param {Function} config.onRestore - Restore callback
	 */
	constructor(editor, config = {}) {
		this.editor = editor;

		// Configuration
		this.config = {
			enabled: true,
			interval: 30000, // 30 seconds
			key: null,
			storage: 'local',
			maxVersions: 5,
			onSave: null,
			onRestore: null,
			...config
		};

		// State
		this.isEnabled = this.config.enabled;
		this.autosaveTimer = null;
		this.lastSaved = null;
		this.versions = [];

		// Storage engine
		this.storage = this.config.storage === 'session' ?
			window.sessionStorage : window.localStorage;

		// Generate storage key
		this.storageKey = this._generateStorageKey();

		// Initialize
		if (this.isEnabled) {
			this._init();
		}
	}

	/**
	 * Initialize storage manager
	 * @private
	 */
	_init() {
		// Load saved versions
		this._loadVersions();

		// Check for draft
		this._checkDraft();

		// Start autosave
		this._startAutosave();

		// Setup event listeners
		this._setupEventListeners();
	}

	/**
	 * Generate storage key
	 * @private
	 * @returns {string} Storage key
	 */
	_generateStorageKey() {
		if (this.config.key) {
			return `wysiwyg_${this.config.key}`;
		}

		// Generate key from textarea ID or name
		const textarea = this.editor.textarea;
		const id = textarea.id || textarea.name || 'editor';
		const url = window.location.pathname;

		return `wysiwyg_${url}_${id}`;
	}

	/**
	 * Setup event listeners
	 * @private
	 */
	_setupEventListeners() {
		// Save on blur
		if (this.editor.eventManager) {
			this.editor.eventManager.on('blur', () => {
				this.save();
			});

			// Save on visibility change
			this.editor.eventManager.on('visibilitychange', () => {
				if (document.hidden) {
					this.save();
				}
			});
		}

		// Storage events (for cross-tab sync)
		window.addEventListener('storage', (e) => {
			if (e.key === this.storageKey) {
				this._handleStorageChange(e);
			}
		});
	}

	/**
	 * Start autosave timer
	 * @private
	 */
	_startAutosave() {
		if (!this.isEnabled || !this.config.interval) return;

		this._stopAutosave();

		this.autosaveTimer = setInterval(() => {
			if (this.editor.isDirtyCheck && this.editor.isDirtyCheck()) {
				this.save();
			}
		}, this.config.interval);
	}

	/**
	 * Stop autosave timer
	 * @private
	 */
	_stopAutosave() {
		if (this.autosaveTimer) {
			clearInterval(this.autosaveTimer);
			this.autosaveTimer = null;
		}
	}

	/**
	 * Save content
	 * @public
	 * @param {boolean} createVersion - Create new version
	 * @returns {boolean} Success status
	 */
	save(createVersion = false) {
		if (!this.isEnabled) return false;

		try {
			const content = this.editor.getContent();
			const timestamp = Date.now();

			// Create save data
			const saveData = {
				content,
				timestamp,
				version: this._getNextVersion(),
				metadata: this._getMetadata()
			};

			// Save draft
			this._saveDraft(saveData);

			// Save version if requested
			if (createVersion) {
				this._saveVersion(saveData);
			}

			// Update state
			this.lastSaved = timestamp;
			this.editor.markClean();

			// Fire callback
			if (this.config.onSave) {
				this.config.onSave(saveData);
			}

			// Dispatch event
			if (this.editor.eventManager) {
				this.editor.eventManager.trigger('save', saveData);
			}

			return true;

		} catch (error) {
			console.error('WysiwygStorageManager: Save failed', error);

			// Check if quota exceeded
			if (error.name === 'QuotaExceededError') {
				this._handleQuotaExceeded();
			}

			return false;
		}
	}

	/**
	 * Restore content
	 * @public
	 * @param {number} version - Version to restore (optional)
	 * @returns {boolean} Success status
	 */
	restore(version = null) {
		try {
			let data;

			if (version !== null) {
				// Restore specific version
				data = this._getVersion(version);
			} else {
				// Restore draft
				data = this._getDraft();
			}

			if (!data) return false;

			// Set content
			this.editor.setContent(data.content);

			// Fire callback
			if (this.config.onRestore) {
				this.config.onRestore(data);
			}

			// Dispatch event
			if (this.editor.eventManager) {
				this.editor.eventManager.trigger('restore', data);
			}

			return true;

		} catch (error) {
			console.error('WysiwygStorageManager: Restore failed', error);
			return false;
		}
	}

	/**
	 * Clear all saved data
	 * @public
	 */
	clear() {
		// Clear draft
		this._clearDraft();

		// Clear versions
		this._clearVersions();

		// Reset state
		this.lastSaved = null;
		this.versions = [];
	}

	/**
	 * Check for existing draft
	 * @private
	 */
	_checkDraft() {
		const draft = this._getDraft();

		if (draft && draft.content) {
			// Check if draft is newer than current content
			const currentContent = this.editor.getContent();

			if (draft.content !== currentContent) {
				// Offer to restore draft
				this._offerDraftRestore(draft);
			}
		}
	}

	/**
	 * Offer to restore draft
	 * @private
	 * @param {Object} draft - Draft data
	 */
	_offerDraftRestore(draft) {
		const timestamp = new Date(draft.timestamp);
		const message = `A draft from ${timestamp.toLocaleString()} was found. Would you like to restore it?`;

		// Create notification or use confirm dialog
		if (this.editor.eventManager && this.editor.eventManager.hasListeners('draftFound')) {
			this.editor.eventManager.trigger('draftFound', {
				draft,
				restore: () => this.restore(),
				discard: () => this.clear()
			});
		} else {
			// Fallback to confirm dialog
			if (confirm(message)) {
				this.restore();
			} else {
				this.clear();
			}
		}
	}

	/**
	 * Save draft
	 * @private
	 * @param {Object} data - Save data
	 */
	_saveDraft(data) {
		const key = this.storageKey;
		this.storage.setItem(key, JSON.stringify(data));
	}

	/**
	 * Get draft
	 * @private
	 * @returns {Object|null} Draft data
	 */
	_getDraft() {
		try {
			const key = this.storageKey;
			const data = this.storage.getItem(key);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error('WysiwygStorageManager: Failed to get draft', error);
			return null;
		}
	}

	/**
	 * Clear draft
	 * @private
	 */
	_clearDraft() {
		const key = this.storageKey;
		this.storage.removeItem(key);
	}

	/**
	 * Save version
	 * @private
	 * @param {Object} data - Version data
	 */
	_saveVersion(data) {
		// Add to versions array
		this.versions.push(data);

		// Limit versions
		if (this.versions.length > this.config.maxVersions) {
			this.versions = this.versions.slice(-this.config.maxVersions);
		}

		// Save to storage
		const key = `${this.storageKey}_versions`;
		this.storage.setItem(key, JSON.stringify(this.versions));
	}

	/**
	 * Load versions
	 * @private
	 */
	_loadVersions() {
		try {
			const key = `${this.storageKey}_versions`;
			const data = this.storage.getItem(key);
			this.versions = data ? JSON.parse(data) : [];
		} catch (error) {
			console.error('WysiwygStorageManager: Failed to load versions', error);
			this.versions = [];
		}
	}

	/**
	 * Get version
	 * @private
	 * @param {number} version - Version number
	 * @returns {Object|null} Version data
	 */
	_getVersion(version) {
		return this.versions.find(v => v.version === version) || null;
	}

	/**
	 * Clear versions
	 * @private
	 */
	_clearVersions() {
		const key = `${this.storageKey}_versions`;
		this.storage.removeItem(key);
	}

	/**
	 * Get next version number
	 * @private
	 * @returns {number} Next version number
	 */
	_getNextVersion() {
		if (this.versions.length === 0) return 1;

		const lastVersion = this.versions[this.versions.length - 1];
		return (lastVersion.version || 0) + 1;
	}

	/**
	 * Get metadata
	 * @private
	 * @returns {Object} Metadata
	 */
	_getMetadata() {
		return {
			url: window.location.href,
			userAgent: navigator.userAgent,
			wordCount: this.editor.getWordCount ? this.editor.getWordCount() : 0,
			charCount: this.editor.getCharCount ? this.editor.getCharCount() : 0
		};
	}

	/**
	 * Handle storage change event
	 * @private
	 * @param {StorageEvent} event - Storage event
	 */
	_handleStorageChange(event) {
		// Another tab/window updated the storage
		if (event.newValue && this.editor.eventManager) {
			this.editor.eventManager.trigger('storageUpdate', {
				oldValue: event.oldValue ? JSON.parse(event.oldValue) : null,
				newValue: JSON.parse(event.newValue)
			});
		}
	}

	/**
	 * Handle quota exceeded
	 * @private
	 */
	_handleQuotaExceeded() {
		// Try to clear old versions
		const versionsToKeep = Math.floor(this.config.maxVersions / 2);
		this.versions = this.versions.slice(-versionsToKeep);

		const key = `${this.storageKey}_versions`;
		this.storage.setItem(key, JSON.stringify(this.versions));

		// Notify user
		if (this.editor.eventManager) {
			this.editor.eventManager.trigger('storageQuotaExceeded');
		}
	}

	// ============================================
	// Public API Methods
	// ============================================

	/**
	 * Enable autosave
	 * @public
	 */
	enable() {
		this.isEnabled = true;
		this._startAutosave();
	}

	/**
	 * Disable autosave
	 * @public
	 */
	disable() {
		this.isEnabled = false;
		this._stopAutosave();
	}

	/**
	 * Get all versions
	 * @public
	 * @returns {Array} Array of versions
	 */
	getVersions() {
		return [...this.versions];
	}

	/**
	 * Get version count
	 * @public
	 * @returns {number} Number of versions
	 */
	getVersionCount() {
		return this.versions.length;
	}

	/**
	 * Get last saved timestamp
	 * @public
	 * @returns {number|null} Timestamp or null
	 */
	getLastSaved() {
		return this.lastSaved;
	}

	/**
	 * Check if has draft
	 * @public
	 * @returns {boolean} True if has draft
	 */
	hasDraft() {
		return this._getDraft() !== null;
	}

	/**
	 * Export all data
	 * @public
	 * @returns {Object} Exported data
	 */
	export() {
		return {
			draft: this._getDraft(),
			versions: this.getVersions(),
			config: this.config,
			lastSaved: this.lastSaved
		};
	}

	/**
	 * Import data
	 * @public
	 * @param {Object} data - Data to import
	 */
	import(data) {
		if (data.draft) {
			this._saveDraft(data.draft);
		}

		if (data.versions) {
			this.versions = data.versions;
			this._saveVersion(null); // Save to storage
		}

		if (data.lastSaved) {
			this.lastSaved = data.lastSaved;
		}
	}

	/**
	 * Get storage size
	 * @public
	 * @returns {number} Size in bytes
	 */
	getStorageSize() {
		let size = 0;

		// Draft size
		const draft = this._getDraft();
		if (draft) {
			size += JSON.stringify(draft).length * 2; // UTF-16
		}

		// Versions size
		size += JSON.stringify(this.versions).length * 2;

		return size;
	}

	/**
	 * Destroy storage manager
	 * @public
	 */
	destroy() {
		// Stop autosave
		this._stopAutosave();

		// Save current content if dirty
		if (this.editor.isDirtyCheck && this.editor.isDirtyCheck()) {
			this.save();
		}

		// Clear references
		this.editor = null;
		this.storage = null;
	}
}