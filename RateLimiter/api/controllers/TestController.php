<?php
/**
 * TestController - Test endpoints for RateLimiter demo
 * Part of RateLimiter PHP API System
 */

declare(strict_types=1);

class TestController extends BaseController {
	/**
	 * Simple test endpoint
	 *
	 * @param array $params URL parameters
	 * @return void
	 */
	public function simple(array $params = []): void {
		$data = [
			'message'    => 'Test endpoint response',
			'timestamp'  => gmdate('Y-m-d\TH:i:s\Z'),
			'request_id' => $this->response->getRequestId(),
			'method'     => $this->method,
			'endpoint'   => $this->endpoint,
			'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
			'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
		];

		$meta = [
			'endpoint_type' => 'test',
			'requires_auth' => false
		];

		$this->response->success($data, $meta);
	}

	/**
	 * Test endpoint with configurable delay
	 *
	 * @param array $params URL parameters
	 * @return void
	 */
	public function delay(array $params = []): void {
		$delaySeconds = max(0, min(10, (float) ($this->request['delay'] ?? 1)));
		$startTime = microtime(true);

		// Simulate processing time
		usleep((int) ($delaySeconds * 1000000));

		$actualDelay = round(microtime(true) - $startTime, 3);

		$data = [
			'message'         => 'Delayed response completed',
			'requested_delay' => $delaySeconds,
			'actual_delay'    => $actualDelay,
			'timestamp'       => gmdate('Y-m-d\TH:i:s\Z'),
			'processing_info' => [
				'start_time'  => gmdate('Y-m-d\TH:i:s.u\Z', $startTime),
				'end_time'    => gmdate('Y-m-d\TH:i:s.u\Z'),
				'server_load' => sys_getloadavg()[0] ?? 'unknown'
			]
		];

		$meta = [
			'endpoint_type'        => 'test_delay',
			'simulated_processing' => true,
			'delay_range'          => '0-10 seconds'
		];

		$this->response->success($data, $meta);
	}

	/**
	 * Test endpoint that generates errors
	 *
	 * @param array $params URL parameters
	 * @return void
	 */
	public function error(array $params = []): void {
		$errorType = $this->request['type'] ?? 'random';
		$errorCode = (int) ($this->request['code'] ?? 0);

		// If specific error code is requested
		if ($errorCode > 0) {
			$this->generateSpecificError($errorCode);
			return;
		}

		// Generate different types of errors
		switch ($errorType) {
			case 'validation':
				$this->response->validationError([
					'test_field'    => ['This is a test validation error'],
					'another_field' => ['Multiple errors can occur', 'Another error message']
				]);
				break;

			case 'auth':
				$this->response->authRequired('Test authentication error');
				break;

			case 'forbidden':
				$this->response->forbidden('Test authorization error');
				break;

			case 'notfound':
				$this->response->notFound('test resource');
				break;

			case 'server':
				$this->response->serverError('Test server error');
				break;

			case 'ratelimit':
				$this->response->rateLimitExceeded(60);
				break;

			case 'random':
			default:
				$this->generateRandomError();
				break;
		}
	}

	/**
	 * Bulk data endpoint for testing high-volume requests
	 *
	 * @param array $params URL parameters
	 * @return void
	 */
	public function bulk(array $params = []): void {
		$count = max(1, min(1000, (int) ($this->request['count'] ?? 100)));
		$includeDetails = filter_var($this->request['details'] ?? false, FILTER_VALIDATE_BOOLEAN);

		$data = [];
		$startTime = microtime(true);

		for ($i = 1; $i <= $count; $i++) {
			$item = [
				'id'           => $i,
				'uuid'         => $this->generateUUID(),
				'timestamp'    => gmdate('Y-m-d\TH:i:s\Z'),
				'random_value' => rand(1, 1000000)
			];

			if ($includeDetails) {
				$item['details'] = [
					'generated_at'  => microtime(true),
					'server_time'   => time(),
					'random_string' => bin2hex(random_bytes(8)),
					'hash'          => hash('sha256', "item_{$i}_" . time())
				];
			}

			$data[] = $item;
		}

		$generationTime = round(microtime(true) - $startTime, 4);

		$meta = [
			'endpoint_type'    => 'test_bulk',
			'generation_time'  => $generationTime,
			'items_per_second' => $generationTime > 0 ? round($count / $generationTime, 2) : 0,
			'memory_usage'     => memory_get_usage(true),
			'peak_memory'      => memory_get_peak_usage(true)
		];

		[$page, $perPage] = ApiResponse::sanitizePagination($this->request);
		$offset = ($page - 1) * $perPage;
		$paginatedData = array_slice($data, $offset, $perPage);

		$this->paginatedResponse($paginatedData, $count, $meta);
	}

