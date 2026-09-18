<?php
declare(strict_types=1);

/**
 * ==============================================================================
 * TECNOFILM ERP - BACKEND AUTOMATED TEST PIPELINE
 * ==============================================================================
 * Tests database connectivity, authentication, catalogs, ticket lifecycle,
 * audit logging, and analytical reports.
 */

// Colors for terminal output
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

class BackendPipelineRunner {
    private int $totalTests = 0;
    private int $passedTests = 0;
    private int $failedTests = 0;
    private float $startTime;
    private array $failures = [];

    public function __construct() {
        $this->startTime = microtime(true);
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
        echo TermColor::BOLD . "  BACKEND PIPELINE SUMMARY" . TermColor::RESET . PHP_EOL;
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
            echo PHP_EOL . TermColor::RED . TermColor::BOLD . "❌ PIPELINE FAILED" . TermColor::RESET . PHP_EOL;
            return false;
        }

        echo PHP_EOL . TermColor::GREEN . TermColor::BOLD . "✅ PIPELINE PASSED SUCCESSFULLY" . TermColor::RESET . PHP_EOL;
        return true;
    }
}

// -----------------------------------------------------------------------------
// Bootstrap application environment
// -----------------------------------------------------------------------------
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

use Illuminate\Database\Capsule\Manager as Capsule;

// Initialize runner
$runner = new BackendPipelineRunner();
$runner->header("TECNOFILM ERP - BACKEND CI/CD TEST PIPELINE");

// =============================================================================
// STAGE 1: DATABASE & SCHEMA INTEGRITY
// =============================================================================
$runner->stage(1, "Database Connectivity & Schema Integrity");

$runner->assert("Eloquent ORM bootstrap and PDO connection", function() {
    Database::bootEloquent();
    $pdo = Database::getConnection();
    if (!($pdo instanceof PDO)) {
        return "PDO connection instance not returned";
    }
    return true;
});

$runner->assert("Required database tables exist in MySQL", function() {
    $expectedTables = [
        'bitacora', 'estados', 'logs_acceso', 'personas',
        'prioridades', 'roles', 'tarea_imagenes', 'tarea_respuestas',
        'tareas', 'tipos_acciones', 'usuarios'
    ];
    $tables = Capsule::select("SHOW TABLES");
    $dbName = Capsule::connection()->getDatabaseName();
    $key = "Tables_in_" . $dbName;
    
    $existing = [];
    foreach ($tables as $t) {
        $existing[] = $t->$key ?? array_values((array)$t)[0];
    }

    foreach ($expectedTables as $expected) {
        if (!in_array($expected, $existing, true)) {
            return "Missing table: {$expected}";
        }
    }
    return true;
});

// =============================================================================
// STAGE 2: SECURITY & AUTHENTICATION
// =============================================================================
$runner->stage(2, "Authentication & Cryptographic Security");

$runner->assert("Password hashing and verification with Bcrypt", function() {
    $raw = 'SecretPassword123!';
    $hash = password_hash($raw, PASSWORD_BCRYPT);
    if (!password_verify($raw, $hash)) {
        return "Bcrypt verification failed for correct password";
    }
    if (password_verify('WrongPassword', $hash)) {
        return "Bcrypt verification unexpectedly succeeded for wrong password";
    }
    return true;
});

$runner->assert("JWT generation and claims payload signature", function() {
    $payload = [
        'id'     => 1,
        'email'  => 'admin@tecnofilm.com',
        'rol_id' => 1,
    ];
    $token = JwtHelper::generate($payload);
    if (empty($token) || substr_count($token, '.') !== 2) {
        return "JWT does not conform to header.payload.signature format";
    }

    $decoded = JwtHelper::verify($token);
    if (!$decoded) {
        return "JWT verification failed on freshly generated token";
    }
    if ($decoded['id'] !== 1 || $decoded['email'] !== 'admin@tecnofilm.com' || $decoded['rol_id'] !== 1) {
        return "JWT payload claims mismatch";
    }
    return true;
});

$runner->assert("JWT tamper detection and signature validation", function() {
    $token = JwtHelper::generate(['id' => 99, 'email' => 'test@tecnofilm.com', 'rol_id' => 2]);
    // Tamper with payload
    $parts = explode('.', $token);
    $tamperedToken = $parts[0] . '.' . base64_encode(json_encode(['id' => 1, 'email' => 'admin@tecnofilm.com', 'rol_id' => 1])) . '.' . $parts[2];
    try {
        JwtHelper::verify($tamperedToken);
        return "Tampered JWT was accepted when it should have thrown exception";
    } catch (RuntimeException $e) {
        // Correct behavior: throws RuntimeException on invalid signature
        return true;
    }
});

// =============================================================================
// STAGE 3: CATALOGS & LOOKUPS
// =============================================================================
$runner->stage(3, "System Catalogs & Lookups");

