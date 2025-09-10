<?php
/**
 * RateLimiter - Server-side rate limiting implementation
 * Part of RateLimiter PHP API System
 */

declare(strict_types=1);

class RateLimiter {
	private string $storage;
	public array   $config;
	//private ?Redis $redis;
	private      $redis;
	private ?PDO $database;

	/**
	 * Rate limit tiers configuration
	 */
	private const TIERS = [
		'basic'      => [
			'requests_per_hour'   => 100,
			'requests_per_minute' => 10,
			'burst_limit'         => 5
		],
		'premium'    => [
			'requests_per_hour'   => 1000,
			'requests_per_minute' => 50,
			'burst_limit'         => 20
		],
		'enterprise' => [
			'requests_per_hour'   => 10000,
			'requests_per_minute' => 200,
			'burst_limit'         => 100
		]
	];

	/**
	 * Constructor
	 *
	 * @param array $config Rate limiter configuration
	 */
	public function __construct(array $config = []) {
		$this->config = array_merge([
			'storage'        => $_ENV['RATE_LIMIT_STORAGE'] ?? 'redis',
			'enabled'        => $_ENV['RATE_LIMIT_ENABLED'] ?? true,
			'default_limit'  => (int) ($_ENV['DEFAULT_RATE_LIMIT'] ?? 100),
			'default_window' => (int) ($_ENV['DEFAULT_WINDOW'] ?? 3600),
			'redis_host'     => $_ENV['REDIS_HOST'] ?? 'localhost',
			'redis_port'     => (int) ($_ENV['REDIS_PORT'] ?? 6379),
			'redis_db'       => (int) ($_ENV['REDIS_DB'] ?? 0),
		], $config);

		$this->storage = $this->config['storage'];
		$this->redis = null;
		$this->database = null;

		$this->initializeStorage();
	}

	/**
	 * Check if request is allowed
	 *
	 * @param string $identifier Unique identifier (user ID, IP, etc.)
	 * @param string $endpoint API endpoint
	 * @param string $tier User tier (basic, premium, enterprise)
	 * @return array Rate limit result
	 */
	public function checkLimit(
		string $identifier,
		string $endpoint = 'default',
		string $tier = 'basic'
	): array {
		if (!$this->config['enabled']) {
			return $this->createResult(true, PHP_INT_MAX, PHP_INT_MAX, time() + 3600);
		}

		$limits = $this->getLimitsForTier($tier);

		// Check multiple windows
		$hourlyResult = $this->checkWindow($identifier, $endpoint, 3600, $limits['requests_per_hour'], 'hourly');
		$minuteResult = $this->checkWindow($identifier, $endpoint, 60, $limits['requests_per_minute'], 'minute');
		$burstResult = $this->checkWindow($identifier, $endpoint, 10, $limits['burst_limit'], 'burst');

		// Return the most restrictive result
		$results = [$hourlyResult, $minuteResult, $burstResult];

		foreach ($results as $result) {
			if (!$result['allowed']) {
				return $result;
			}
		}

		// All checks passed, increment counters
		$this->incrementCounters($identifier, $endpoint);

		// Return the most restrictive remaining count
		$minRemaining = min(
			$hourlyResult['remaining'],
			$minuteResult['remaining'],
			$burstResult['remaining']
		);

		return $this->createResult(true, $limits['requests_per_hour'], $minRemaining, $hourlyResult['reset_time']);
	}

	/**
	 * Record a request
	 *
	 * @param string $identifier Unique identifier
	 * @param string $endpoint API endpoint
	 * @param bool $success Whether the request was successful
	 * @return void
	 */
	public function recordRequest(string $identifier, string $endpoint, bool $success = true): void {
		if (!$this->config['enabled']) {
			return;
		}

		$key = $this->getKey($identifier, $endpoint, 'stats');
		$data = [
			'total_requests'      => 1,
			'successful_requests' => $success ? 1 : 0,
			'failed_requests'     => $success ? 0 : 1,
			'last_request'        => time()
		];

		$this->updateStats($key, $data);
	}

