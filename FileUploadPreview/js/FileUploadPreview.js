/**
 * FileUploadPreview - Enhanced file upload with preview capabilities
 * Compatible with Bootstrap 5.3.7
 */
class FileUploadPreview {
	constructor(element, options = {}) {
		this.element = typeof element === 'string' ? document.querySelector(element) : element;

		if (!this.element) {
			throw new Error('FileUploadPreview: Element not found');
		}

		// Default configuration
		this.config = {
			// Display options
			displayMode: 'preview', // 'list' or 'preview'
			showFileSize: true,
			showFileType: true,
			showRemoveButton: true,

			// File restrictions
			allowedTypes: [], // Empty array means all types allowed
			maxFileSize: null, // In bytes, null means no limit
			maxFiles: null, // Maximum number of files, null means unlimited

			// Preview options
			imagePreviewSize: 150, // Width/height in pixels
			videoPreviewSize: 150,
			generateVideoThumbnail: true,

			// UI customization
			containerClass: 'file-upload-preview-container',
			listGroupClass: 'list-group',
			previewGridClass: 'row g-3',
			errorClass: 'alert alert-danger',
			successClass: 'alert alert-success',

			// Labels and messages
			labels: {
				fileSize: 'Size',
				fileType: 'Type',
				remove: 'Remove',
				invalidType: 'Invalid file type',
				invalidSize: 'File size exceeds limit',
				maxFilesExceeded: 'Maximum number of files exceeded'
			},

			// Callbacks
			onFileAdded: null,
			onFileRemoved: null,
			onValidationError: null,
			onAllFilesProcessed: null
		};

		// Merge user options
		this.config = { ...this.config, ...options };
		this.config.labels = { ...this.config.labels, ...options.labels };

		// Internal state
		this.files = new Map(); // Map of file ID to file data
		this.fileCounter = 0;
		this.previewContainer = null;
		this.errorContainer = null;

		this.init();
	}

	/**
	 * Initialize the file upload preview
	 */
	init() {
		// Ensure the element is a file input
		if (this.element.type !== 'file') {
			throw new Error('FileUploadPreview: Element must be a file input');
		}

		this.createContainers();
		this.bindEvents();

		// Handle pre-selected files if any
		if (this.element.files.length > 0) {
			this.handleFiles(this.element.files);
		}
	}

	/**
	 * Create preview and error containers
	 */
	createContainers() {
		// Create main container
		const container = document.createElement('div');
		container.className = this.config.containerClass;

		// Create error container
		this.errorContainer = document.createElement('div');
		this.errorContainer.className = 'mt-2';

		// Create preview container
		this.previewContainer = document.createElement('div');
		this.previewContainer.className = `mt-3 ${this.config.displayMode === 'preview' ? this.config.previewGridClass : ''}`;

		// Insert after the file input
		container.appendChild(this.errorContainer);
		container.appendChild(this.previewContainer);
		this.element.parentNode.insertBefore(container, this.element.nextSibling);
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		this.element.addEventListener('change', (e) => {
			this.handleFiles(e.target.files);
		});
	}

	/**
	 * Handle file selection
	 */
	handleFiles(fileList) {
		this.clearErrors();

		const filesToProcess = Array.from(fileList);
		const validFiles = [];
		const errors = [];

		// Check max files limit
		if (this.config.maxFiles && (this.files.size + filesToProcess.length) > this.config.maxFiles) {
			errors.push(this.config.labels.maxFilesExceeded + ` (${this.config.maxFiles})`);
			return this.showErrors(errors);
		}

		// Validate each file
		filesToProcess.forEach(file => {
			const validation = this.validateFile(file);
			if (validation.valid) {
				validFiles.push(file);
			} else {
				errors.push(`${file.name}: ${validation.error}`);
			}
		});

		// Show errors if any
		if (errors.length > 0) {
			this.showErrors(errors);
			if (this.config.onValidationError) {
				this.config.onValidationError(errors);
			}
		}

		// Process valid files
		validFiles.forEach(file => {
			this.addFile(file);
		});

		if (this.config.onAllFilesProcessed) {
			this.config.onAllFilesProcessed(validFiles, errors);
		}
	}

	/**
	 * Validate a single file
	 */
	validateFile(file) {
		// Check file type
		if (this.config.allowedTypes.length > 0) {
			const fileExtension = file.name.split('.').pop().toLowerCase();
			const mimeType = file.type.toLowerCase();

			const isValidType = this.config.allowedTypes.some(type => {
				const normalizedType = type.toLowerCase();
				return normalizedType === fileExtension ||
					   normalizedType === mimeType ||
					   (normalizedType.includes('/') && mimeType.includes(normalizedType.replace('*', '')));
			});

			if (!isValidType) {
				return {
					valid: false,
					error: `${this.config.labels.invalidType}. Allowed: ${this.config.allowedTypes.join(', ')}`
				};
			}
		}

		// Check file size
		if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
			return {
				valid: false,
				error: `${this.config.labels.invalidSize} (${this.formatFileSize(this.config.maxFileSize)})`
			};
		}

