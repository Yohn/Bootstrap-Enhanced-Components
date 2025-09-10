<?php
/**
 * API Entry Point - Main router and bootstrapper
 * Part of RateLimiter PHP API System
 */

declare(strict_types=1);

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Start session for rate limiting (if using memory storage)
session_start();

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
	$lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
	foreach ($lines as $line) {
		if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
			[$key, $value] = explode('=', $line, 2);
			$_ENV[trim($key)] = trim($value);
		}
	}
}

// Set default timezone
date_default_timezone_set($_ENV['TIMEZONE'] ?? 'UTC');

// Autoload classes (simple autoloader)
spl_autoload_register(function ($className) {
	$directories = [
		__DIR__ . '/core/',
		__DIR__ . '/controllers/',
	//	__DIR__ . '/models/',
	//	__DIR__ . '/middleware/',
		__DIR__ . '/utils/'
	];

	foreach ($directories as $directory) {
		$file = $directory . $className . '.php';
		if (file_exists($file)) {
			require_once $file;
			return;
		}
	}
});



/**
 * Global exception handler
 */
function handleException(Throwable $e): void
{
	error_log("Uncaught exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());

	$response = new ApiResponse();
	$response->serverError($_ENV['DEBUG_MODE'] ?? false ? $e->getMessage() : null);
}

/**
 * Global error handler
 */
function handleError(int $severity, string $message, string $file, int $line): void
{
	if (!(error_reporting() & $severity)) {
		return;
	}

	error_log("PHP Error: {$message} in {$file}:{$line}");

	$response = new ApiResponse();
	$response->serverError($_ENV['DEBUG_MODE'] ?? false ? $message : null);
}

/**
 * Shutdown function to catch fatal errors
 */
function handleShutdown(): void
{
	$error = error_get_last();
	if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
		error_log("Fatal error: {$error['message']} in {$error['file']}:{$error['line']}");

		if (!headers_sent()) {
			$response = new ApiResponse();
			$response->serverError($_ENV['DEBUG_MODE'] ?? false ? $error['message'] : null);
		}
	}
}

// Set error handlers
set_exception_handler('handleException');
set_error_handler('handleError');
register_shutdown_function('handleShutdown');

// Initialize and run the router
try {
	$router = new ApiRouter();
	$router->handleRequest();
} catch (Exception $e) {
	error_log("Bootstrap exception: " . $e->getMessage());
	$response = new ApiResponse();
	$response->serverError("Application startup error");
}