	/**
	 * Get rate limit statistics
	 *
	 * @param string $identifier Unique identifier
	 * @param string $endpoint API endpoint
	 * @return array Statistics
	 */
	public function getStats(string $identifier, string $endpoint = 'default'): array {
		$key = $this->getKey($identifier, $endpoint, 'stats');
		$stats = $this->getStatsData($key);

		return [
			'total_requests'      => $stats['total_requests'] ?? 0,
			'successful_requests' => $stats['successful_requests'] ?? 0,
			'failed_requests'     => $stats['failed_requests'] ?? 0,
			'success_rate'        => $this->calculateSuccessRate($stats),
			'last_request'        => $stats['last_request'] ?? null,
			'first_request'       => $stats['first_request'] ?? null
		];
	}

	/**
	 * Reset rate limits for identifier
	 *
	 * @param string $identifier Unique identifier
	 * @param string|null $endpoint Specific endpoint or null for all
	 * @return bool Success status
	 */
	public function resetLimits(string $identifier, ?string $endpoint = null): bool {
		try {
			if ($endpoint === null) {
				// Reset all endpoints for this identifier
				$pattern = $this->getKey($identifier, '*', '*');
			} else {
				// Reset specific endpoint
				$pattern = $this->getKey($identifier, $endpoint, '*');
			}

			return $this->clearKeys($pattern);
		} catch (Exception $e) {
			error_log("Rate limiter reset error: " . $e->getMessage());
			return false;
		}
	}

	/**
	 * Get remaining time until reset
	 *
	 * @param string $identifier Unique identifier
	 * @param string $endpoint API endpoint
	 * @return int Seconds until reset
	 */
	public function getTimeUntilReset(string $identifier, string $endpoint = 'default'): int {
		$key = $this->getKey($identifier, $endpoint, 'hourly');
		$ttl = $this->getTTL($key);

		return max(0, $ttl);
	}

	/**
	 * Check if identifier is blacklisted
	 *
	 * @param string $identifier Unique identifier
	 * @return bool Blacklist status
	 */
	public function isBlacklisted(string $identifier): bool {
		$key = "blacklist:{$identifier}";
		return $this->exists($key);
	}

	/**
	 * Add identifier to blacklist
	 *
	 * @param string $identifier Unique identifier
	 * @param int $duration Duration in seconds (0 = permanent)
	 * @param string $reason Blacklist reason
	 * @return bool Success status
	 */
	public function blacklist(string $identifier, int $duration = 0, string $reason = ''): bool {
		$key = "blacklist:{$identifier}";
		$data = [
			'reason'     => $reason,
			'created_at' => time(),
			'expires_at' => $duration > 0 ? time() + $duration : 0
		];

		return $this->setWithExpiry($key, json_encode($data), $duration);
	}

	/**
	 * Remove identifier from blacklist
	 *
	 * @param string $identifier Unique identifier
	 * @return bool Success status
	 */
	public function removeFromBlacklist(string $identifier): bool {
		$key = "blacklist:{$identifier}";
		return $this->delete($key);
	}

	/**
	 * Initialize storage backend
	 *
	 * @return void
	 */
	private function initializeStorage(): void {
		switch ($this->storage) {
			case 'redis':
				$this->initializeRedis();
				break;
			case 'database':
				$this->initializeDatabase();
				break;
			case 'memory':
				// Memory storage uses static variables
				break;
			default:
				throw new InvalidArgumentException("Unsupported storage type: {$this->storage}");
		}
	}

	/**
	 * Initialize Redis connection
	 *
	 * @return void
	 */
	private function initializeRedis(): void {
		try {
			$this->redis = new Redis();
			$this->redis->connect($this->config['redis_host'], $this->config['redis_port']);
			$this->redis->select($this->config['redis_db']);
		} catch (Exception $e) {
			error_log("Redis connection failed: " . $e->getMessage());
			// Fallback to memory storage
			$this->storage = 'memory';
		}
	}

