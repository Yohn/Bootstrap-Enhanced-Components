/**
 * Theme Switcher for YoBox Example
 * Toggles between light and dark Bootstrap themes
 */

class ThemeSwitcher {
	constructor() {
		this.currentTheme = this.getStoredTheme() || 'dark';
		this.init();
	}

	init() {
		this.setTheme(this.currentTheme);
		this.bindEvents();
		this.updateToggleButton();
	}

	bindEvents() {
		const themeToggle = document.getElementById('themeToggle');
		if (themeToggle) {
			themeToggle.addEventListener('click', () => this.toggle());
		}

		// Listen for system theme changes
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
			if (!this.getStoredTheme()) {
				this.setTheme(e.matches ? 'dark' : 'light');
			}
		});
	}

	toggle() {
		const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
		this.setTheme(newTheme);
		this.storeTheme(newTheme);
		this.updateToggleButton();
	}

	setTheme(theme) {
		document.documentElement.setAttribute('data-bs-theme', theme);
		this.currentTheme = theme;
	}

	getStoredTheme() {
		return localStorage.getItem('yobox-theme');
	}

	storeTheme(theme) {
		localStorage.setItem('yobox-theme', theme);
	}

	updateToggleButton() {
		const themeToggle = document.getElementById('themeToggle');
		if (themeToggle) {
			const icon = themeToggle.querySelector('i');
			if (this.currentTheme === 'dark') {
				icon.className = 'fas fa-sun';
				themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
			} else {
				icon.className = 'fas fa-moon';
				themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
			}
		}
	}
}

// Initialize theme switcher when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	new ThemeSwitcher();
});