$catalogoModel = new CatalogoModel();

$runner->assert("Catalogo roles retrieval (Administrador & Empleado)", function() use ($catalogoModel) {
    $roles = $catalogoModel->getRoles();
    if (count($roles) < 2) {
        return "Expected at least 2 roles, got " . count($roles);
    }
    $names = array_column($roles, 'nombre');
    if (!in_array('Administrador', $names) || !in_array('Empleado', $names)) {
        return "Administrador or Empleado role not found in catalogs";
    }
    return true;
});

$runner->assert("Catalogo estados retrieval (Pendiente, En curso, En revisión, Finalizado)", function() use ($catalogoModel) {
    $estados = $catalogoModel->getEstados();
    if (count($estados) < 4) {
        return "Expected at least 4 estados, got " . count($estados);
    }
    $names = array_map('mb_strtolower', array_column($estados, 'nombre'));
    if (!in_array('pendiente', $names) || !in_array('en curso', $names) || !in_array('finalizado', $names)) {
        return "Core estados missing";
    }
    return true;
});

$runner->assert("Catalogo prioridades retrieval (Baja, Media, Alta, Crítica)", function() use ($catalogoModel) {
    $prioridades = $catalogoModel->getPrioridades();
    if (count($prioridades) < 4) {
        return "Expected 4 prioridades, got " . count($prioridades);
    }
    return true;
});

// =============================================================================
// STAGE 4: TAREAS LIFECYCLE (CRUD, SEARCH, FILTERS & RESTORE)
// =============================================================================
$runner->stage(4, "Tareas Lifecycle & Filters Pipeline");

$tareaModel = new TareaModel();
$usuarioModel = new UsuarioModel();

// Find an existing admin user
$adminUser = Usuario::where('rol_id', 1)->first();
if (!$adminUser) {
    $adminUser = Usuario::first();
}
$adminId = $adminUser ? $adminUser->id : 1;

$createdTaskId = null;

$runner->assert("Create new task with priority and author", function() use ($tareaModel, $adminId, &$createdTaskId) {
    $data = [
        'titulo'       => 'TEST TICKET PIPELINE #' . bin2hex(random_bytes(4)),
        'descripcion'  => 'Automated end-to-end pipeline test verification ticket.',
        'estado_id'    => 1, // Pendiente
        'prioridad_id' => 3, // Alta
        'usuario_id'   => $adminId,
    ];
    $createdTaskId = $tareaModel->create($data, $adminId);
    if (!$createdTaskId || $createdTaskId <= 0) {
        return "Failed to create task, returned ID is invalid";
    }
    return true;
});

$runner->assert("Retrieve task by ID with relations (usuario, estado, prioridad)", function() use ($tareaModel, &$createdTaskId) {
    $tarea = $tareaModel->findById($createdTaskId);
    if (!$tarea) {
        return "Task not found by ID";
    }
    if (empty($tarea['titulo']) || empty($tarea['estado']) || empty($tarea['prioridad'])) {
        return "Task relations or core fields missing in response";
    }
    return true;
});

$runner->assert("Search task by exact ID and by '#ID' prefix", function() use ($tareaModel, &$createdTaskId) {
    // Exact ID
    $results = $tareaModel->getAll(['search' => (string)$createdTaskId]);
    $ids = array_column($results, 'id');
    if (!in_array($createdTaskId, $ids)) {
        return "Search by plain ID failed";
    }

    // With # prefix
    $resultsHash = $tareaModel->getAll(['search' => '#' . $createdTaskId]);
    $idsHash = array_column($resultsHash, 'id');
    if (!in_array($createdTaskId, $idsHash)) {
        return "Search by #ID prefix failed";
    }
    return true;
});

$runner->assert("Filter tasks by attention status ('por_atender' vs 'atendidos')", function() use ($tareaModel, &$createdTaskId) {
    // Currently no admin response, should be 'por_atender'
    $unattended = $tareaModel->getAll(['atencion' => 'por_atender']);
    $ids = array_column($unattended, 'id');
    if (!in_array($createdTaskId, $ids)) {
        return "Created ticket without response should appear in 'por_atender'";
    }

    // Should NOT be in 'atendidos'
    $attended = $tareaModel->getAll(['atencion' => 'atendidos']);
    $attendedIds = array_column($attended, 'id');
    if (in_array($createdTaskId, $attendedIds)) {
        return "Created ticket without response should NOT appear in 'atendidos'";
    }
    return true;
});

