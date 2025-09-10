<?php
/**
 * Simple API Router
 */
class ApiRouter {
	private array       $routes;
	private ApiResponse $response;

	public function __construct() {
		$this->routes = [];
		$this->response = new ApiResponse();
		$this->setupRoutes();
	}

	/**
	 * Setup API routes
	 */
	private function setupRoutes(): void {
		// Test endpoints
		$this->addRoute('GET', '/api/test/simple', 'TestController', 'simple');
		$this->addRoute('GET', '/api/test/delay', 'TestController', 'delay');
		$this->addRoute('GET', '/api/test/error', 'TestController', 'error');
		$this->addRoute('GET', '/api/test/bulk', 'TestController', 'bulk');
		$this->addRoute('GET', '/api/test/analytics', 'TestController', 'analytics');
		$this->addRoute('GET', '/api/test/status', 'TestController', 'status');
		$this->addRoute('GET', '/api/test/rate-limit-info', 'TestController', 'rateLimitInfo');

		// User endpoints (example)
		$this->addRoute('GET', '/api/users', 'UserController', 'index');
		$this->addRoute('GET', '/api/users/{id}', 'UserController', 'show');
		$this->addRoute('POST', '/api/users', 'UserController', 'create');
		$this->addRoute('PUT', '/api/users/{id}', 'UserController', 'update');
		$this->addRoute('DELETE', '/api/users/{id}', 'UserController', 'delete');

		// Authentication endpoints
		$this->addRoute('POST', '/api/auth/login', 'AuthController', 'login');
		$this->addRoute('POST', '/api/auth/refresh', 'AuthController', 'refresh');
		$this->addRoute('POST', '/api/auth/logout', 'AuthController', 'logout');

		// Data endpoints
		$this->addRoute('GET', '/api/data', 'DataController', 'index');
		$this->addRoute('POST', '/api/data', 'DataController', 'create');
		$this->addRoute('GET', '/api/data/analytics', 'DataController', 'analytics');
	}

	/**
	 * Add a route
	 *
	 * @param string $method HTTP method
	 * @param string $path URL path
	 * @param string $controller Controller class name
	 * @param string $action Controller method name
	 */
	private function addRoute(string $method, string $path, string $controller, string $action): void {
		$this->routes[] = [
			'method'     => $method,
			'path'       => $path,
			'controller' => $controller,
			'action'     => $action
		];
	}

	/**
	 * Handle the incoming request
	 */
	public function handleRequest(): void {
		// CORS handling
		$this->handleCORS();

		// Get request details
		$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
		$path = $this->getRequestPath();

		// Find matching route
		$route = $this->findRoute($method, $path);

		if (!$route) {
			$this->response->notFound('API endpoint');
			return;
		}

		// Execute the route
		$this->executeRoute($route);
	}

	/**
	 * Handle CORS preflight and headers
	 */
	private function handleCORS(): void {
		$allowedOrigins = explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? '*');
		$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

		if (in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins)) {
			header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
		}

		header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
		header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key, X-Requested-With');
		header('Access-Control-Allow-Credentials: true');
		header('Access-Control-Max-Age: 86400');

		// Handle preflight requests
		if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
			http_response_code(200);
			exit;
		}
	}

	/**
	 * Get the request path
	 *
	 * @return string Clean request path
	 */
	private function getRequestPath(): string {
		$path = $_SERVER['REQUEST_URI'] ?? '/';
		$path = parse_url($path, PHP_URL_PATH);
		return rtrim($path ?: '/', '/') ?: '/';
	}

	/**
	 * Find matching route
	 *
	 * @param string $method HTTP method
	 * @param string $path Request path
	 * @return array|null Route data or null if not found
	 */
	private function findRoute(string $method, string $path): ?array {
		foreach ($this->routes as $route) {
			if ($route['method'] === $method && $this->pathMatches($route['path'], $path)) {
				$route['params'] = $this->extractParams($route['path'], $path);
				return $route;
			}
		}
		return null;
	}

	/**
	 * Check if path matches route pattern
	 *
	 * @param string $pattern Route pattern
	 * @param string $path Request path
	 * @return bool Match status
	 */
	private function pathMatches(string $pattern, string $path): bool {
		// Convert pattern to regex
		$regex = preg_replace('/\{[^}]+\}/', '([^/]+)', $pattern);
		$regex = str_replace('/', '\/', $regex);

		return preg_match('/^' . $regex . '$/', $path);
	}

	/**
	 * Extract parameters from path
	 *
	 * @param string $pattern Route pattern
	 * @param string $path Request path
	 * @return array Extracted parameters
	 */
	private function extractParams(string $pattern, string $path): array {
		$params = [];

		// Get parameter names from pattern
		preg_match_all('/\{([^}]+)\}/', $pattern, $paramNames);

		// Get parameter values from path
		$regex = preg_replace('/\{[^}]+\}/', '([^/]+)', $pattern);
		$regex = str_replace('/', '\/', $regex);

		if (preg_match('/^' . $regex . '$/', $path, $paramValues)) {
			array_shift($paramValues); // Remove full match

			foreach ($paramNames[1] as $index => $name) {
				if (isset($paramValues[$index])) {
					$params[$name] = $paramValues[$index];
				}
			}
		}

		return $params;
	}

	/**
	 * Execute the matched route
	 *
	 * @param array $route Route data
	 */
	private function executeRoute(array $route): void {
		try {
			// Check if controller class exists
			if (!class_exists($route['controller'])) {
				$this->response->serverError("Controller {$route['controller']} not found");
				return;
			}

			// Create controller instance
			$controller = new $route['controller']();

			// Check if action method exists
			if (!method_exists($controller, $route['action'])) {
				$this->response->serverError("Action {$route['action']} not found in {$route['controller']}");
				return;
			}

			// Execute the action
			$controller->handleRequest($route['action'], $route['params']);

		} catch (Exception $e) {
			error_log("Router exception: " . $e->getMessage());
			$this->response->serverError("Internal routing error");
		}
	}
}