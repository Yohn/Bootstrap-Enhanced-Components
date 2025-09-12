/**
 * FileValidator - Advanced file validation utilities
 */
class FileValidator {
	constructor(options = {}) {
		this.config = {
			// MIME type mappings for better validation
			mimeTypes: {
				// Images
				'jpg': ['image/jpeg'],
				'jpeg': ['image/jpeg'],
				'png': ['image/png'],
				'gif': ['image/gif'],
				'webp': ['image/webp'],
				'svg': ['image/svg+xml'],
				'bmp': ['image/bmp'],
				'tiff': ['image/tiff'],

				// Videos
				'mp4': ['video/mp4'],
				'avi': ['video/x-msvideo'],
				'mov': ['video/quicktime'],
				'wmv': ['video/x-ms-wmv'],
				'flv': ['video/x-flv'],
				'webm': ['video/webm'],
				'mkv': ['video/x-matroska'],

				// Documents
				'pdf': ['application/pdf'],
				'doc': ['application/msword'],
				'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
				'xls': ['application/vnd.ms-excel'],
				'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
				'ppt': ['application/vnd.ms-powerpoint'],
				'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
				'txt': ['text/plain'],
				'rtf': ['application/rtf'],

				// Archives
				'zip': ['application/zip'],
				'rar': ['application/vnd.rar'],
				'7z': ['application/x-7z-compressed'],
				'tar': ['application/x-tar'],
				'gz': ['application/gzip'],

				// Audio
				'mp3': ['audio/mpeg'],
				'wav': ['audio/wav'],
				'ogg': ['audio/ogg'],
				'flac': ['audio/flac'],
				'm4a': ['audio/mp4'],
				'aac': ['audio/aac'],

				// Web files
				'html': ['text/html'],
				'css': ['text/css'],
				'js': ['application/javascript', 'text/javascript'],
				'json': ['application/json'],
				'xml': ['application/xml', 'text/xml']
			},

			// File signature validation (magic numbers)
			signatures: {
				'jpg': [0xFF, 0xD8, 0xFF],
				'png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
				'gif': [0x47, 0x49, 0x46, 0x38],
				'pdf': [0x25, 0x50, 0x44, 0x46],
				'zip': [0x50, 0x4B, 0x03, 0x04],
				'mp4': [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]
			},

			// Security settings
			checkFileSignature: false,
			maxFilenameLength: 255,
			allowedCharacters: /^[a-zA-Z0-9.\-_\s()[\]{}]+$/,

			// Custom validation rules
			customValidators: [],

			...options
		};
	}

	/**
	 * Validate file type against allowed types
	 */
	validateType(file, allowedTypes) {
		if (!allowedTypes || allowedTypes.length === 0) {
			return { valid: true };
		}

		const fileName = file.name.toLowerCase();
		const fileExtension = fileName.split('.').pop();
		const mimeType = file.type.toLowerCase();

		// Check each allowed type
		for (const allowedType of allowedTypes) {
			const normalizedType = allowedType.toLowerCase();

			// Direct extension match
			if (normalizedType === fileExtension) {
				return { valid: true };
			}

			// MIME type match
			if (normalizedType === mimeType) {
				return { valid: true };
			}

			// Wildcard MIME type match (e.g., "image/*")
			if (normalizedType.includes('*')) {
				const baseType = normalizedType.replace('*', '');
				if (mimeType.startsWith(baseType)) {
					return { valid: true };
				}
			}

			// Check against known MIME types for extension
			if (this.config.mimeTypes[normalizedType]) {
				const expectedMimeTypes = this.config.mimeTypes[normalizedType];
				if (expectedMimeTypes.includes(mimeType)) {
					return { valid: true };
				}
			}
		}

		return {
			valid: false,
			error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
		};
	}

	/**
	 * Validate file size
	 */
	validateSize(file, maxSize) {
		if (!maxSize || file.size <= maxSize) {
			return { valid: true };
		}

		return {
			valid: false,
			error: `File too large. Maximum size: ${this.formatBytes(maxSize)}`
		};
	}

	/**
	 * Validate filename for security
	 */
	validateFilename(filename) {
		// Check length
		if (filename.length > this.config.maxFilenameLength) {
			return {
				valid: false,
				error: `Filename too long. Maximum ${this.config.maxFilenameLength} characters.`
			};
		}

		// Check for dangerous characters
		if (!this.config.allowedCharacters.test(filename)) {
			return {
				valid: false,
				error: 'Filename contains invalid characters.'
			};
		}

		// Check for dangerous extensions
		const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'php'];
		const extension = filename.split('.').pop().toLowerCase();

		if (dangerousExtensions.includes(extension)) {
			return {
				valid: false,
				error: 'File type not allowed for security reasons.'
			};
		}

