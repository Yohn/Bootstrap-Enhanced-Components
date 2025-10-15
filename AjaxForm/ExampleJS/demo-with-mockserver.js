/**
 * AjaxForm Demo with MockServer
 * Uses MockServer to simulate real server responses via sessionStorage
 */

// Initialize MockServer
const mockServer = new MockServer({
	delay: 800,           // 800ms response delay
	successRate: 0.98,    // 98% success rate
	uploadSpeedKBps: 1000, // 1MB/s upload speed
	verbose: true
});

// Setup default endpoints
MockServerEndpoints.setup(mockServer);

// Helper function to intercept form submissions and route to MockServer
function createMockXHR(endpoint) {
	return function(formData, options) {
		return mockServer.processRequest(endpoint, formData, options);
	};
}

// Override XMLHttpRequest for our forms
function setupMockAjax() {
	// Store original XMLHttpRequest
	const OriginalXHR = window.XMLHttpRequest;

	// Map of endpoints to mock handlers
	const endpointMap = {
		'/api/contact': true,
		'/api/upload': true,
		'/api/register': true,
		'/api/search': true,
		'/api/comment': true,
		'/api/feedback': true,
		'/api/avatar': true,
		'/api/newsletter': true
	};

	// Create mock XHR constructor
	window.MockXMLHttpRequest = function() {
		const xhr = new OriginalXHR();
		let endpoint = null;
		let method = null;
		let formData = null;
		let isAsync = true;
		let isMocked = false;

		// Store original methods
		const originalOpen = xhr.open.bind(xhr);
		const originalSend = xhr.send.bind(xhr);
		const originalSetRequestHeader = xhr.setRequestHeader.bind(xhr);

		// Override open to capture endpoint
		xhr.open = function(httpMethod, url, async) {
			endpoint = url;
			method = httpMethod;
			isAsync = async !== false;

			// Check if this should be mocked
			if (endpointMap[url]) {
				isMocked = true;
				// Still call original open to set state to OPENED
				return originalOpen(httpMethod, url, async);
			}

			isMocked = false;
			return originalOpen(httpMethod, url, async);
		};

		// Override send to intercept and use MockServer
		xhr.send = function(data) {
			formData = data;

			// Check if this endpoint should be mocked
			if (isMocked) {
				// Abort the real XHR since we're using MockServer
				xhr.abort = function() {}; // Prevent abort errors

				// Use MockServer instead of real AJAX
				mockServer.processRequest(endpoint, formData, { simulateUpload: true })
					.then(response => {
						// Simulate successful response
						Object.defineProperty(xhr, 'status', { value: 200, writable: false, configurable: true });
						Object.defineProperty(xhr, 'statusText', { value: 'OK', writable: false, configurable: true });
						Object.defineProperty(xhr, 'responseText', {
							value: JSON.stringify(response),
							writable: false,
							configurable: true
						});
						Object.defineProperty(xhr, 'readyState', { value: 4, writable: false, configurable: true });

						// Trigger onload
						if (xhr.onload) {
							xhr.onload({ target: xhr });
						}
					})
					.catch(error => {
						// Simulate error response
						Object.defineProperty(xhr, 'status', { value: error.status || 500, writable: false, configurable: true });
						Object.defineProperty(xhr, 'statusText', { value: error.statusText || 'Error', writable: false, configurable: true });
						Object.defineProperty(xhr, 'responseText', {
							value: JSON.stringify(error),
							writable: false,
							configurable: true
						});
						Object.defineProperty(xhr, 'readyState', { value: 4, writable: false, configurable: true });

						// Trigger onerror
						if (xhr.onerror) {
							xhr.onerror({ target: xhr });
						}
					});

				return;
			}

			// Not a mocked endpoint, use real AJAX
			return originalSend(data);
		};

		return xhr;
	};

	// Replace XMLHttpRequest temporarily
	window.XMLHttpRequest = window.MockXMLHttpRequest;
}

// Setup mock AJAX
setupMockAjax();

// Helper function to display response
function displayResponse(elementId, data) {
	const element = document.getElementById(elementId);
	if (element) {
		element.innerHTML = '<strong>Response:</strong>\n' + JSON.stringify(data, null, 2);
		element.style.display = 'block';
	}
}

// Example 1: Simple Contact Form
(function() {
	const contactForm = new AjaxForm('#contactForm', {
		url: '/api/contact',
		dataType: 'json',
		beforeSubmit: function(formArray, form, options) {
			console.log('Contact form submitting...', formArray);
			form.classList.add('ajax-form-submitting');
			return true;
		},
		success: function(data, textStatus, xhr) {
			console.log('Contact form success:', data);
			const form = document.getElementById('contactForm');
			form.classList.remove('ajax-form-submitting');
			form.classList.add('ajax-form-success');

			displayResponse('contactResponse', data);

			// Reset form after 3 seconds
			setTimeout(() => {
				form.reset();
				form.classList.remove('ajax-form-success');
			}, 3000);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Contact form error:', errorThrown);
			const form = document.getElementById('contactForm');
			form.classList.remove('ajax-form-submitting');
			form.classList.add('ajax-form-error');

			displayResponse('contactResponse', {
				error: true,
				message: 'Failed to submit form'
			});

			setTimeout(() => {
				form.classList.remove('ajax-form-error');
			}, 5000);
		}
	});
})();

