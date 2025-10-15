/**
 * MockServer Dashboard JavaScript
 * Displays and manages sessionStorage data from MockServer
 */

const STORAGE_PREFIX = 'mockserver_';

/**
 * Get data from sessionStorage
 * @param {string} key - Storage key
 * @returns {Array}
 */
function getStorageData(key) {
	const data = sessionStorage.getItem(STORAGE_PREFIX + key);
	return data ? JSON.parse(data) : [];
}

/**
 * Set data to sessionStorage
 * @param {string} key - Storage key
 * @param {Array} data - Data to store
 */
function setStorageData(key, data) {
	sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

/**
 * Get all stored data
 * @returns {Object}
 */
function getAllData() {
	return {
		contacts: getStorageData('contacts'),
		uploads: getStorageData('uploads'),
		users: getStorageData('users'),
		comments: getStorageData('comments'),
		feedback: getStorageData('feedback'),
		searches: getStorageData('searches'),
		newsletter: getStorageData('newsletter')
	};
}

/**
 * Refresh dashboard data
 */
function refreshData() {
	const data = getAllData();

	// Update statistics
	document.getElementById('stat-contacts').textContent = data.contacts.length;
	document.getElementById('stat-uploads').textContent = data.uploads.length;
	document.getElementById('stat-users').textContent = data.users.length;

	const total = data.contacts.length + data.uploads.length + data.users.length +
		data.comments.length + data.feedback.length + data.newsletter.length;
	document.getElementById('stat-total').textContent = total;

	// Update badges
	document.getElementById('badge-contacts').textContent = data.contacts.length;
	document.getElementById('badge-uploads').textContent = data.uploads.length;
	document.getElementById('badge-users').textContent = data.users.length;
	document.getElementById('badge-comments').textContent = data.comments.length;
	document.getElementById('badge-feedback').textContent = data.feedback.length;
	document.getElementById('badge-newsletter').textContent = data.newsletter.length;

	// Update content for each section
	renderDataSection('contacts', data.contacts);
	renderDataSection('uploads', data.uploads);
	renderDataSection('users', data.users);
	renderDataSection('comments', data.comments);
	renderDataSection('feedback', data.feedback);
	renderDataSection('newsletter', data.newsletter);

	console.log('Dashboard refreshed', data);
}

/**
 * Render a data section
 * @param {string} type - Data type
 * @param {Array} data - Data array
 */
function renderDataSection(type, data) {
	const container = document.getElementById(type + '-content');

	if (!data || data.length === 0) {
		container.innerHTML = `
			<div class="empty-state">
				<div class="empty-state-icon">📭</div>
				<h4>No Data Yet</h4>
				<p class="text-muted">No ${type} have been submitted yet.</p>
			</div>
		`;
		return;
	}

	// Reverse to show newest first
	const reversedData = [...data].reverse();

	let html = '<div class="table-responsive"><table class="table table-dark table-hover">';

	// Table header based on type
	switch(type) {
		case 'contacts':
			html += `
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Email</th>
						<th>Message</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
			`;
			reversedData.forEach(item => {
				html += `
					<tr>
						<td><code>${item.id}</code></td>
						<td>${item.name || 'N/A'}</td>
						<td>${item.email || 'N/A'}</td>
						<td>${truncate(item.message || 'N/A', 50)}</td>
						<td><small>${formatDate(item.timestamp)}</small></td>
					</tr>
				`;
			});
			break;

		case 'uploads':
			html += `
				<thead>
					<tr>
						<th>ID</th>
						<th>Title</th>
						<th>Files</th>
						<th>File Count</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
			`;
			reversedData.forEach(item => {
				html += `
					<tr>
						<td><code>${item.id}</code></td>
						<td>${item.title || 'Untitled'}</td>
						<td>${renderFileList(item.files)}</td>
						<td><span class="badge bg-info">${item.fileCount || 0}</span></td>
						<td><small>${formatDate(item.timestamp)}</small></td>
					</tr>
				`;
			});
			break;

		case 'users':
			html += `
				<thead>
					<tr>
						<th>ID</th>
						<th>Username</th>
						<th>Email</th>
						<th>Password</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
			`;
			reversedData.forEach(item => {
				html += `
					<tr>
						<td><code>${item.id}</code></td>
						<td><strong>${item.username || 'N/A'}</strong></td>
						<td>${item.email || 'N/A'}</td>
						<td><span class="badge bg-secondary">${item.passwordHash || '[HASHED]'}</span></td>
						<td><small>${formatDate(item.timestamp)}</small></td>
					</tr>
				`;
			});
			break;

		case 'comments':
			html += `
				<thead>
					<tr>
						<th>ID</th>
						<th>Author</th>
						<th>Comment</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
			`;
			reversedData.forEach(item => {
				html += `
					<tr>
						<td><code>${item.id}</code></td>
						<td><strong>${item.author || 'Anonymous'}</strong></td>
						<td>${truncate(item.comment || '', 100)}</td>
						<td><small>${formatDate(item.timestamp)}</small></td>
					</tr>
				`;
			});
			break;

		case 'feedback':
			html += `
				<thead>
					<tr>
						<th>ID</th>
						<th>Rating</th>
						<th>Comments</th>
						<th>Page URL</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
			`;
			reversedData.forEach(item => {
				html += `
					<tr>
						<td><code>${item.id}</code></td>
						<td>${renderRating(item.rating)}</td>
						<td>${truncate(item.comments || 'No comments', 50)}</td>
						<td><small>${truncate(item.pageUrl || '', 30)}</small></td>
						<td><small>${formatDate(item.timestamp)}</small></td>
					</tr>
				`;
			});
			break;

		case 'newsletter':
			html += `
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Email</th>
						<th>Agreed</th>
						<th>Timestamp</th>
					</tr>
				</thead>
				<tbody>
			`;
			reversedData.forEach(item => {
				html += `
					<tr>
						<td><code>${item.id}</code></td>
						<td>${item.name || 'N/A'}</td>
						<td>${item.email || 'N/A'}</td>
						<td>${item.agreed ? '<span class="badge bg-success">✓</span>' : '<span class="badge bg-danger">✗</span>'}</td>
						<td><small>${formatDate(item.timestamp)}</small></td>
					</tr>
				`;
			});
			break;
	}

	html += '</tbody></table></div>';

	// Add JSON view option
	html += `
		<div class="mt-3">
			<button class="btn btn-sm btn-outline-secondary" onclick="toggleJsonView('${type}')">
				👁️ Toggle JSON View
			</button>
			<div id="${type}-json" class="json-viewer mt-2" style="display: none;">
				${JSON.stringify(reversedData, null, 2)}
			</div>
		</div>
	`;

	container.innerHTML = html;
}

/**
 * Toggle JSON view for a data type
 * @param {string} type - Data type
 */
function toggleJsonView(type) {
	const jsonView = document.getElementById(type + '-json');
	if (jsonView.style.display === 'none') {
		jsonView.style.display = 'block';
	} else {
		jsonView.style.display = 'none';
	}
}

/**
 * Render file list
 * @param {Array} files - File array
 * @returns {string}
 */
function renderFileList(files) {
	if (!files || files.length === 0) return 'N/A';

	return files.map(file => {
		if (file && file.name) {
			return `<div class="badge bg-primary mb-1">${file.name} (${formatBytes(file.size)})</div>`;
		}
		return '';
	}).join('');
}

/**
 * Render rating stars
 * @param {number} rating - Rating value
 * @returns {string}
 */
function renderRating(rating) {
	const stars = '⭐'.repeat(parseInt(rating) || 0);
	return `<span title="${rating}/5">${stars} ${rating}</span>`;
}

/**
 * Format date string
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
function formatDate(dateString) {
	if (!dateString) return 'N/A';
	const date = new Date(dateString);
	return date.toLocaleString();
}

/**
 * Truncate string
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string}
 */
function truncate(str, length) {
	if (!str) return '';
	if (str.length <= length) return str;
	return str.substring(0, length) + '...';
}

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @returns {string}
 */
function formatBytes(bytes) {
	if (!bytes) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Export all data as JSON file
 */
function exportData() {
	const data = getAllData();
	const dataStr = JSON.stringify(data, null, 2);
	const dataBlob = new Blob([dataStr], { type: 'application/json' });
	const url = URL.createObjectURL(dataBlob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'mockserver-data-' + new Date().toISOString().split('T')[0] + '.json';
	link.click();
	URL.revokeObjectURL(url);

	alert('Data exported successfully!');
}

/**
 * Clear all data
 */
function clearAllData() {
	if (!confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
		return;
	}

	const keys = ['contacts', 'uploads', 'users', 'comments', 'feedback', 'searches', 'newsletter'];
	keys.forEach(key => {
		sessionStorage.removeItem(STORAGE_PREFIX + key);
	});
	sessionStorage.removeItem(STORAGE_PREFIX + 'initialized');

	// Reinitialize
	sessionStorage.setItem(STORAGE_PREFIX + 'initialized', 'true');
	keys.forEach(key => {
		sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify([]));
	});

	refreshData();
	alert('All data cleared successfully!');
}

/**
 * Clear specific data type
 * @param {string} type - Data type to clear
 */
function clearDataType(type) {
	if (!confirm(`Are you sure you want to clear all ${type}? This cannot be undone.`)) {
		return;
	}

	sessionStorage.setItem(STORAGE_PREFIX + type, JSON.stringify([]));
	refreshData();
	alert(`${type.charAt(0).toUpperCase() + type.slice(1)} cleared successfully!`);
}

/**
 * View raw sessionStorage
 */
function viewRawStorage() {
	const rawData = {};
	for (let i = 0; i < sessionStorage.length; i++) {
		const key = sessionStorage.key(i);
		if (key.startsWith(STORAGE_PREFIX)) {
			rawData[key] = sessionStorage.getItem(key);
		}
	}

	const modal = document.createElement('div');
	modal.className = 'modal fade';
	modal.innerHTML = `
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Raw sessionStorage</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
				</div>
				<div class="modal-body">
					<div class="json-viewer">${JSON.stringify(rawData, null, 2)}</div>
				</div>
			</div>
		</div>
	`;
	document.body.appendChild(modal);
	const bsModal = new bootstrap.Modal(modal);
	bsModal.show();

	modal.addEventListener('hidden.bs.modal', () => {
		document.body.removeChild(modal);
	});
}

// Auto-refresh every 2 seconds
setInterval(refreshData, 2000);

// Initial load
window.addEventListener('DOMContentLoaded', () => {
	refreshData();
	console.log('MockServer Dashboard loaded');
	console.log('Storage prefix:', STORAGE_PREFIX);
	console.log('Available data:', getAllData());
});