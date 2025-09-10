<?php
/**
 * BaseController - Base controller class for API endpoints
 * Part of RateLimiter PHP API System
 */

declare(strict_types=1);

abstract class BaseController {
	protected ApiResponse $response;
	protected RateLimiter $rateLimiter;
	protected array       $request;
	protected ?array      $user;
	protected string      $method;
	protected string      $endpoint;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->response = new ApiResponse();
		$this->rateLimiter = new RateLimiter();
		$this->request = $this->parseRequest();
		$this->user = null;
		$this->method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
		$this->endpoint = $this->getEndpoint();
	}

	/**
	 * Handle the incoming request
	 *
	 * @param string $action Action method to call
	 * @param array $params URL parameters
	 * @return void
	 */
	public function handleRequest(string $action, array $params = []): void {
		try {
			// Check if action method exists
			if (!method_exists($this, $action)) {
				$this->response->notFound("Action '{$action}' not found");
				return;
			}

			// Pre-flight checks
			$this->performPreFlightChecks();

			// Call the action method
			$this->$action($params);

		} catch (Exception $e) {
			$this->handleException($e);
		}
	}

	/**
	 * Perform pre-flight checks before processing request
	 *
	 * @return void
	 */
	protected function performPreFlightChecks(): void {
		// Rate limiting check
		$this->checkRateLimit();

		// Authentication check (if required)
		if ($this->requiresAuthentication()) {
			$this->authenticateRequest();
		}

		// Authorization check (if required)
		if ($this->requiresAuthorization()) {
			$this->authorizeRequest();
		}

		// Input validation
		$this->validateRequest();
	}

	/**
	 * Check rate limiting
	 *
	 * @return void
	 */
	protected function checkRateLimit(): void {
		$identifier = $this->getRateLimitIdentifier();
		$tier = $this->getUserTier();

		$result = $this->rateLimiter->checkLimit($identifier, $this->endpoint, $tier);

		// Set rate limit headers
		$this->response->setRateLimitHeaders(
			$result['limit'],
			$result['remaining'],
			$result['reset_time'],
			$result['retry_after'] > 0 ? $result['retry_after'] : null
		);

		// Check if blocked by blacklist
		if ($this->rateLimiter->isBlacklisted($identifier)) {
			$this->response->error(
				'BLACKLISTED',
				'Access denied',
				'Your access has been temporarily restricted',
				403
			);
		}

		// Check rate limit
		if (!$result['allowed']) {
			$this->response->rateLimitExceeded($result['retry_after']);
		}

		// Record the request
		$this->rateLimiter->recordRequest($identifier, $this->endpoint, true);
	}

	/**
	 * Authenticate the request
	 *
	 * @return void
	 */
	protected function authenticateRequest(): void {
		$token = $this->getAuthToken();

		if (!$token) {
			$this->response->authRequired('Authentication token required');
		}

		$this->user = $this->validateToken($token);

		if (!$this->user) {
			$this->response->authRequired('Invalid authentication token');
		}

		if (!$this->user['is_active']) {
			$this->response->forbidden('Account is deactivated');
		}
	}

	/**
	 * Authorize the request
	 *
	 * @return void
	 */
	protected function authorizeRequest(): void {
		if (!$this->isAuthorized()) {
			$this->response->forbidden('Insufficient permissions');
		}
	}

	/**
	 * Validate request input
	 *
	 * @return void
	 */
	protected function validateRequest(): void {
		$rules = $this->getValidationRules();

		if (empty($rules)) {
			return;
		}

		$validator = new Validator($this->request, $rules);

		if (!$validator->validate()) {
			$this->response->validationError($validator->getErrors());
		}
	}

	/**
	 * Handle exceptions
	 *
	 * @param Exception $e Exception to handle
	 * @return void
	 */
	protected function handleException(Exception $e): void {
		// Log the exception
		error_log("API Exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());

		// Send appropriate response based on exception type
		switch (get_class($e)) {
			case 'InvalidArgumentException':
				$this->response->validationError(['general' => [$e->getMessage()]]);
				break;

			case 'UnauthorizedHttpException':
				$this->response->authRequired($e->getMessage());
				break;

			case 'ForbiddenHttpException':
				$this->response->forbidden($e->getMessage());
				break;

			case 'NotFoundHttpException':
				$this->response->notFound();
				break;

			default:
				$this->response->serverError($e->getMessage());
		}
	}

	/**
	 * Parse incoming request data
	 *
	 * @return array Parsed request data
	 */
	protected function parseRequest(): array {
		$input = [];

		// Parse URL parameters
		if (!empty($_GET)) {
			$input = array_merge($input, $_GET);
		}

		// Parse POST data
		if (!empty($_POST)) {
			$input = array_merge($input, $_POST);
		}

		// Parse JSON input
		if ($this->method === 'POST' || $this->method === 'PUT' || $this->method === 'PATCH') {
			$jsonInput = json_decode(file_get_contents('php://input'), true);
			if (json_last_error() === JSON_ERROR_NONE && is_array($jsonInput)) {
				$input = array_merge($input, $jsonInput);
			}
		}

		return $input;
	}

	/**
	 * Get current endpoint path
	 *
	 * @return string Endpoint path
	 */
	protected function getEndpoint(): string {
		$path = $_SERVER['REQUEST_URI'] ?? '/';
		$path = parse_url($path, PHP_URL_PATH);
		return $path ?: '/';
	}

	/**
	 * Get rate limit identifier
	 *
	 * @return string Rate limit identifier
	 */
	protected function getRateLimitIdentifier(): string {
		if ($this->user) {
			return "user:{$this->user['id']}";
		}

		return "ip:" . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
	}

	/**
	 * Get user tier for rate limiting
	 *
	 * @return string User tier
	 */
	protected function getUserTier(): string {
		return $this->user['rate_limit_tier'] ?? 'basic';
	}

	/**
	 * Get authentication token from request
	 *
	 * @return string|null Authentication token
	 */
	protected function getAuthToken(): ?string {
		// Check Authorization header
		$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
		if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
			return $matches[1];
		}

		// Check API key header
		$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
		if ($apiKey) {
			return $apiKey;
		}

		// Check query parameter
		return $this->request['api_key'] ?? null;
	}

	/**
	 * Validate authentication token
	 *
	 * @param string $token Authentication token
	 * @return array|null User data or null if invalid
	 */
	protected function validateToken(string $token): ?array {
		// JWT token validation
		if (str_contains($token, '.')) {
			return $this->validateJWTToken($token);
		}

		// API key validation
		return $this->validateApiKey($token);
	}

	/**
	 * Validate JWT token
	 *
	 * @param string $token JWT token
	 * @return array|null User data or null if invalid
	 */
	protected function validateJWTToken(string $token): ?array {
		try {
			// Simple JWT validation (you might want to use a proper JWT library)
			$parts = explode('.', $token);
			if (count($parts) !== 3) {
				return null;
			}

			$header = json_decode(base64_decode($parts[0]), true);
			$payload = json_decode(base64_decode($parts[1]), true);
			$signature = $parts[2];

			// Verify signature
			$validSignature = base64_encode(hash_hmac('sha256', $parts[0] . '.' . $parts[1], $_ENV['JWT_SECRET'], true));

			if (!hash_equals($signature, $validSignature)) {
				return null;
			}

			// Check expiration
			if (isset($payload['exp']) && $payload['exp'] < time()) {
				return null;
			}

			// Get user data
			return $this->getUserById($payload['user_id'] ?? 0);

		} catch (Exception $e) {
			return null;
		}
	}

	/**
	 * Validate API key
	 *
	 * @param string $apiKey API key
	 * @return array|null User data or null if invalid
	 */
	protected function validateApiKey(string $apiKey): ?array {
		// Database lookup for API key
		try {
			$database = new PDO(
				"mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset=utf8mb4",
				$_ENV['DB_USER'],
				$_ENV['DB_PASS']
			);

			$stmt = $database->prepare("SELECT * FROM users WHERE api_key = ? AND is_active = 1");
			$stmt->execute([$apiKey]);

			return $stmt->fetch() ?: null;

		} catch (Exception $e) {
			return null;
		}
	}

	/**
	 * Get user by ID
	 *
	 * @param int $userId User ID
	 * @return array|null User data
	 */
	protected function getUserById(int $userId): ?array {
		try {
			$database = new PDO(
				"mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset=utf8mb4",
				$_ENV['DB_USER'],
				$_ENV['DB_PASS']
			);

			$stmt = $database->prepare("SELECT * FROM users WHERE id = ? AND is_active = 1");
			$stmt->execute([$userId]);

			return $stmt->fetch() ?: null;

		} catch (Exception $e) {
			return null;
		}
	}

	/**
	 * Create paginated response
	 *
	 * @param array $data Response data
	 * @param int $total Total item count
	 * @param array $meta Additional metadata
	 * @return void
	 */
	protected function paginatedResponse(array $data, int $total, array $meta = []): void {
		[$page, $perPage] = ApiResponse::sanitizePagination($this->request);
		$pagination = ApiResponse::createPagination($page, $perPage, $total);

		$this->response->success($data, $meta, $pagination);
	}

	/**
	 * Log API request for analytics
	 *
	 * @param int $statusCode Response status code
	 * @param array $meta Additional metadata
	 * @return void
	 */
	protected function logRequest(int $statusCode, array $meta = []): void {
		$this->response->logRequest($this->method, $this->endpoint, $statusCode, $meta);
	}

	// Abstract methods to be implemented by child controllers

	/**
	 * Check if this endpoint requires authentication
	 *
	 * @return bool
	 */
	abstract protected function requiresAuthentication(): bool;

	/**
	 * Check if this endpoint requires authorization
	 *
	 * @return bool
	 */
	abstract protected function requiresAuthorization(): bool;

	/**
	 * Check if current user is authorized for this action
	 *
	 * @return bool
	 */
	abstract protected function isAuthorized(): bool;

	/**
	 * Get validation rules for request
	 *
	 * @return array Validation rules
	 */
	abstract protected function getValidationRules(): array;
}