		return { valid: true };
	}

	/**
	 * Validate file signature (magic numbers) for security
	 */
	async validateFileSignature(file) {
		if (!this.config.checkFileSignature) {
			return { valid: true };
		}

		const extension = file.name.split('.').pop().toLowerCase();
		const expectedSignature = this.config.signatures[extension];

		if (!expectedSignature) {
			// No signature to check
			return { valid: true };
		}

		try {
			const arrayBuffer = await this.readFileChunk(file, 0, expectedSignature.length);
			const uint8Array = new Uint8Array(arrayBuffer);

			for (let i = 0; i < expectedSignature.length; i++) {
				if (uint8Array[i] !== expectedSignature[i]) {
					return {
						valid: false,
						error: 'File content does not match its extension.'
					};
				}
			}

			return { valid: true };
		} catch (error) {
			return {
				valid: false,
				error: 'Could not validate file signature.'
			};
		}
	}

	/**
	 * Read a chunk of file as ArrayBuffer
	 */
	readFileChunk(file, start, length) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			const blob = file.slice(start, start + length);

			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = () => reject(reader.error);

			reader.readAsArrayBuffer(blob);
		});
	}

	/**
	 * Run custom validators
	 */
	async validateCustom(file) {
		for (const validator of this.config.customValidators) {
			try {
				const result = await validator(file);
				if (!result.valid) {
					return result;
				}
			} catch (error) {
				return {
					valid: false,
					error: `Custom validation failed: ${error.message}`
				};
			}
		}

		return { valid: true };
	}

	/**
	 * Comprehensive file validation
	 */
	async validateFile(file, options = {}) {
		const {
			allowedTypes = null,
			maxSize = null,
			checkSignature = this.config.checkFileSignature
		} = options;

		const results = [];

		// Filename validation
		const filenameResult = this.validateFilename(file.name);
		if (!filenameResult.valid) {
			results.push(filenameResult);
		}

		// Type validation
		if (allowedTypes) {
			const typeResult = this.validateType(file, allowedTypes);
			if (!typeResult.valid) {
				results.push(typeResult);
			}
		}

		// Size validation
		if (maxSize) {
			const sizeResult = this.validateSize(file, maxSize);
			if (!sizeResult.valid) {
				results.push(sizeResult);
			}
		}

		// File signature validation
		if (checkSignature) {
			const signatureResult = await this.validateFileSignature(file);
			if (!signatureResult.valid) {
				results.push(signatureResult);
			}
		}

		// Custom validation
		const customResult = await this.validateCustom(file);
		if (!customResult.valid) {
			results.push(customResult);
		}

		// Return results
		const errors = results.filter(r => !r.valid);
		return {
			valid: errors.length === 0,
			errors: errors.map(e => e.error),
			file: file
		};
	}

	/**
	 * Batch validate multiple files
	 */
	async validateFiles(files, options = {}) {
		const results = [];

		for (const file of files) {
			const result = await this.validateFile(file, options);
			results.push(result);
		}

		return {
			valid: results.every(r => r.valid),
			results: results,
			validFiles: results.filter(r => r.valid).map(r => r.file),
			invalidFiles: results.filter(r => !r.valid),
			errors: results.filter(r => !r.valid).flatMap(r => r.errors)
		};
	}

	/**
	 * Add custom validator function
	 */
	addCustomValidator(validatorFn) {
		this.config.customValidators.push(validatorFn);
	}

	/**
	 * Get file type category
	 */
	getFileCategory(file) {
		const mimeType = file.type.toLowerCase();
		const extension = file.name.split('.').pop().toLowerCase();

		if (mimeType.startsWith('image/')) return 'image';
		if (mimeType.startsWith('video/')) return 'video';
		if (mimeType.startsWith('audio/')) return 'audio';
		if (mimeType.startsWith('text/') || ['txt', 'rtf'].includes(extension)) return 'text';
		if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) return 'document';
		if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
		if (['html', 'css', 'js', 'json', 'xml'].includes(extension)) return 'web';

		return 'other';
	}

	/**
	 * Format bytes to human readable string
	 */
	formatBytes(bytes) {
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	/**
	 * Get recommended MIME types for an extension
	 */
	getExpectedMimeTypes(extension) {
		return this.config.mimeTypes[extension.toLowerCase()] || [];
	}

	/**
	 * Check if file is an image
	 */
	isImage(file) {
		return this.getFileCategory(file) === 'image';
	}

	/**
	 * Check if file is a video
	 */
	isVideo(file) {
		return this.getFileCategory(file) === 'video';
	}

	/**
	 * Check if file is audio
	 */
	isAudio(file) {
		return this.getFileCategory(file) === 'audio';
	}

	/**
	 * Get file icon class based on type
	 */
	getFileIcon(file) {
		const category = this.getFileCategory(file);
		const extension = file.name.split('.').pop().toLowerCase();

		const iconMap = {
			image: 'bi-file-earmark-image',
			video: 'bi-file-earmark-play',
			audio: 'bi-file-earmark-music',
			text: 'bi-file-earmark-text',
			document: {
				pdf: 'bi-file-earmark-pdf',
				doc: 'bi-file-earmark-word',
				docx: 'bi-file-earmark-word',
				xls: 'bi-file-earmark-excel',
				xlsx: 'bi-file-earmark-excel',
				ppt: 'bi-file-earmark-ppt',
				pptx: 'bi-file-earmark-ppt'
			},
			archive: 'bi-file-earmark-zip',
			web: 'bi-file-earmark-code',
			other: 'bi-file-earmark'
		};

		if (category === 'document' && iconMap.document[extension]) {
			return iconMap.document[extension];
		}

		return iconMap[category] || iconMap.other;
	}
}