	/**
	 * Analytics test endpoint
	 *
	 * @param array $params URL parameters
	 * @return void
	 */
	public function analytics(array $params = []): void {
		$timeRange = $this->request['range'] ?? '1h';
		$metrics = explode(',', $this->request['metrics'] ?? 'requests,errors,response_time');

		$data = [
			'time_range' => $timeRange,
			'metrics'    => [],
			'summary'    => []
		];

		// Generate fake analytics data
		foreach ($metrics as $metric) {
			$data['metrics'][trim($metric)] = $this->generateMetricData($metric, $timeRange);
		}

		// Generate summary
		$data['summary'] = [
			'total_requests'    => array_sum(array_column($data['metrics']['requests'] ?? [], 'value')),
			'total_errors'      => array_sum(array_column($data['metrics']['errors'] ?? [], 'value')),
			'avg_response_time' => $this->calculateAverage($data['metrics']['response_time'] ?? []),
			'success_rate'      => $this->calculateSuccessRate($data['metrics'])
		];

		$meta = [
			'endpoint_type'     => 'test_analytics',
			'generated_data'    => true,
			'available_metrics' => ['requests', 'errors', 'response_time', 'users', 'bandwidth'],
			'time_ranges'       => ['1h', '6h', '24h', '7d', '30d']
		];

		$this->response->success($data, $meta);
	}

	/**
	 * Status endpoint for health checks
	 *
	 * @param array $params URL parameters
	 * @return void
	 */
	public function status(array $params = []): void {
		$checks = [
			'api'          => $this->checkApiHealth(),
			'database'     => $this->checkDatabaseHealth(),
			'redis'        => $this->checkRedisHealth(),
			'rate_limiter' => $this->checkRateLimiterHealth()
		];

		$overallStatus = $this->determineOverallStatus($checks);

		$data = [
			'status'      => $overallStatus,
			'timestamp'   => gmdate('Y-m-d\TH:i:s\Z'),
			'checks'      => $checks,
			'system_info' => [
				'php_version'  => phpversion(),
				'memory_usage' => memory_get_usage(true),
				'memory_limit' => ini_get('memory_limit'),
				'uptime'       => $this->getSystemUptime(),
				'load_average' => sys_getloadavg()
			]
		];

		$statusCode = $overallStatus === 'healthy' ? 200 : 503;
		$this->response->success($data, ['health_check' => true], null, $statusCode);
	}

	/**
	 * Rate limit info endpoint
	 *
	 * @param array $params URL parameters
	 * @return void
	 */
	public function rateLimitInfo(array $params = []): void {
		$identifier = $this->getRateLimitIdentifier();
		$tier = $this->getUserTier();

		$stats = $this->rateLimiter->getStats($identifier, $this->endpoint);
		$timeUntilReset = $this->rateLimiter->getTimeUntilReset($identifier, $this->endpoint);

		$data = [
			'identifier'       => $identifier,
			'tier'             => $tier,
			'current_limits'   => $this->getCurrentLimits($tier),
			'statistics'       => $stats,
			'time_until_reset' => $timeUntilReset,
			'is_blacklisted'   => $this->rateLimiter->isBlacklisted($identifier)
		];

		$meta = [
			'endpoint_type' => 'rate_limit_info',
			'real_data'     => true
		];

		$this->response->success($data, $meta);
	}

	// Helper methods

	/**
	 * Generate specific error based on HTTP status code
	 *
	 * @param int $code HTTP status code
	 * @return void
	 */
	private function generateSpecificError(int $code): void {
		switch ($code) {
			case 400:
				$this->response->error('BAD_REQUEST', 'Bad request', 'Test bad request error', 400);
				break;
			case 401:
				$this->response->authRequired('Test unauthorized error');
				break;
			case 403:
				$this->response->forbidden('Test forbidden error');
				break;
			case 404:
				$this->response->notFound('test resource');
				break;
			case 422:
				$this->response->validationError(['field' => ['Test validation error']]);
				break;
			case 429:
				$this->response->rateLimitExceeded(60);
				break;
			case 500:
				$this->response->serverError('Test internal server error');
				break;
			case 503:
				$this->response->maintenanceMode(3600);
				break;
			default:
				$this->response->error('CUSTOM_ERROR', 'Custom test error', "Test error with code {$code}", $code);
		}
	}

