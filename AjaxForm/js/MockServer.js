/**
 * MockServer - Simulates server-side form processing using sessionStorage
 * Provides realistic AJAX endpoints for testing AjaxForm/AjaxSubmit
 *
 * @class MockServer
 * @version 1.0.0
 */
class MockServer {
	/**
	 * Default configuration
	 * @type {Object}
	 */
	static defaults = {
		delay: 500,                    // Response delay in milliseconds
		successRate: 0.95,             // 95% success rate (5% random failures)
		uploadSpeedKBps: 500,          // Simulated upload speed in KB/s
		storagePrefix: 'mockserver_',  // sessionStorage key prefix
		verbose: true                  // Console logging
	};

	/**
	 * Initialize MockServer
	 * @param {Object} options - Configuration options
	 */
	constructor(options = {}) {
		this.config = { ...MockServer.defaults, ...options };
		this.endpoints = {};
		this.requestLog = [];

		// Initialize storage
		this.initStorage();

		if (this.config.verbose) {
			console.log('MockServer initialized', this.config);
		}
	}

	/**
	 * Initialize sessionStorage structure
	 */
	initStorage() {
		if (!sessionStorage.getItem(this.config.storagePrefix + 'initialized')) {
			sessionStorage.setItem(this.config.storagePrefix + 'initialized', 'true');
			sessionStorage.setItem(this.config.storagePrefix + 'contacts', JSON.stringify([]));
			sessionStorage.setItem(this.config.storagePrefix + 'uploads', JSON.stringify([]));
			sessionStorage.setItem(this.config.storagePrefix + 'users', JSON.stringify([]));
			sessionStorage.setItem(this.config.storagePrefix + 'comments', JSON.stringify([]));
			sessionStorage.setItem(this.config.storagePrefix + 'feedback', JSON.stringify([]));
			sessionStorage.setItem(this.config.storagePrefix + 'searches', JSON.stringify([]));
			sessionStorage.setItem(this.config.storagePrefix + 'newsletter', JSON.stringify([]));
		}
	}

	/**
	 * Register an endpoint handler
	 * @param {string} path - Endpoint path
	 * @param {Function} handler - Handler function
	 */
	registerEndpoint(path, handler) {
		this.endpoints[path] = handler;

		if (this.config.verbose) {
			console.log('Endpoint registered:', path);
		}
	}

	/**
	 * Process a form submission
	 * @param {string} path - Endpoint path
	 * @param {FormData|URLSearchParams} data - Form data
	 * @param {Object} options - Request options
	 * @returns {Promise}
	 */
	processRequest(path, data, options = {}) {
		return new Promise((resolve, reject) => {
			// Log request
			const requestLog = {
				path: path,
				timestamp: new Date().toISOString(),
				data: this.serializeData(data)
			};
			this.requestLog.push(requestLog);

			// Check if endpoint exists
			if (!this.endpoints[path]) {
				setTimeout(() => {
					reject({
						status: 404,
						statusText: 'Not Found',
						message: 'Endpoint not found: ' + path
					});
				}, this.config.delay);
				return;
			}

			// Simulate random failures
			if (Math.random() > this.config.successRate) {
				setTimeout(() => {
					reject({
						status: 500,
						statusText: 'Internal Server Error',
						message: 'Random server error (simulated)'
					});
				}, this.config.delay);
				return;
			}

			// Calculate delay for file uploads
			let delay = this.config.delay;
			if (data instanceof FormData && options.simulateUpload) {
				const totalSize = this.calculateFormDataSize(data);
				delay = (totalSize / 1024) / this.config.uploadSpeedKBps * 1000;
				delay = Math.max(delay, this.config.delay); // Minimum delay
			}

			// Process request
			setTimeout(() => {
				try {
					const response = this.endpoints[path](data, options);
					resolve(response);
				} catch (error) {
					reject({
						status: 500,
						statusText: 'Internal Server Error',
						message: error.message
					});
				}
			}, delay);
		});
	}

	/**
	 * Serialize data for logging
	 * @param {FormData|URLSearchParams} data - Form data
	 * @returns {Object}
	 */
	serializeData(data) {
		const obj = {};

		if (data instanceof FormData) {
			for (const [key, value] of data.entries()) {
				if (value instanceof File) {
					obj[key] = {
						type: 'File',
						name: value.name,
						size: value.size,
						mimeType: value.type
					};
				} else {
					obj[key] = value;
				}
			}
		} else if (data instanceof URLSearchParams) {
			for (const [key, value] of data.entries()) {
				obj[key] = value;
			}
		}

		return obj;
	}

