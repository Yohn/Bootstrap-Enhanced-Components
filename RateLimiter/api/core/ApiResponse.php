<?php
/**
 * ApiResponse - Standardized API response handler
 * Part of RateLimiter PHP API System
 */

declare(strict_types=1);

class ApiResponse {
	private string $requestId;
	private float  $startTime;
	private string $version;
	private array  $headers;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->requestId = $this->generateRequestId();
		$this->startTime = microtime(true);
		$this->version = '1.0.0';
		$this->headers = [];

		// Set default headers
		$this->setDefaultHeaders();
	}

	/**
	 * Send successful response
	 *
	 * @param mixed $data Response data
	 * @param array $meta Additional metadata
	 * @param array|null $pagination Pagination information
	 * @param int $statusCode HTTP status code
	 * @return void
	 */
	public function success(
		mixed $data = null,
		array $meta = [],
		?array $pagination = null,
		int $statusCode = 200
	): void {
		$response = [
			'success' => true,
			'data'    => $data,
			'meta'    => $this->buildMeta($meta)
		];

		if ($pagination !== null) {
			$response['pagination'] = $pagination;
		}

		$this->sendResponse($response, $statusCode);
	}

	/**
	 * Send error response
	 *
	 * @param string $code Error code
	 * @param string $message Error message
	 * @param string|null $details Additional error details
	 * @param int $statusCode HTTP status code
	 * @param array $meta Additional metadata
	 * @return void
	 */
	public function error(
		string $code,
		string $message,
		?string $details = null,
		int $statusCode = 400,
		array $meta = []
	): void {
		$error = [
			'code'    => $code,
			'message' => $message
		];

		if ($details !== null) {
			$error['details'] = $details;
		}

		$response = [
			'success' => false,
			'error'   => $error,
			'meta'    => $this->buildMeta($meta)
		];

		$this->sendResponse($response, $statusCode);
	}

	/**
	 * Send rate limit exceeded response
	 *
	 * @param int $retryAfter Seconds until retry is allowed
	 * @param string|null $details Additional details
	 * @return void
	 */
	public function rateLimitExceeded(int $retryAfter, ?string $details = null): void {
		$this->setHeader('Retry-After', (string) $retryAfter);

		$this->error(
			'RATE_LIMIT_EXCEEDED',
			'Rate limit exceeded',
			$details ?? "You have exceeded the rate limit. Please try again in {$retryAfter} seconds.",
			429,
			['retry_after' => $retryAfter]
		);
	}

	/**
	 * Send validation error response
	 *
	 * @param array $errors Validation errors
	 * @return void
	 */
	public function validationError(array $errors): void {
		$this->error(
			'VALIDATION_ERROR',
			'Validation failed',
			'The request data is invalid',
			422,
			['validation_errors' => $errors]
		);
	}

	/**
	 * Send authentication required response
	 *
	 * @param string|null $message Custom message
	 * @return void
	 */
	public function authRequired(?string $message = null): void {
		$this->error(
			'AUTHENTICATION_REQUIRED',
			$message ?? 'Authentication required',
			'Please provide valid authentication credentials',
			401
		);
	}

	/**
	 * Send forbidden response
	 *
	 * @param string|null $message Custom message
	 * @return void
	 */
	public function forbidden(?string $message = null): void {
		$this->error(
			'FORBIDDEN',
			$message ?? 'Access forbidden',
			'You do not have permission to access this resource',
			403
		);
	}

	/**
	 * Send not found response
	 *
	 * @param string|null $resource Resource name
	 * @return void
	 */
	public function notFound(?string $resource = null): void {
		$message = $resource ? "The {$resource} was not found" : 'Resource not found';

		$this->error(
			'RESOURCE_NOT_FOUND',
			$message,
			'The requested resource could not be found',
			404
		);
	}

	/**
	 * Send internal server error response
	 *
	 * @param string|null $details Error details (only in debug mode)
	 * @return void
	 */
	public function serverError(?string $details = null): void {
		$showDetails = $_ENV['DEBUG_MODE'] ?? false;

		$this->error(
			'INTERNAL_SERVER_ERROR',
			'Internal server error',
			$showDetails ? $details : 'An unexpected error occurred',
			500
		);
	}

	/**
	 * Send maintenance mode response
	 *
	 * @param int $retryAfter Estimated seconds until service is restored
	 * @return void
	 */
	public function maintenanceMode(int $retryAfter = 3600): void {
		$this->setHeader('Retry-After', (string) $retryAfter);

		$this->error(
			'SERVICE_UNAVAILABLE',
			'Service temporarily unavailable',
			'The service is currently under maintenance. Please try again later.',
			503,
			['retry_after' => $retryAfter]
		);
	}

	/**
	 * Set rate limit headers
	 *
	 * @param int $limit Request limit
	 * @param int $remaining Remaining requests
	 * @param int $reset Reset timestamp
	 * @param int|null $retryAfter Retry after seconds (for exceeded limits)
	 * @return void
	 */
	public function setRateLimitHeaders(
		int $limit,
		int $remaining,
		int $reset,
		?int $retryAfter = null
	): void {
		$this->setHeader('X-RateLimit-Limit', (string) $limit);
		$this->setHeader('X-RateLimit-Remaining', (string) max(0, $remaining));
		$this->setHeader('X-RateLimit-Reset', (string) $reset);

		if ($retryAfter !== null) {
			$this->setHeader('X-RateLimit-Retry-After', (string) $retryAfter);
		}
	}

	/**
	 * Set custom header
	 *
	 * @param string $name Header name
	 * @param string $value Header value
	 * @return void
	 */
	public function setHeader(string $name, string $value): void {
		$this->headers[$name] = $value;
	}

	/**
	 * Set multiple headers
	 *
	 * @param array $headers Associative array of headers
	 * @return void
	 */
	public function setHeaders(array $headers): void {
		foreach ($headers as $name => $value) {
			$this->setHeader($name, $value);
		}
	}

	/**
	 * Get request ID
	 *
	 * @return string
	 */
	public function getRequestId(): string {
		return $this->requestId;
	}

	/**
	 * Get execution time
	 *
	 * @return float
	 */
	public function getExecutionTime(): float {
		return round(microtime(true) - $this->startTime, 4);
	}

	/**
	 * Build metadata for response
	 *
	 * @param array $additionalMeta Additional metadata
	 * @return array
	 */
	private function buildMeta(array $additionalMeta = []): array {
		$meta = [
			'timestamp'      => gmdate('Y-m-d\TH:i:s\Z'),
			'request_id'     => $this->requestId,
			'execution_time' => $this->getExecutionTime(),
			'version'        => $this->version
		];

		return array_merge($meta, $additionalMeta);
	}

	/**
	 * Send the actual HTTP response
	 *
	 * @param array $data Response data
	 * @param int $statusCode HTTP status code
	 * @return void
	 */
	private function sendResponse(array $data, int $statusCode): void {
		// Set status code
		http_response_code($statusCode);

		// Set headers
		foreach ($this->headers as $name => $value) {
			header("{$name}: {$value}");
		}

		// Set final execution time
		$data['meta']['execution_time'] = $this->getExecutionTime();

		// Output JSON response
		echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
		exit;
	}

	/**
	 * Set default headers
	 *
	 * @return void
	 */
	private function setDefaultHeaders(): void {
		$this->setHeader('Content-Type', 'application/json; charset=utf-8');
		$this->setHeader('X-Request-ID', $this->requestId);
		$this->setHeader('X-API-Version', $this->version);
		$this->setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		$this->setHeader('Pragma', 'no-cache');
		$this->setHeader('Expires', '0');

		// Security headers
		$this->setHeader('X-Content-Type-Options', 'nosniff');
		$this->setHeader('X-Frame-Options', 'DENY');
		$this->setHeader('X-XSS-Protection', '1; mode=block');
	}

	/**
	 * Generate unique request ID
	 *
	 * @return string
	 */
	private function generateRequestId(): string {
		return 'req_' . uniqid() . '_' . bin2hex(random_bytes(4));
	}

	/**
	 * Create pagination array
	 *
	 * @param int $page Current page
	 * @param int $perPage Items per page
	 * @param int $total Total items
	 * @return array
	 */
	public static function createPagination(int $page, int $perPage, int $total): array {
		$totalPages = (int) ceil($total / $perPage);

		return [
			'page'        => $page,
			'per_page'    => $perPage,
			'total'       => $total,
			'total_pages' => $totalPages,
			'has_prev'    => $page > 1,
			'has_next'    => $page < $totalPages,
			'prev_page'   => $page > 1 ? $page - 1 : null,
			'next_page'   => $page < $totalPages ? $page + 1 : null
		];
	}

	/**
	 * Validate and sanitize pagination parameters
	 *
	 * @param array $params Request parameters
	 * @param int $maxPerPage Maximum items per page
	 * @return array
	 */
	public static function sanitizePagination(array $params, int $maxPerPage = 100): array {
		$page = max(1, (int) ($params['page'] ?? 1));
		$perPage = min($maxPerPage, max(1, (int) ($params['per_page'] ?? 20)));

		return [$page, $perPage];
	}

	/**
	 * Log API request
	 *
	 * @param string $method HTTP method
	 * @param string $endpoint Endpoint path
	 * @param int $statusCode Response status code
	 * @param array $meta Additional metadata
	 * @return void
	 */
	public function logRequest(string $method, string $endpoint, int $statusCode, array $meta = []): void {
		$logData = [
			'request_id'     => $this->requestId,
			'timestamp'      => gmdate('Y-m-d\TH:i:s\Z'),
			'method'         => $method,
			'endpoint'       => $endpoint,
			'status_code'    => $statusCode,
			'execution_time' => $this->getExecutionTime(),
			'ip_address'     => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
			'user_agent'     => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
			'meta'           => $meta
		];

		// Log to file or database
		error_log(json_encode($logData), 3, 'logs/api.log');
	}
}