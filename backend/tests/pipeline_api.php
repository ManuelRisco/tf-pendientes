<?php
declare(strict_types=1);

/**
 * ==============================================================================
 * TECNOFILM ERP - E2E API HTTP INTEGRATION TEST PIPELINE
 * ==============================================================================
 * Starts a test server on port 8088, executes real HTTP requests against
 * all protected & public endpoints, verifies RBAC rules, status codes,
 * and JSON schemas.
 */

require_once __DIR__ . '/../vendor/autoload.php';

spl_autoload_register(function (string $class): void {
    $dirs = [
        __DIR__ . '/../config/',
        __DIR__ . '/../core/',
        __DIR__ . '/../middleware/',
        __DIR__ . '/../models/',
        __DIR__ . '/../controllers/',
        __DIR__ . '/../entities/',
    ];
    foreach ($dirs as $dir) {
        $file = $dir . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

Database::bootEloquent();

final class TermColor {
    public const RESET   = "\033[0m";
    public const RED     = "\033[31m";
    public const GREEN   = "\033[32m";
    public const YELLOW  = "\033[33m";
    public const BLUE    = "\033[34m";
    public const MAGENTA = "\033[35m";
    public const CYAN    = "\033[36m";
    public const BOLD    = "\033[1m";
    public const DIM     = "\033[2m";
}

class ApiPipelineRunner {
    private int $totalTests = 0;
    private int $passedTests = 0;
    private int $failedTests = 0;
    private float $startTime;
    private array $failures = [];
    private string $baseUrl = 'http://127.0.0.1:8088';
    private $serverProcess = null;

    public function __construct() {
        $this->startTime = microtime(true);
    }

    public function startServer(): void {
        // Test if server is already running on port 8088
        $fp = @fsockopen('127.0.0.1', 8088, $errno, $errstr, 0.5);
        if ($fp) {
            fclose($fp);
            return; // Already running
        }

        $cmd = 'php -S 127.0.0.1:8088 index.php';
        $cwd = dirname(__DIR__);
        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $this->serverProcess = proc_open($cmd, $descriptors, $pipes, $cwd);
        // Wait up to 3 seconds for server to be responsive
        $started = false;
        for ($i = 0; $i < 30; $i++) {
            usleep(100000); // 100ms
            $testFp = @fsockopen('127.0.0.1', 8088, $errno, $errstr, 0.2);
            if ($testFp) {
                fclose($testFp);
                $started = true;
                break;
            }
        }

        if (!$started) {
            throw new RuntimeException("Failed to spin up local PHP test server on port 8088.");
        }
    }

    public function stopServer(): void {
        if ($this->serverProcess && is_resource($this->serverProcess)) {
            proc_terminate($this->serverProcess);
            proc_close($this->serverProcess);
            $this->serverProcess = null;
        }
    }

    public function request(string $method, string $path, ?array $body = null, ?string $token = null): array {
        $url = $this->baseUrl . $path;
        $headers = [
            'Accept: application/json',
            'Content-Type: application/json',
        ];
        if ($token) {
            $headers[] = 'Authorization: Bearer ' . $token;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);

        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $responseBody = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($responseBody === false) {
            throw new RuntimeException("CURL request failed to {$url}: {$curlError}");
        }

        $data = json_decode($responseBody, true);

        return [
            'status' => $statusCode,
            'body'   => $data,
            'raw'    => $responseBody,
        ];
    }

    public function header(string $title): void {
        echo PHP_EOL . TermColor::BOLD . TermColor::CYAN . str_repeat('=', 70) . TermColor::RESET . PHP_EOL;
        echo TermColor::BOLD . TermColor::CYAN . "  " . $title . TermColor::RESET . PHP_EOL;
        echo TermColor::BOLD . TermColor::CYAN . str_repeat('=', 70) . TermColor::RESET . PHP_EOL;
    }

    public function stage(int $number, string $title): void {
        echo PHP_EOL . TermColor::BOLD . TermColor::MAGENTA . "[STAGE {$number}] " . $title . TermColor::RESET . PHP_EOL;
        echo TermColor::DIM . str_repeat('-', 70) . TermColor::RESET . PHP_EOL;
    }

    public function assert(string $description, callable $testFn): void {
        $this->totalTests++;
        $start = microtime(true);
        try {
            $result = $testFn();
            $duration = round((microtime(true) - $start) * 1000, 2);
            if ($result === true || $result === null) {
                $this->passedTests++;
                echo "  " . TermColor::GREEN . "✓ PASS" . TermColor::RESET . "  {$description} " . TermColor::DIM . "({$duration}ms)" . TermColor::RESET . PHP_EOL;
            } else {
                $this->failedTests++;
                $errorMsg = is_string($result) ? $result : "Assertion returned false";
                $this->failures[] = "{$description}: {$errorMsg}";
                echo "  " . TermColor::RED . "✗ FAIL" . TermColor::RESET . "  {$description} - {$errorMsg}" . PHP_EOL;
            }
        } catch (Throwable $e) {
            $this->failedTests++;
            $this->failures[] = "{$description}: " . $e->getMessage();
            echo "  " . TermColor::RED . "✗ FAIL" . TermColor::RESET . "  {$description} - " . $e->getMessage() . PHP_EOL;
        }
    }

    public function summary(): bool {
        $totalTime = round(microtime(true) - $this->startTime, 3);
        echo PHP_EOL . TermColor::BOLD . str_repeat('=', 70) . TermColor::RESET . PHP_EOL;
        echo TermColor::BOLD . "  E2E API PIPELINE SUMMARY" . TermColor::RESET . PHP_EOL;
        echo TermColor::BOLD . str_repeat('=', 70) . TermColor::RESET . PHP_EOL;
        echo "  Total Tests:  " . TermColor::BOLD . $this->totalTests . TermColor::RESET . PHP_EOL;
        echo "  Passed:       " . TermColor::GREEN . TermColor::BOLD . $this->passedTests . TermColor::RESET . PHP_EOL;
        echo "  Failed:       " . ($this->failedTests > 0 ? TermColor::RED . TermColor::BOLD : TermColor::RESET) . $this->failedTests . TermColor::RESET . PHP_EOL;
        echo "  Duration:     " . TermColor::CYAN . "{$totalTime}s" . TermColor::RESET . PHP_EOL;

        if ($this->failedTests > 0) {
            echo PHP_EOL . TermColor::RED . TermColor::BOLD . "  Failures:" . TermColor::RESET . PHP_EOL;
            foreach ($this->failures as $i => $fail) {
                echo "    " . ($i + 1) . ". {$fail}" . PHP_EOL;
            }
            echo PHP_EOL . TermColor::RED . TermColor::BOLD . "❌ E2E API PIPELINE FAILED" . TermColor::RESET . PHP_EOL;
            return false;
        }

        echo PHP_EOL . TermColor::GREEN . TermColor::BOLD . "✅ E2E API PIPELINE PASSED SUCCESSFULLY" . TermColor::RESET . PHP_EOL;
        return true;
    }
}

$pipeline = new ApiPipelineRunner();
$pipeline->header("TECNOFILM ERP - E2E API ENDPOINTS PIPELINE");

try {
    $pipeline->startServer();

    // Fetch test users for JWT generation
    $admin = Usuario::where('rol_id', 1)->first();
    $empleado = Usuario::where('rol_id', '!=', 1)->first();

    $adminToken = JwtHelper::generate([
        'id'     => $admin ? $admin->id : 1,
        'email'  => $admin ? $admin->email : 'admin@tecnofilm.com',
        'rol_id' => 1,
    ]);

    $empleadoToken = JwtHelper::generate([
        'id'     => $empleado ? $empleado->id : 2,
        'email'  => $empleado ? $empleado->email : 'empleado@tecnofilm.com',
        'rol_id' => $empleado ? $empleado->rol_id : 2,
    ]);

    // =========================================================================
    // STAGE 1: AUTH & RBAC SECURITY
    // =========================================================================
    $pipeline->stage(1, "Authentication & RBAC Gateways");

    $pipeline->assert("POST /auth/login rejects invalid credentials with 401 Unauthorized", function() use ($pipeline) {
        $res = $pipeline->request('POST', '/auth/login', [
            'email'    => 'nonexistent_test_account@tecnofilm.com',
            'password' => 'WrongPassword!123',
        ]);
        if ($res['status'] !== 401) {
            return "Expected HTTP status 401, got " . $res['status'];
        }
        if (!isset($res['body']['success']) || $res['body']['success'] !== false) {
            return "Expected success: false in JSON payload";
        }
        return true;
    });

    $pipeline->assert("GET /catalogos rejects requests missing Bearer token with 401 Unauthorized", function() use ($pipeline) {
        $res = $pipeline->request('GET', '/catalogos');
        if ($res['status'] !== 401) {
            return "Expected HTTP status 401, got " . $res['status'];
        }
        return true;
    });

    $pipeline->assert("GET /auth/me returns current user identity with valid token", function() use ($pipeline, $adminToken, $admin) {
        $res = $pipeline->request('GET', '/auth/me', null, $adminToken);
        if ($res['status'] !== 200) {
            return "Expected HTTP status 200, got " . $res['status'];
        }
        if (!isset($res['body']['data']['email'])) {
            return "Expected user email in data payload";
        }
        return true;
    });

    // =========================================================================
    // STAGE 2: CORE LOOKUPS & DASHBOARD
    // =========================================================================
    $pipeline->stage(2, "Core Lookups & Dashboard Endpoints");

    $pipeline->assert("GET /catalogos returns roles, estados and prioridades lists", function() use ($pipeline, $adminToken) {
        $res = $pipeline->request('GET', '/catalogos', null, $adminToken);
        if ($res['status'] !== 200) {
            return "Expected HTTP status 200, got " . $res['status'];
        }
        $data = $res['body']['data'] ?? [];
        if (empty($data['roles']) || empty($data['estados']) || empty($data['prioridades'])) {
            return "Missing catalog arrays in response";
        }
        return true;
    });

    $pipeline->assert("GET /dashboard returns metrics, stats and recent activity", function() use ($pipeline, $adminToken) {
        $res = $pipeline->request('GET', '/dashboard', null, $adminToken);
        if ($res['status'] !== 200) {
            return "Expected HTTP status 200, got " . $res['status'];
        }
        $data = $res['body']['data'] ?? [];
        if (!isset($data['total_usuarios']) || !isset($data['estadisticas']) || !isset($data['actividad_reciente'])) {
            return "Dashboard payload missing expected metrics keys";
        }
        return true;
    });

    // =========================================================================
    // STAGE 3: TAREAS (TICKETS) & AUDIT ENDPOINTS
    // =========================================================================
    $pipeline->stage(3, "Tickets & Movements (Bitácora) Endpoints");

    $pipeline->assert("GET /tareas returns paginated ticket items and meta block", function() use ($pipeline, $adminToken) {
        $res = $pipeline->request('GET', '/tareas?limit=5&page=1', null, $adminToken);
        if ($res['status'] !== 200) {
            return "Expected HTTP status 200, got " . $res['status'];
        }
        $data = $res['body']['data'] ?? [];
        if (!isset($data['items']) || !isset($data['meta']['totalPages'])) {
            return "Missing items array or pagination meta in response";
        }
        return true;
    });

    $pipeline->assert("GET /tareas supports filtering by attention status ('por_atender')", function() use ($pipeline, $adminToken) {
        $res = $pipeline->request('GET', '/tareas?atencion=por_atender&limit=5', null, $adminToken);
        if ($res['status'] !== 200) {
            return "Expected HTTP status 200, got " . $res['status'];
        }
        return true;
    });

    $pipeline->assert("GET /movimientos returns paginated audit log items", function() use ($pipeline, $adminToken) {
        $res = $pipeline->request('GET', '/movimientos?limit=5&page=1', null, $adminToken);
        if ($res['status'] !== 200) {
            return "Expected HTTP status 200, got " . $res['status'];
        }
        $data = $res['body']['data'] ?? [];
        if (!isset($data['items']) || !isset($data['meta'])) {
            return "Movimientos response missing items or meta";
        }
        return true;
    });

    // =========================================================================
    // STAGE 4: REPORTING & ROLE-BASED ACCESS CONTROL (RBAC)
    // =========================================================================
    $pipeline->stage(4, "Reports Engine & RBAC Restrictions");

    $pipeline->assert("GET /reportes/resumen succeeds for Admin role (200 OK)", function() use ($pipeline, $adminToken) {
        $res = $pipeline->request('GET', '/reportes/resumen', null, $adminToken);
        if ($res['status'] !== 200) {
            return "Expected HTTP status 200 for admin, got " . $res['status'];
        }
        $data = $res['body']['data'] ?? [];
        if (!isset($data['total_tickets']) || !isset($data['tendencia_diaria'])) {
            return "Reportes payload missing core analytical keys";
        }
        return true;
    });

    $pipeline->assert("GET /reportes/resumen blocks Empleado role with 403 Forbidden", function() use ($pipeline, $empleadoToken) {
        $res = $pipeline->request('GET', '/reportes/resumen', null, $empleadoToken);
        if ($res['status'] !== 403) {
            return "Expected HTTP status 403 Forbidden for non-admin, got " . $res['status'];
        }
        return true;
    });

} finally {
    $pipeline->stopServer();
}

$success = $pipeline->summary();
exit($success ? 0 : 1);