	/**
	 * Calculate approximate FormData size
	 * @param {FormData} formData - Form data
	 * @returns {number} Size in bytes
	 */
	calculateFormDataSize(formData) {
		let size = 0;

		for (const [key, value] of formData.entries()) {
			if (value instanceof File) {
				size += value.size;
			} else {
				size += value.length;
			}
		}

		return size;
	}

	/**
	 * Get data from storage
	 * @param {string} key - Storage key
	 * @returns {Array}
	 */
	getStorageData(key) {
		const data = sessionStorage.getItem(this.config.storagePrefix + key);
		return data ? JSON.parse(data) : [];
	}

	/**
	 * Set data to storage
	 * @param {string} key - Storage key
	 * @param {Array} data - Data to store
	 */
	setStorageData(key, data) {
		sessionStorage.setItem(this.config.storagePrefix + key, JSON.stringify(data));
	}

	/**
	 * Add item to storage
	 * @param {string} key - Storage key
	 * @param {Object} item - Item to add
	 * @returns {Object} Added item with ID
	 */
	addToStorage(key, item) {
		const data = this.getStorageData(key);
		const newItem = {
			id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
			timestamp: new Date().toISOString(),
			...item
		};
		data.push(newItem);
		this.setStorageData(key, data);
		return newItem;
	}

	/**
	 * Clear all storage
	 */
	clearStorage() {
		const keys = [
			'contacts', 'uploads', 'users', 'comments',
			'feedback', 'searches', 'newsletter'
		];

		keys.forEach(key => {
			sessionStorage.removeItem(this.config.storagePrefix + key);
		});

		sessionStorage.removeItem(this.config.storagePrefix + 'initialized');
		this.initStorage();

		if (this.config.verbose) {
			console.log('MockServer storage cleared');
		}
	}

	/**
	 * Get request log
	 * @returns {Array}
	 */
	getRequestLog() {
		return this.requestLog;
	}

	/**
	 * Clear request log
	 */
	clearRequestLog() {
		this.requestLog = [];
	}

	/**
	 * Get all stored data
	 * @returns {Object}
	 */
	getAllData() {
		return {
			contacts: this.getStorageData('contacts'),
			uploads: this.getStorageData('uploads'),
			users: this.getStorageData('users'),
			comments: this.getStorageData('comments'),
			feedback: this.getStorageData('feedback'),
			searches: this.getStorageData('searches'),
			newsletter: this.getStorageData('newsletter')
		};
	}

	/**
	 * Export all data as JSON
	 * @returns {string}
	 */
	exportData() {
		return JSON.stringify(this.getAllData(), null, 2);
	}

	/**
	 * Static method to create a standard response
	 * @param {boolean} success - Success status
	 * @param {string} message - Response message
	 * @param {Object} data - Response data
	 * @returns {Object}
	 */
	static createResponse(success, message, data = {}) {
		return {
			success: success,
			message: message,
			timestamp: new Date().toISOString(),
			data: data
		};
	}
}

/**
 * Default MockServer endpoints
 */