// Example 2: Multiple File Upload with Progress
(function() {
	const uploadForm = document.getElementById('uploadForm');
	const fileInput = document.getElementById('upload-files');
	const filePreview = document.getElementById('filePreview');
	const progressContainer = document.getElementById('uploadProgress');
	const progressBar = document.getElementById('uploadProgressBar');
	const progressText = document.getElementById('uploadProgressText');

	// Preview selected files
	fileInput.addEventListener('change', function(e) {
		filePreview.innerHTML = '';
		const files = e.target.files;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const reader = new FileReader();

			reader.onload = function(event) {
				const previewItem = document.createElement('div');
				previewItem.className = 'file-preview-item';
				previewItem.innerHTML = `
					<img src="${event.target.result}" alt="${file.name}">
					<div class="file-preview-name">${file.name}</div>
				`;
				filePreview.appendChild(previewItem);
			};

			reader.readAsDataURL(file);
		}
	});

	const uploadFormHandler = new AjaxForm('#uploadForm', {
		url: '/api/upload',
		dataType: 'json',
		beforeSubmit: function(formArray, form, options) {
			progressContainer.style.display = 'block';
			progressBar.style.width = '0%';
			progressText.textContent = '0%';
			return true;
		},
		uploadProgress: function(event, loaded, total, percentComplete) {
			progressBar.style.width = percentComplete + '%';
			progressText.textContent = Math.round(percentComplete) + '%';
		},
		success: function(data, textStatus, xhr) {
			console.log('Upload success:', data);
			displayResponse('uploadResponse', data);

			// Hide progress after 2 seconds
			setTimeout(() => {
				progressContainer.style.display = 'none';
			}, 2000);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Upload error:', errorThrown);
			progressContainer.style.display = 'none';
			alert('Upload failed! Please try again.');
		}
	});

	// Clear button
	document.getElementById('clearUpload').addEventListener('click', function() {
		uploadForm.reset();
		filePreview.innerHTML = '';
		progressContainer.style.display = 'none';
		document.getElementById('uploadResponse').style.display = 'none';
	});
})();

// Example 3: Form with Before Submit Validation
(function() {
	const registrationForm = new AjaxForm('#registrationForm', {
		url: '/api/register',
		dataType: 'json',
		beforeSubmit: function(formArray, form, options) {
			const username = form.querySelector('[name="username"]').value;
			const email = form.querySelector('[name="email"]').value;
			const password = form.querySelector('[name="password"]').value;
			const confirmPassword = form.querySelector('[name="confirm_password"]').value;
			const errorsDiv = document.getElementById('validationErrors');
			const errors = [];

			// Validation rules
			if (username.length < 3) {
				errors.push('Username must be at least 3 characters long.');
			}

			if (password.length < 8) {
				errors.push('Password must be at least 8 characters long.');
			}

			if (password !== confirmPassword) {
				errors.push('Passwords do not match.');
			}

			if (errors.length > 0) {
				errorsDiv.innerHTML = '<strong>Please fix the following errors:</strong><ul>' +
					errors.map(err => '<li>' + err + '</li>').join('') + '</ul>';
				errorsDiv.style.display = 'block';
				return false; // Cancel submission
			}

			errorsDiv.style.display = 'none';
			return true;
		},
		success: function(data, textStatus, xhr) {
			console.log('Registration success:', data);
			displayResponse('registrationResponse', data);

			// Clear form
			document.getElementById('registrationForm').reset();
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Registration error:', errorThrown);
			const errorData = JSON.parse(xhr.responseText);
			displayResponse('registrationResponse', errorData);
		}
	});
})();

// Example 4: AjaxSubmit (Immediate)
(function() {
	const searchForm = document.getElementById('searchForm');

	// Search button click
	document.getElementById('searchBtn').addEventListener('click', function() {
		AjaxSubmit.submit('#searchForm', {
			url: '/api/search',
			dataType: 'json',
			success: function(data, textStatus, xhr) {
				console.log('Search success:', data);
				displayResponse('searchResults', data);
			},
			error: function(xhr, textStatus, errorThrown) {
				console.error('Search error:', errorThrown);
				displayResponse('searchResults', {
					error: true,
					message: 'Search failed'
				});
			}
		});
	});

	// Advanced search button
	document.getElementById('advancedSearchBtn').addEventListener('click', function() {
		AjaxSubmit.submit('#searchForm', {
			url: '/api/search',
			dataType: 'json',
			extraData: {
				advanced: 'true',
				filters: 'recent,popular',
				limit: 50
			},
			success: function(data, textStatus, xhr) {
				console.log('Advanced search success:', data);
				displayResponse('searchResults', data);
			}
		});
	});
})();