		return { valid: true };
	}

	/**
	 * Add a file to the preview
	 */
	addFile(file) {
		const fileId = `file_${++this.fileCounter}`;
		const fileData = {
			id: fileId,
			file: file,
			element: null
		};

		this.files.set(fileId, fileData);

		if (this.config.displayMode === 'list') {
			this.createListItem(fileData);
		} else {
			this.createPreviewItem(fileData);
		}

		if (this.config.onFileAdded) {
			this.config.onFileAdded(fileData);
		}
	}

	/**
	 * Create list item for file
	 */
	createListItem(fileData) {
		const { file, id } = fileData;

		// Create list group if it doesn't exist
		if (!this.previewContainer.querySelector('.list-group')) {
			const listGroup = document.createElement('div');
			listGroup.className = this.config.listGroupClass;
			this.previewContainer.appendChild(listGroup);
		}

		const listGroup = this.previewContainer.querySelector('.list-group');
		const listItem = document.createElement('div');
		listItem.className = 'list-group-item d-flex justify-content-between align-items-start';
		listItem.setAttribute('data-file-id', id);

		const contentDiv = document.createElement('div');
		contentDiv.className = 'me-auto';

		// File name
		const fileName = document.createElement('div');
		fileName.className = 'fw-bold';
		fileName.textContent = file.name;
		contentDiv.appendChild(fileName);

		// File details
		const details = document.createElement('small');
		details.className = 'text-muted';

		const detailParts = [];
		if (this.config.showFileType) {
			detailParts.push(`${this.config.labels.fileType}: ${file.type || 'Unknown'}`);
		}
		if (this.config.showFileSize) {
			detailParts.push(`${this.config.labels.fileSize}: ${this.formatFileSize(file.size)}`);
		}

		details.textContent = detailParts.join(' | ');
		contentDiv.appendChild(details);

		listItem.appendChild(contentDiv);

		// Remove button
		if (this.config.showRemoveButton) {
			const removeBtn = document.createElement('button');
			removeBtn.className = 'btn btn-sm btn-outline-danger';
			removeBtn.innerHTML = '&times;';
			removeBtn.setAttribute('aria-label', this.config.labels.remove);
			removeBtn.addEventListener('click', () => this.removeFile(id));
			listItem.appendChild(removeBtn);
		}

		listGroup.appendChild(listItem);
		fileData.element = listItem;
	}

	/**
	 * Create preview item for file
	 */
	createPreviewItem(fileData) {
		const { file, id } = fileData;

		const colDiv = document.createElement('div');
		colDiv.className = 'col-auto';
		colDiv.setAttribute('data-file-id', id);

		const cardDiv = document.createElement('div');
		cardDiv.className = 'card';
		cardDiv.style.width = `${Math.max(this.config.imagePreviewSize, this.config.videoPreviewSize)}px`;

		// Preview content
		if (file.type.startsWith('image/')) {
			this.createImagePreview(cardDiv, file);
		} else if (file.type.startsWith('video/') && this.config.generateVideoThumbnail) {
			this.createVideoPreview(cardDiv, file);
		} else {
			this.createFilePreview(cardDiv, file);
		}

		// Card body with file info
		const cardBody = document.createElement('div');
		cardBody.className = 'card-body p-2';

		// File name
		const fileName = document.createElement('h6');
		fileName.className = 'card-title text-truncate mb-1';
		fileName.textContent = file.name;
		fileName.setAttribute('title', file.name);
		cardBody.appendChild(fileName);

		// File details
		if (this.config.showFileType || this.config.showFileSize) {
			const details = document.createElement('small');
			details.className = 'card-text text-muted';

			const detailParts = [];
			if (this.config.showFileType) {
				detailParts.push(file.type || 'Unknown');
			}
			if (this.config.showFileSize) {
				detailParts.push(this.formatFileSize(file.size));
			}

			details.textContent = detailParts.join(' | ');
			cardBody.appendChild(details);
		}

		// Remove button
		if (this.config.showRemoveButton) {
			const removeBtn = document.createElement('button');
			removeBtn.className = 'btn btn-sm btn-outline-danger mt-2 w-100';
			removeBtn.textContent = this.config.labels.remove;
			removeBtn.addEventListener('click', () => this.removeFile(id));
			cardBody.appendChild(removeBtn);
		}

		cardDiv.appendChild(cardBody);
		colDiv.appendChild(cardDiv);
		this.previewContainer.appendChild(colDiv);

		fileData.element = colDiv;
	}

	/**
	 * Create image preview
	 */
	createImagePreview(container, file) {
		const img = document.createElement('img');
		img.className = 'card-img-top';
		img.style.height = `${this.config.imagePreviewSize}px`;
		img.style.objectFit = 'cover';
		img.alt = file.name;

		const reader = new FileReader();
		reader.onload = (e) => {
			img.src = e.target.result;
		};
		reader.readAsDataURL(file);

		container.appendChild(img);
	}

	/**
	 * Create video preview with thumbnail
	 */
	createVideoPreview(container, file) {
		const video = document.createElement('video');
		video.style.width = '100%';
		video.style.height = `${this.config.videoPreviewSize}px`;
		video.style.objectFit = 'cover';
		video.controls = false;
		video.muted = true;

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		const reader = new FileReader();
		reader.onload = (e) => {
			video.src = e.target.result;
			video.addEventListener('loadeddata', () => {
				// Seek to 1 second or 10% of duration, whichever is smaller
				const seekTime = Math.min(1, video.duration * 0.1);
				video.currentTime = seekTime;
			});

			video.addEventListener('seeked', () => {
				canvas.width = this.config.videoPreviewSize;
				canvas.height = this.config.videoPreviewSize;
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

				const thumbnail = document.createElement('img');
				thumbnail.className = 'card-img-top';
				thumbnail.src = canvas.toDataURL();
				thumbnail.alt = file.name;
				thumbnail.style.height = `${this.config.videoPreviewSize}px`;
				thumbnail.style.objectFit = 'cover';

				container.appendChild(thumbnail);
			});
		};
		reader.readAsDataURL(file);
	}

	/**
	 * Create generic file preview
	 */
	createFilePreview(container, file) {
		const iconDiv = document.createElement('div');
		iconDiv.className = 'card-img-top d-flex align-items-center justify-content-center bg-light';
		iconDiv.style.height = `${this.config.imagePreviewSize}px`;

		const icon = document.createElement('i');
		icon.className = 'bi bi-file-earmark fs-1 text-muted';
		iconDiv.appendChild(icon);

		container.appendChild(iconDiv);
	}

	/**
	 * Remove a file from the preview
	 */
	removeFile(fileId) {
		const fileData = this.files.get(fileId);
		if (!fileData) return;

		// Remove from DOM
		if (fileData.element) {
			fileData.element.remove();
		}

		// Remove from files map
		this.files.delete(fileId);

		// If list is empty, remove list group
		if (this.config.displayMode === 'list' && this.files.size === 0) {
			const listGroup = this.previewContainer.querySelector('.list-group');
			if (listGroup) {
				listGroup.remove();
			}
		}

		// Update file input (create new FileList)
		this.updateFileInput();

		if (this.config.onFileRemoved) {
			this.config.onFileRemoved(fileData);
		}
	}

	/**
	 * Update the file input with current files
	 */
	updateFileInput() {
		// Create a new FileList-like object
		const dt = new DataTransfer();
		this.files.forEach(fileData => {
			dt.items.add(fileData.file);
		});
		this.element.files = dt.files;
	}

	/**
	 * Format file size for display
	 */
	formatFileSize(bytes) {
		if (bytes === 0) return '0 Bytes';

		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	/**
	 * Show validation errors
	 */
	showErrors(errors) {
		this.clearErrors();

		const errorDiv = document.createElement('div');
		errorDiv.className = this.config.errorClass;

		if (errors.length === 1) {
			errorDiv.textContent = errors[0];
		} else {
			const ul = document.createElement('ul');
			ul.className = 'mb-0';
			errors.forEach(error => {
				const li = document.createElement('li');
				li.textContent = error;
				ul.appendChild(li);
			});
			errorDiv.appendChild(ul);
		}

		this.errorContainer.appendChild(errorDiv);
	}

	/**
	 * Clear all errors
	 */
	clearErrors() {
		this.errorContainer.innerHTML = '';
	}

	/**
	 * Get all current files
	 */
	getFiles() {
		return Array.from(this.files.values()).map(fileData => fileData.file);
	}

	/**
	 * Clear all files
	 */
	clear() {
		this.files.forEach((fileData, fileId) => {
			this.removeFile(fileId);
		});
	}

	/**
	 * Update configuration
	 */
	updateConfig(newConfig) {
		this.config = { ...this.config, ...newConfig };
		if (newConfig.labels) {
			this.config.labels = { ...this.config.labels, ...newConfig.labels };
		}

		// Re-render if display mode changed
		if (newConfig.displayMode && newConfig.displayMode !== this.config.displayMode) {
			this.rerenderPreviews();
		}
	}

	/**
	 * Re-render all previews (useful when config changes)
	 */
	rerenderPreviews() {
		const currentFiles = Array.from(this.files.values()).map(fd => fd.file);
		this.clear();
		this.previewContainer.className = `mt-3 ${this.config.displayMode === 'preview' ? this.config.previewGridClass : ''}`;
		currentFiles.forEach(file => this.addFile(file));
	}
}