	/**
	 * Initialize database connection
	 *
	 * @return void
	 */
	private function initializeDatabase(): void {
		try {
			$dsn = "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset=utf8mb4";
			$this->database = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], [
				PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
				PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
				PDO::ATTR_EMULATE_PREPARES   => false
			]);
		} catch (Exception $e) {
			error_log("Database connection failed: " . $e->getMessage());
			// Fallback to memory storage
			$this->storage = 'memory';
		}
	}

	/**
	 * Check rate limit for specific window
	 *
	 * @param string $identifier Unique identifier
	 * @param string $endpoint API endpoint
	 * @param int $window Window size in seconds
	 * @param int $limit Request limit
	 * @param string $type Window type (hourly, minute, burst)
	 * @return array Rate limit result
	 */
	private function checkWindow(
		string $identifier,
		string $endpoint,
		int $window,
		int $limit,
		string $type
	): array {
		$key = $this->getKey($identifier, $endpoint, $type);
		$current = $this->getCurrentCount($key);
		$resetTime = $this->getResetTime($key, $window);

		// Check if window has expired and reset
		if ($resetTime <= time()) {
			$current = 0;
			$resetTime = time() + $window;
		}

		$remaining = max(0, $limit - $current);
		$allowed = $current < $limit;

		return $this->createResult($allowed, $limit, $remaining, $resetTime);
	}

	/**
	 * Increment request counters
	 *
	 * @param string $identifier Unique identifier
	 * @param string $endpoint API endpoint
	 * @return void
	 */
	private function incrementCounters(string $identifier, string $endpoint): void {
		$windows = [
			'hourly' => 3600,
			'minute' => 60,
			'burst'  => 10
		];

		foreach ($windows as $type => $duration) {
			$key = $this->getKey($identifier, $endpoint, $type);
			$this->increment($key, $duration);
		}
	}

	/**
	 * Get rate limits for user tier
	 *
	 * @param string $tier User tier
	 * @return array Rate limits
	 */
	private function getLimitsForTier(string $tier): array {
		return self::TIERS[$tier] ?? self::TIERS['basic'];
	}

	/**
	 * Create rate limit result array
	 *
	 * @param bool $allowed Whether request is allowed
	 * @param int $limit Request limit
	 * @param int $remaining Remaining requests
	 * @param int $resetTime Reset timestamp
	 * @return array
	 */
	private function createResult(bool $allowed, int $limit, int $remaining, int $resetTime): array {
		return [
			'allowed'     => $allowed,
			'limit'       => $limit,
			'remaining'   => $remaining,
			'reset_time'  => $resetTime,
			'retry_after' => $allowed ? 0 : $resetTime - time()
		];
	}

	/**
	 * Generate storage key
	 *
	 * @param string $identifier Unique identifier
	 * @param string $endpoint API endpoint
	 * @param string $type Key type
	 * @return string
	 */
	private function getKey(string $identifier, string $endpoint, string $type): string {
		return "rate_limit:{$identifier}:{$endpoint}:{$type}";
	}

	/**
	 * Calculate success rate
	 *
	 * @param array $stats Statistics data
	 * @return float Success rate percentage
	 */
	private function calculateSuccessRate(array $stats): float {
		$total = ($stats['total_requests'] ?? 0);
		$successful = ($stats['successful_requests'] ?? 0);

		return $total > 0 ? round(($successful / $total) * 100, 2) : 100.0;
	}

	// Storage abstraction methods

	/**
	 * Get current count for key
	 *
	 * @param string $key Storage key
	 * @return int Current count
	 */
	private function getCurrentCount(string $key): int {
		switch ($this->storage) {
			case 'redis':
				return (int) $this->redis->get($key) ?: 0;

			case 'database':
				return $this->getDatabaseCount($key);

			case 'memory':
			default:
				return $_SESSION['rate_limits'][$key] ?? 0;
		}
	}

	/**
	 * Get reset time for key
	 *
	 * @param string $key Storage key
	 * @param int $window Window duration
	 * @return int Reset timestamp
	 */
	private function getResetTime(string $key, int $window): int {
		switch ($this->storage) {
			case 'redis':
				$ttl = $this->redis->ttl($key);
				return $ttl > 0 ? time() + $ttl : time() + $window;

			case 'database':
				return $this->getDatabaseResetTime($key, $window);

			case 'memory':
			default:
				return $_SESSION['rate_limit_resets'][$key] ?? time() + $window;
		}
	}

	/**
	 * Increment counter
	 *
	 * @param string $key Storage key
	 * @param int $expiry Expiry time in seconds
	 * @return void
	 */
	private function increment(string $key, int $expiry): void {
		switch ($this->storage) {
			case 'redis':
				$this->redis->multi();
				$this->redis->incr($key);
				$this->redis->expire($key, $expiry);
				$this->redis->exec();
				break;

			case 'database':
				$this->incrementDatabase($key, $expiry);
				break;

			case 'memory':
			default:
				if (!isset($_SESSION['rate_limits'])) {
					$_SESSION['rate_limits'] = [];
					$_SESSION['rate_limit_resets'] = [];
				}
				$_SESSION['rate_limits'][$key] = ($_SESSION['rate_limits'][$key] ?? 0) + 1;
				$_SESSION['rate_limit_resets'][$key] = time() + $expiry;
				break;
		}
	}

	/**
	 * Update statistics
	 *
	 * @param string $key Storage key
	 * @param array $data Statistics data
	 * @return void
	 */
	private function updateStats(string $key, array $data): void {
		switch ($this->storage) {
			case 'redis':
				$existing = json_decode($this->redis->get($key) ?: '{}', true);
				foreach ($data as $field => $value) {
					if ($field === 'first_request' && !isset($existing[$field])) {
						$existing[$field] = time();
					} else {
						$existing[$field] = ($existing[$field] ?? 0) + $value;
					}
				}
				$this->redis->setex($key, 86400 * 7, json_encode($existing)); // 7 days
				break;

			case 'database':
				$this->updateDatabaseStats($key, $data);
				break;

			case 'memory':
			default:
				if (!isset($_SESSION['rate_limit_stats'])) {
					$_SESSION['rate_limit_stats'] = [];
				}
				$existing = $_SESSION['rate_limit_stats'][$key] ?? [];
				foreach ($data as $field => $value) {
					if ($field === 'first_request' && !isset($existing[$field])) {
						$existing[$field] = time();
					} else {
						$existing[$field] = ($existing[$field] ?? 0) + $value;
					}
				}
				$_SESSION['rate_limit_stats'][$key] = $existing;
				break;
		}
	}

	/**
	 * Get statistics data
	 *
	 * @param string $key Storage key
	 * @return array Statistics
	 */
	private function getStatsData(string $key): array {
		switch ($this->storage) {
			case 'redis':
				return json_decode($this->redis->get($key) ?: '{}', true);

			case 'database':
				return $this->getDatabaseStats($key);

			case 'memory':
			default:
				return $_SESSION['rate_limit_stats'][$key] ?? [];
		}
	}

	/**
	 * Check if key exists
	 *
	 * @param string $key Storage key
	 * @return bool Existence status
	 */
	private function exists(string $key): bool {
		switch ($this->storage) {
			case 'redis':
				return (bool) $this->redis->exists($key);

			case 'database':
				return $this->databaseKeyExists($key);

			case 'memory':
			default:
				return isset($_SESSION['rate_limits'][$key]);
		}
	}

	/**
	 * Set value with expiry
	 *
	 * @param string $key Storage key
	 * @param string $value Value to set
	 * @param int $expiry Expiry time in seconds
	 * @return bool Success status
	 */
	private function setWithExpiry(string $key, string $value, int $expiry): bool {
		switch ($this->storage) {
			case 'redis':
				return $expiry > 0
					? $this->redis->setex($key, $expiry, $value)
					: $this->redis->set($key, $value);

			case 'database':
				return $this->setDatabaseValue($key, $value, $expiry);

			case 'memory':
			default:
				if (!isset($_SESSION['blacklist'])) {
					$_SESSION['blacklist'] = [];
				}
				$_SESSION['blacklist'][$key] = [
					'value'   => $value,
					'expires' => $expiry > 0 ? time() + $expiry : 0
				];
				return true;
		}
	}

	/**
	 * Delete key
	 *
	 * @param string $key Storage key
	 * @return bool Success status
	 */
	private function delete(string $key): bool {
		switch ($this->storage) {
			case 'redis':
				return (bool) $this->redis->del($key);

			case 'database':
				return $this->deleteDatabaseKey($key);

			case 'memory':
			default:
				unset($_SESSION['blacklist'][$key]);
				return true;
		}
	}

	/**
	 * Clear keys matching pattern
	 *
	 * @param string $pattern Key pattern
	 * @return bool Success status
	 */
	private function clearKeys(string $pattern): bool {
		switch ($this->storage) {
			case 'redis':
				$keys = $this->redis->keys($pattern);
				return $keys ? (bool) $this->redis->del(...$keys) : true;

			case 'database':
				return $this->clearDatabaseKeys($pattern);

			case 'memory':
			default:
				if (isset($_SESSION['rate_limits'])) {
					$pattern = str_replace('*', '.*', preg_quote($pattern, '/'));
					foreach ($_SESSION['rate_limits'] as $key => $value) {
						if (preg_match("/^{$pattern}$/", $key)) {
							unset($_SESSION['rate_limits'][$key]);
							unset($_SESSION['rate_limit_resets'][$key]);
						}
					}
				}
				return true;
		}
	}

	/**
	 * Get TTL for key
	 *
	 * @param string $key Storage key
	 * @return int TTL in seconds
	 */
	private function getTTL(string $key): int {
		switch ($this->storage) {
			case 'redis':
				return $this->redis->ttl($key);

			case 'database':
				return $this->getDatabaseTTL($key);

			case 'memory':
			default:
				$reset = $_SESSION['rate_limit_resets'][$key] ?? time();
				return max(0, $reset - time());
		}
	}

	// Database-specific methods

	/**
	 * Get count from database
	 *
	 * @param string $key Storage key
	 * @return int Count value
	 */
	private function getDatabaseCount(string $key): int {
		$stmt = $this->database->prepare(
			"SELECT requests FROM rate_limits WHERE identifier = ? AND window_start > ?"
		);
		$stmt->execute([$key, date('Y-m-d H:i:s', time() - 3600)]);

		return (int) ($stmt->fetchColumn() ?: 0);
	}

	/**
	 * Get reset time from database
	 *
	 * @param string $key Storage key
	 * @param int $window Window duration
	 * @return int Reset timestamp
	 */
	private function getDatabaseResetTime(string $key, int $window): int {
		$stmt = $this->database->prepare(
			"SELECT UNIX_TIMESTAMP(window_start) + window_size FROM rate_limits WHERE identifier = ?"
		);
		$stmt->execute([$key]);

		return (int) ($stmt->fetchColumn() ?: time() + $window);
	}

	/**
	 * Increment database counter
	 *
	 * @param string $key Storage key
	 * @param int $expiry Expiry time
	 * @return void
	 */
	private function incrementDatabase(string $key, int $expiry): void {
		$this->database->prepare(
			"INSERT INTO rate_limits (identifier, requests, window_start, window_size)
			 VALUES (?, 1, NOW(), ?)
			 ON DUPLICATE KEY UPDATE requests = requests + 1"
		)->execute([$key, $expiry]);
	}

	/**
	 * Additional database methods would go here...
	 * (getDatabaseStats, updateDatabaseStats, etc.)
	 */
}