// Example 5: Update Target Element
(function() {
	let commentCount = 0;

	const commentForm = new AjaxForm('#commentForm', {
		url: '/api/comment',
		dataType: 'json',
		success: function(data, textStatus, xhr) {
			console.log('Comment posted:', data);
			const form = document.getElementById('commentForm');
			const author = form.querySelector('[name="author"]').value;
			const comment = form.querySelector('[name="comment"]').value;

			commentCount++;

			// Create new comment HTML
			const commentElement = document.createElement('div');
			commentElement.className = 'border-bottom pb-3 mb-3';
			commentElement.innerHTML = `
				<div class="d-flex justify-content-between align-items-start mb-2">
					<strong>${author}</strong>
					<small class="text-muted">${new Date().toLocaleString()}</small>
				</div>
				<p class="mb-0">${comment}</p>
			`;

			// Update comments list
			const commentsList = document.getElementById('commentsList');
			if (commentCount === 1) {
				commentsList.innerHTML = '';
			}
			commentsList.appendChild(commentElement);

			// Clear form
			form.reset();

			// Show success message
			alert('Comment posted successfully!');
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Comment error:', errorThrown);
			alert('Failed to post comment. Please try again.');
		}
	});
})();

// Example 6: Form with Extra Data
(function() {
	// Display extra data info
	document.getElementById('pageUrl').textContent = window.location.href;
	document.getElementById('userAgent').textContent = navigator.userAgent.substring(0, 50) + '...';

	// Update timestamp every second
	setInterval(() => {
		document.getElementById('timestamp').textContent = new Date().toISOString();
	}, 1000);

	const feedbackForm = new AjaxForm('#feedbackForm', {
		url: '/api/feedback',
		dataType: 'json',
		extraData: {
			pageUrl: window.location.href,
			userAgent: navigator.userAgent,
			sessionId: 'session_' + Math.random().toString(36).substr(2, 9)
		},
		beforeSubmit: function(formArray, form, options) {
			// Update timestamp in extraData
			options.extraData.timestamp = Date.now();
			return true;
		},
		success: function(data, textStatus, xhr) {
			console.log('Feedback success:', data);
			displayResponse('feedbackResponse', data);
			document.getElementById('feedbackForm').reset();
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Feedback error:', errorThrown);
			alert('Failed to submit feedback. Please try again.');
		}
	});
})();

// Example 7: Single File Upload (Avatar)
(function() {
	const avatarFile = document.getElementById('avatar-file');
	const avatarPreview = document.getElementById('avatarPreview');
	const progressContainer = document.getElementById('avatarProgress');
	const progressBar = document.getElementById('avatarProgressBar');
	const progressText = document.getElementById('avatarProgressText');

	// Preview avatar
	avatarFile.addEventListener('change', function(e) {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = function(event) {
				avatarPreview.src = event.target.result;
				avatarPreview.style.display = 'block';
			};
			reader.readAsDataURL(file);
		}
	});

	const avatarForm = new AjaxForm('#avatarForm', {
		url: '/api/avatar',
		dataType: 'json',
		beforeSubmit: function(formArray, form, options) {
			progressContainer.style.display = 'block';
			progressBar.style.width = '0%';
			progressText.textContent = '0%';
			return true;
		},
		uploadProgress: function(event, loaded, total, percentComplete) {
			progressBar.style.width = percentComplete + '%';
			progressText.textContent = Math.round(percentComplete) + '%';
		},
		success: function(data, textStatus, xhr) {
			console.log('Avatar upload success:', data);
			displayResponse('avatarResponse', data);

			setTimeout(() => {
				progressContainer.style.display = 'none';
			}, 2000);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Avatar upload error:', errorThrown);
			progressContainer.style.display = 'none';
			alert('Avatar upload failed!');
		}
	});
})();

// Example 8: Clear Form After Success
(function() {
	const newsletterForm = new AjaxForm('#newsletterForm', {
		url: '/api/newsletter',
		dataType: 'json',
		clearForm: true,  // This will clear the form after success
		success: function(data, textStatus, xhr) {
			console.log('Newsletter success:', data);

			document.getElementById('newsletterSuccess').style.display = 'block';
			displayResponse('newsletterResponse', data);

			setTimeout(() => {
				document.getElementById('newsletterSuccess').style.display = 'none';
			}, 5000);
		},
		error: function(xhr, textStatus, errorThrown) {
			console.error('Newsletter error:', errorThrown);
			const errorData = JSON.parse(xhr.responseText);
			alert(errorData.message || 'Subscription failed. Please try again.');
		}
	});
})();

// Add MockServer dashboard button
(function() {
	const dashboardBtn = document.createElement('button');
	dashboardBtn.className = 'btn btn-info position-fixed';
	dashboardBtn.style.bottom = '20px';
	dashboardBtn.style.right = '20px';
	dashboardBtn.style.zIndex = '9999';
	dashboardBtn.innerHTML = '📊 Server Dashboard';
	dashboardBtn.onclick = () => window.open('server-dashboard.html', '_blank');
	document.body.appendChild(dashboardBtn);
})();

// Log initialization
console.log('AjaxForm Demo with MockServer initialized!');
console.log('MockServer is intercepting all /api/* requests');
console.log('Data is stored in sessionStorage with prefix: ' + mockServer.config.storagePrefix);
console.log('View stored data:', mockServer.getAllData());