$runner->assert("Update task and register official admin response", function() use ($tareaModel, $adminId, &$createdTaskId) {
    $updateData = [
        'estado_id'        => 2, // En Proceso
        'respuesta_admin'  => 'Official automated resolution note from pipeline test.',
        'admin_id'         => $adminId,
        'fecha_respuesta'  => date('Y-m-d H:i:s'),
    ];
    $ok = $tareaModel->update($createdTaskId, $updateData, $adminId);
    if (!$ok) {
        return "Update operation failed";
    }

    $tarea = $tareaModel->findById($createdTaskId);
    if ($tarea['estado_id'] !== 2) {
        return "State ID was not updated to 2";
    }
    if ($tarea['respuesta_admin'] !== 'Official automated resolution note from pipeline test.') {
        return "Official admin response was not recorded properly";
    }

    // Now it should be in 'atendidos'
    $attended = $tareaModel->getAll(['atencion' => 'atendidos']);
    $attendedIds = array_column($attended, 'id');
    if (!in_array($createdTaskId, $attendedIds)) {
        return "Answered ticket should now appear in 'atendidos'";
    }
    return true;
});

$runner->assert("Task soft delete operation", function() use ($tareaModel, $adminId, &$createdTaskId) {
    $ok = $tareaModel->softDelete($createdTaskId, $adminId);
    if (!$ok) {
        return "softDelete returned false";
    }

    $tarea = $tareaModel->findById($createdTaskId);
    if ($tarea !== null) {
        return "Soft deleted task should not be returned by standard findById";
    }
    return true;
});

$runner->assert("Task restore operation via new restore method", function() use ($tareaModel, $adminId, &$createdTaskId) {
    $ok = $tareaModel->restore($createdTaskId, $adminId);
    if (!$ok) {
        return "restore returned false";
    }

    $tarea = $tareaModel->findById($createdTaskId);
    if (!$tarea || $tarea['id'] !== $createdTaskId) {
        return "Restored task could not be retrieved after restore()";
    }
    return true;
});

// Clean up test task
if ($createdTaskId) {
    Capsule::table('tarea_respuestas')->where('tarea_id', $createdTaskId)->delete();
    Capsule::table('tareas')->where('id', $createdTaskId)->delete();
}

// =============================================================================
// STAGE 5: USUARIOS & AUDIT TRAILS (BITACORA)
// =============================================================================
$runner->stage(5, "Users & Audit Trails (Bitácora)");

$dashboardModel = new DashboardModel();

$runner->assert("List users with pagination and person join", function() use ($usuarioModel) {
    $users = $usuarioModel->getAll([], 10, 0);
    if (empty($users)) {
        return "No users found in database";
    }
    $first = $users[0];
    if (empty($first['email']) || !isset($first['nombre'])) {
        return "User attributes missing or join with persona failed";
    }
    return true;
});

$runner->assert("Audit trail movements retrieval (Bitácora)", function() use ($dashboardModel) {
    $movimientos = $dashboardModel->getMovimientos(10, 0);
    if (!is_array($movimientos)) {
        return "getMovimientos did not return array";
    }
    $count = $dashboardModel->countMovimientos();
    if ($count < 0) {
        return "countMovimientos returned negative count";
    }
    return true;
});

// =============================================================================
// STAGE 6: ANALYTICS & REPORTING ENGINE
// =============================================================================
$runner->stage(6, "Analytics & Reporting Engine");

$reporteModel = new ReporteModel();
$fechaInicio = date('Y-m-d', strtotime('-30 days'));
$fechaFin = date('Y-m-d');

$runner->assert("Reporte tickets summary metrics", function() use ($reporteModel, $fechaInicio, $fechaFin) {
    $resumen = $reporteModel->getResumenTickets($fechaInicio, $fechaFin);
    if ($resumen === null || !isset($resumen['total_tickets']) || !isset($resumen['resueltos']) || !isset($resumen['pendientes'])) {
        return "Resumen tickets structure invalid";
    }
    return true;
});

$runner->assert("Reporte daily trend aggregation", function() use ($reporteModel, $fechaInicio, $fechaFin) {
    $tendencia = $reporteModel->getTendenciaDiaria($fechaInicio, $fechaFin);
    if (!is_array($tendencia)) {
        return "Tendencia diaria did not return array";
    }
    return true;
});

$runner->assert("Reporte user demand mapping", function() use ($reporteModel, $fechaInicio, $fechaFin) {
    $demanda = $reporteModel->getMapeoUsuarios($fechaInicio, $fechaFin, 10);
    if (!is_array($demanda)) {
        return "Mapeo usuarios did not return array";
    }
    return true;
});

$runner->assert("Reporte critical tickets retrieval", function() use ($reporteModel, $fechaInicio, $fechaFin) {
    $criticos = $reporteModel->getTicketsCriticosAbiertos($fechaInicio, $fechaFin, 10);
    if (!is_array($criticos)) {
        return "Tickets criticos did not return array";
    }
    return true;
});

// Final summary and exit code
$success = $runner->summary();
exit($success ? 0 : 1);