class MockServerEndpoints {
	/**
	 * Setup default endpoints for MockServer
	 * @param {MockServer} server - MockServer instance
	 */
	static setup(server) {
		// Contact form endpoint
		server.registerEndpoint('/api/contact', (data) => {
			const formData = server.serializeData(data);
			const savedContact = server.addToStorage('contacts', formData);

			return MockServer.createResponse(
				true,
				'Contact form submitted successfully',
				{
					contact: savedContact,
					totalContacts: server.getStorageData('contacts').length
				}
			);
		});

		// File upload endpoint
		server.registerEndpoint('/api/upload', (data) => {
			const formData = server.serializeData(data);
			const files = [];

			// Extract file information
			for (const [key, value] of Object.entries(formData)) {
				if (value && typeof value === 'object' && value.type === 'File') {
					files.push(value);
				}
			}

			const uploadRecord = {
				title: formData.title || 'Untitled',
				files: files,
				fileCount: files.length
			};

			const savedUpload = server.addToStorage('uploads', uploadRecord);

			return MockServer.createResponse(
				true,
				`Successfully uploaded ${files.length} file(s)`,
				{
					upload: savedUpload,
					files: files,
					totalUploads: server.getStorageData('uploads').length
				}
			);
		});

		// Registration endpoint
		server.registerEndpoint('/api/register', (data) => {
			const formData = server.serializeData(data);

			// Check if user already exists
			const existingUsers = server.getStorageData('users');
			const userExists = existingUsers.some(u => u.email === formData.email);

			if (userExists) {
				throw new Error('User with this email already exists');
			}

			// Don't store password in plain text (just mark it as hashed)
			const userRecord = {
				username: formData.username,
				email: formData.email,
				passwordHash: '[HASHED]'
			};

			const savedUser = server.addToStorage('users', userRecord);

			return MockServer.createResponse(
				true,
				'Account created successfully',
				{
					user: {
						id: savedUser.id,
						username: savedUser.username,
						email: savedUser.email,
						createdAt: savedUser.timestamp
					},
					totalUsers: server.getStorageData('users').length
				}
			);
		});

		// Search endpoint
		server.registerEndpoint('/api/search', (data) => {
			const formData = server.serializeData(data);

			const searchRecord = {
				query: formData.query,
				category: formData.category,
				advanced: formData.advanced === 'true'
			};

			server.addToStorage('searches', searchRecord);

			// Generate mock search results
			const resultCount = Math.floor(Math.random() * 20) + 5;
			const results = [];
			for (let i = 0; i < resultCount; i++) {
				results.push({
					id: i + 1,
					title: `Result ${i + 1} for "${formData.query}"`,
					description: `This is a sample search result in category ${formData.category}`,
					relevance: Math.random()
				});
			}

			// Sort by relevance
			results.sort((a, b) => b.relevance - a.relevance);

			return MockServer.createResponse(
				true,
				'Search completed',
				{
					query: formData.query,
					category: formData.category,
					results: results.slice(0, 10), // Top 10 results
					totalResults: resultCount,
					searchTime: Math.random() * 0.5
				}
			);
		});

		// Comment endpoint
		server.registerEndpoint('/api/comment', (data) => {
			const formData = server.serializeData(data);

			const commentRecord = {
				author: formData.author,
				comment: formData.comment
			};

			const savedComment = server.addToStorage('comments', commentRecord);

			return MockServer.createResponse(
				true,
				'Comment posted successfully',
				{
					comment: savedComment,
					totalComments: server.getStorageData('comments').length
				}
			);
		});

		// Feedback endpoint
		server.registerEndpoint('/api/feedback', (data) => {
			const formData = server.serializeData(data);

			const feedbackRecord = {
				rating: formData.rating,
				comments: formData.comments,
				pageUrl: formData.pageUrl,
				userAgent: formData.userAgent,
				sessionId: formData.sessionId
			};

			const savedFeedback = server.addToStorage('feedback', feedbackRecord);

			// Calculate average rating
			const allFeedback = server.getStorageData('feedback');
			const avgRating = allFeedback.reduce((sum, f) => sum + parseInt(f.rating), 0) / allFeedback.length;

			return MockServer.createResponse(
				true,
				'Thank you for your feedback',
				{
					feedback: savedFeedback,
					averageRating: avgRating.toFixed(2),
					totalFeedback: allFeedback.length
				}
			);
		});

		// Avatar upload endpoint
		server.registerEndpoint('/api/avatar', (data) => {
			const formData = server.serializeData(data);

			let avatarInfo = null;
			if (formData.avatar && formData.avatar.type === 'File') {
				avatarInfo = formData.avatar;
			}

			const uploadRecord = {
				avatar: avatarInfo
			};

			const savedAvatar = server.addToStorage('uploads', uploadRecord);

			return MockServer.createResponse(
				true,
				'Avatar uploaded successfully',
				{
					avatar: savedAvatar,
					url: '/uploads/avatars/' + savedAvatar.id + '.jpg'
				}
			);
		});

		// Newsletter endpoint
		server.registerEndpoint('/api/newsletter', (data) => {
			const formData = server.serializeData(data);

			// Check if email already subscribed
			const subscribers = server.getStorageData('newsletter');
			const alreadySubscribed = subscribers.some(s => s.email === formData.email);

			if (alreadySubscribed) {
				throw new Error('This email is already subscribed to our newsletter');
			}

			const subscriptionRecord = {
				name: formData.name,
				email: formData.email,
				agreed: formData.agree === 'on'
			};

			const savedSubscription = server.addToStorage('newsletter', subscriptionRecord);

			return MockServer.createResponse(
				true,
				'Successfully subscribed to newsletter',
				{
					subscription: savedSubscription,
					totalSubscribers: server.getStorageData('newsletter').length
				}
			);
		});
	}
}