	/**
	 * Generate random error for testing
	 *
	 * @return void
	 */
	private function generateRandomError(): void {
		$errors = [
			fn() => $this->response->validationError(['random_field' => ['Random validation error']]),
			fn() => $this->response->authRequired('Random authentication error'),
			fn() => $this->response->forbidden('Random authorization error'),
			fn() => $this->response->notFound('random resource'),
			fn() => $this->response->serverError('Random server error')
		];

		$randomError = $errors[array_rand($errors)];
		$randomError();
	}

	/**
	 * Generate UUID
	 *
	 * @return string UUID
	 */
	private function generateUUID(): string {
		return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
			mt_rand(0, 0xffff), mt_rand(0, 0xffff),
			mt_rand(0, 0xffff),
			mt_rand(0, 0x0fff) | 0x4000,
			mt_rand(0, 0x3fff) | 0x8000,
			mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
		);
	}

	/**
	 * Generate fake metric data
	 *
	 * @param string $metric Metric name
	 * @param string $timeRange Time range
	 * @return array Metric data points
	 */
	private function generateMetricData(string $metric, string $timeRange): array {
		$points = $this->getDataPointsForRange($timeRange);
		$data = [];

		for ($i = 0; $i < $points; $i++) {
			$timestamp = time() - ($points - $i) * $this->getIntervalForRange($timeRange);

			$value = match ($metric) {
				'requests'      => rand(50, 200),
				'errors'        => rand(0, 20),
				'response_time' => rand(100, 2000),
				'users'         => rand(10, 100),
				'bandwidth'     => rand(1000, 50000),
				default         => rand(1, 100)
			};

			$data[] = [
				'timestamp'      => $timestamp,
				'value'          => $value,
				'formatted_time' => gmdate('Y-m-d H:i:s', $timestamp)
			];
		}

		return $data;
	}

	/**
	 * Get number of data points for time range
	 *
	 * @param string $range Time range
	 * @return int Number of points
	 */
	private function getDataPointsForRange(string $range): int {
		return match ($range) {
			'1h'    => 12,    // 5 minute intervals
			'6h'    => 24,    // 15 minute intervals
			'24h'   => 24,   // 1 hour intervals
			'7d'    => 28,    // 6 hour intervals
			'30d'   => 30,   // 1 day intervals
			default => 12
		};
	}

	/**
	 * Get interval in seconds for time range
	 *
	 * @param string $range Time range
	 * @return int Interval in seconds
	 */
	private function getIntervalForRange(string $range): int {
		return match ($range) {
			'1h'    => 300,     // 5 minutes
			'6h'    => 900,     // 15 minutes
			'24h'   => 3600,   // 1 hour
			'7d'    => 21600,   // 6 hours
			'30d'   => 86400,  // 1 day
			default => 300
		};
	}

	/**
	 * Calculate average from metric data
	 *
	 * @param array $data Metric data
	 * @return float Average value
	 */
	private function calculateAverage(array $data): float {
		if (empty($data))
			return 0.0;

		$sum = array_sum(array_column($data, 'value'));
		return round($sum / count($data), 2);
	}

	/**
	 * Calculate success rate from metrics
	 *
	 * @param array $metrics All metrics data
	 * @return float Success rate percentage
	 */
	private function calculateSuccessRate(array $metrics): float {
		$requests = array_sum(array_column($metrics['requests'] ?? [], 'value'));
		$errors = array_sum(array_column($metrics['errors'] ?? [], 'value'));

		if ($requests === 0)
			return 100.0;

		return round((($requests - $errors) / $requests) * 100, 2);
	}

	/**
	 * Check API health
	 *
	 * @return array Health status
	 */
	private function checkApiHealth(): array {
		return [
			'status'        => 'healthy',
			'response_time' => $this->response->getExecutionTime(),
			'memory_usage'  => memory_get_usage(true)
		];
	}

	/**
	 * Check database health
	 *
	 * @return array Health status
	 */
	private function checkDatabaseHealth(): array {
		try {
			$database = new PDO(
				"mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset=utf8mb4",
				$_ENV['DB_USER'],
				$_ENV['DB_PASS']
			);

			$start = microtime(true);
			$database->query("SELECT 1");
			$responseTime = round(microtime(true) - $start, 4);

			return [
				'status'        => 'healthy',
				'response_time' => $responseTime,
				'connection'    => 'active'
			];
		} catch (Exception $e) {
			return [
				'status'     => 'unhealthy',
				'error'      => $e->getMessage(),
				'connection' => 'failed'
			];
		}
	}

	/**
	 * Check Redis health
	 *
	 * @return array Health status
	 */
	private function checkRedisHealth(): array {
		try {
			$redis = new Redis();
			$redis->connect($_ENV['REDIS_HOST'] ?? 'localhost', (int) ($_ENV['REDIS_PORT'] ?? 6379));

			$start = microtime(true);
			$redis->ping();
			$responseTime = round(microtime(true) - $start, 4);

			return [
				'status'        => 'healthy',
				'response_time' => $responseTime,
				'connection'    => 'active'
			];
		} catch (Exception $e) {
			return [
				'status'     => 'unhealthy',
				'error'      => $e->getMessage(),
				'connection' => 'failed'
			];
		}
	}

	/**
	 * Check rate limiter health
	 *
	 * @return array Health status
	 */
	private function checkRateLimiterHealth(): array {
		try {
			$testIdentifier = 'health_check_' . time();
			$result = $this->rateLimiter->checkLimit($testIdentifier, 'health_check', 'basic');

			return [
				'status'       => 'healthy',
				'storage_type' => $this->rateLimiter->config['storage'] ?? 'unknown',
				'test_result'  => $result['allowed'] ? 'passed' : 'limited'
			];
		} catch (Exception $e) {
			return [
				'status' => 'unhealthy',
				'error'  => $e->getMessage()
			];
		}
	}

	/**
	 * Determine overall system status
	 *
	 * @param array $checks Individual health checks
	 * @return string Overall status
	 */
	private function determineOverallStatus(array $checks): string {
		foreach ($checks as $check) {
			if ($check['status'] !== 'healthy') {
				return 'unhealthy';
			}
		}
		return 'healthy';
	}

	/**
	 * Get system uptime
	 *
	 * @return string Uptime information
	 */
	private function getSystemUptime(): string {
		if (file_exists('/proc/uptime')) {
			$uptime = file_get_contents('/proc/uptime');
			$seconds = (int) explode(' ', $uptime)[0];
			return gmdate('H:i:s', $seconds);
		}
		return 'unknown';
	}

	/**
	 * Get current rate limits for tier
	 *
	 * @param string $tier User tier
	 * @return array Current limits
	 */
	private function getCurrentLimits(string $tier): array {
		$tiers = [
			'basic'      => ['hourly' => 100, 'minute' => 10, 'burst' => 5],
			'premium'    => ['hourly' => 1000, 'minute' => 50, 'burst' => 20],
			'enterprise' => ['hourly' => 10000, 'minute' => 200, 'burst' => 100]
		];

		return $tiers[$tier] ?? $tiers['basic'];
	}

	// BaseController abstract methods implementation

	/**
	 * Test endpoints don't require authentication
	 *
	 * @return bool
	 */
	protected function requiresAuthentication(): bool {
		return false;
	}

	/**
	 * Test endpoints don't require authorization
	 *
	 * @return bool
	 */
	protected function requiresAuthorization(): bool {
		return false;
	}

	/**
	 * All users are authorized for test endpoints
	 *
	 * @return bool
	 */
	protected function isAuthorized(): bool {
		return true;
	}

	/**
	 * Get validation rules for test endpoints
	 *
	 * @return array Validation rules
	 */
	protected function getValidationRules(): array {
		return match ($this->endpoint) {
			'/api/test/delay' => [
				'delay' => 'numeric|min:0|max:10'
			],
			'/api/test/bulk'  => [
				'count'    => 'integer|min:1|max:1000',
				'details'  => 'boolean'
			],
			'/api/test/error' => [
				'type' => 'string|in:validation,auth,forbidden,notfound,server,ratelimit,random',
				'code' => 'integer|min:100|max:599'
			],
			default           => []
		};
	}
}