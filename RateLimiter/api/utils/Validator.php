<?php
/**
 * Validator - Input validation utility
 * Part of RateLimiter PHP API System
 */

declare(strict_types=1);

class Validator {
	private array $data;
	private array $rules;
	private array $errors;

	/**
	 * Constructor
	 *
	 * @param array $data Data to validate
	 * @param array $rules Validation rules
	 */
	public function __construct(array $data, array $rules) {
		$this->data = $data;
		$this->rules = $rules;
		$this->errors = [];
	}

	/**
	 * Perform validation
	 *
	 * @return bool Validation result
	 */
	public function validate(): bool {
		foreach ($this->rules as $field => $rule) {
			$this->validateField($field, $rule);
		}

		return empty($this->errors);
	}

	/**
	 * Get validation errors
	 *
	 * @return array Validation errors
	 */
	public function getErrors(): array {
		return $this->errors;
	}

	/**
	 * Validate a single field
	 *
	 * @param string $field Field name
	 * @param string $rule Validation rule
	 * @return void
	 */
	private function validateField(string $field, string $rule): void {
		$value = $this->data[$field] ?? null;
		$rules = explode('|', $rule);

		foreach ($rules as $singleRule) {
			if (!$this->applyRule($field, $value, $singleRule)) {
				break; // Stop validation on first failure
			}
		}
	}

	/**
	 * Apply a single validation rule
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @param string $rule Validation rule
	 * @return bool Validation result
	 */
	private function applyRule(string $field, mixed $value, string $rule): bool {
		[$ruleName, $parameter] = $this->parseRule($rule);

		switch ($ruleName) {
			case 'required':
				return $this->validateRequired($field, $value);

			case 'string':
				return $this->validateString($field, $value);

			case 'integer':
				return $this->validateInteger($field, $value);

			case 'numeric':
				return $this->validateNumeric($field, $value);

			case 'boolean':
				return $this->validateBoolean($field, $value);

			case 'email':
				return $this->validateEmail($field, $value);

			case 'url':
				return $this->validateUrl($field, $value);

			case 'min':
				return $this->validateMin($field, $value, $parameter);

			case 'max':
				return $this->validateMax($field, $value, $parameter);

			case 'in':
				return $this->validateIn($field, $value, $parameter);

			case 'regex':
				return $this->validateRegex($field, $value, $parameter);

			case 'date':
				return $this->validateDate($field, $value);

			case 'array':
				return $this->validateArray($field, $value);

			default:
				return true; // Unknown rule, skip
		}
	}

	/**
	 * Parse validation rule
	 *
	 * @param string $rule Rule string
	 * @return array [rule_name, parameter]
	 */
	private function parseRule(string $rule): array {
		if (strpos($rule, ':') !== false) {
			return explode(':', $rule, 2);
		}
		return [$rule, null];
	}

	/**
	 * Add validation error
	 *
	 * @param string $field Field name
	 * @param string $message Error message
	 * @return void
	 */
	private function addError(string $field, string $message): void {
		if (!isset($this->errors[$field])) {
			$this->errors[$field] = [];
		}
		$this->errors[$field][] = $message;
	}

	// Validation rule methods

	/**
	 * Validate required field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateRequired(string $field, mixed $value): bool {
		if ($value === null || $value === '' || (is_array($value) && empty($value))) {
			$this->addError($field, "The {$field} field is required");
			return false;
		}
		return true;
	}

	/**
	 * Validate string field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateString(string $field, mixed $value): bool {
		if ($value !== null && !is_string($value)) {
			$this->addError($field, "The {$field} field must be a string");
			return false;
		}
		return true;
	}

	/**
	 * Validate integer field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateInteger(string $field, mixed $value): bool {
		if ($value !== null && !filter_var($value, FILTER_VALIDATE_INT)) {
			$this->addError($field, "The {$field} field must be an integer");
			return false;
		}
		return true;
	}

	/**
	 * Validate numeric field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateNumeric(string $field, mixed $value): bool {
		if ($value !== null && !is_numeric($value)) {
			$this->addError($field, "The {$field} field must be numeric");
			return false;
		}
		return true;
	}

	/**
	 * Validate boolean field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateBoolean(string $field, mixed $value): bool {
		if ($value !== null && !is_bool($value) && !in_array($value, ['0', '1', 'true', 'false'], true)) {
			$this->addError($field, "The {$field} field must be a boolean");
			return false;
		}
		return true;
	}

	/**
	 * Validate email field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateEmail(string $field, mixed $value): bool {
		if ($value !== null && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
			$this->addError($field, "The {$field} field must be a valid email address");
			return false;
		}
		return true;
	}

	/**
	 * Validate URL field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateUrl(string $field, mixed $value): bool {
		if ($value !== null && !filter_var($value, FILTER_VALIDATE_URL)) {
			$this->addError($field, "The {$field} field must be a valid URL");
			return false;
		}
		return true;
	}

	/**
	 * Validate minimum value/length
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @param string|null $parameter Minimum value
	 * @return bool Validation result
	 */
	private function validateMin(string $field, mixed $value, ?string $parameter): bool {
		if ($value === null || $parameter === null) {
			return true;
		}

		$min = (float) $parameter;

		if (is_string($value)) {
			$length = strlen($value);
			if ($length < $min) {
				$this->addError($field, "The {$field} field must be at least {$min} characters");
				return false;
			}
		} elseif (is_numeric($value)) {
			if ((float) $value < $min) {
				$this->addError($field, "The {$field} field must be at least {$min}");
				return false;
			}
		} elseif (is_array($value)) {
			if (count($value) < $min) {
				$this->addError($field, "The {$field} field must have at least {$min} items");
				return false;
			}
		}

		return true;
	}

	/**
	 * Validate maximum value/length
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @param string|null $parameter Maximum value
	 * @return bool Validation result
	 */
	private function validateMax(string $field, mixed $value, ?string $parameter): bool {
		if ($value === null || $parameter === null) {
			return true;
		}

		$max = (float) $parameter;

		if (is_string($value)) {
			$length = strlen($value);
			if ($length > $max) {
				$this->addError($field, "The {$field} field must not exceed {$max} characters");
				return false;
			}
		} elseif (is_numeric($value)) {
			if ((float) $value > $max) {
				$this->addError($field, "The {$field} field must not exceed {$max}");
				return false;
			}
		} elseif (is_array($value)) {
			if (count($value) > $max) {
				$this->addError($field, "The {$field} field must not have more than {$max} items");
				return false;
			}
		}

		return true;
	}

	/**
	 * Validate value is in allowed list
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @param string|null $parameter Comma-separated allowed values
	 * @return bool Validation result
	 */
	private function validateIn(string $field, mixed $value, ?string $parameter): bool {
		if ($value === null || $parameter === null) {
			return true;
		}

		$allowedValues = explode(',', $parameter);
		if (!in_array($value, $allowedValues, true)) {
			$allowedList = implode(', ', $allowedValues);
			$this->addError($field, "The {$field} field must be one of: {$allowedList}");
			return false;
		}

		return true;
	}

	/**
	 * Validate value matches regex pattern
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @param string|null $parameter Regex pattern
	 * @return bool Validation result
	 */
	private function validateRegex(string $field, mixed $value, ?string $parameter): bool {
		if ($value === null || $parameter === null) {
			return true;
		}

		if (!is_string($value) || !preg_match($parameter, $value)) {
			$this->addError($field, "The {$field} field format is invalid");
			return false;
		}

		return true;
	}

	/**
	 * Validate date field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateDate(string $field, mixed $value): bool {
		if ($value === null) {
			return true;
		}

		if (!is_string($value) || !strtotime($value)) {
			$this->addError($field, "The {$field} field must be a valid date");
			return false;
		}

		return true;
	}

	/**
	 * Validate array field
	 *
	 * @param string $field Field name
	 * @param mixed $value Field value
	 * @return bool Validation result
	 */
	private function validateArray(string $field, mixed $value): bool {
		if ($value !== null && !is_array($value)) {
			$this->addError($field, "The {$field} field must be an array");
			return false;
		}
		return true;
	}
}