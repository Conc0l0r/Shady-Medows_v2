<?php





require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';

define('DB_HOST', getenv('MYSQLHOST')     ?: 'localhost:3307');
define('DB_NAME', getenv('MYSQLDATABASE') ?: 'shadymedowsv2');
define('DB_USER', getenv('MYSQLUSER')     ?: 'root');
define('DB_PASS', getenv('MYSQLPASSWORD') ?: '');
define('DB_PORT', (int)(getenv('MYSQLPORT') ?: 3306));

// SMTP / PHPMailer config
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'shadymedows@gmail.com');
define('SMTP_PASS', 'qsxokidnfpxbqjbx');
define('SMTP_FROM_NAME', 'Shady Meadows B&B');

// Admin credentials
define('ADMIN_EMAIL',    'shadymedows@gmail.com');
define('ADMIN_PASSWORD', 'shadymedows1234admin');

// Session lifetime: 2 hours
define('SESSION_LIFETIME', 7200);

// ── CORS ──────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── JSON response helpers ─────────────────────────────────────
function jsonOk(array $data = [], int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['ok' => true, ...$data]);
    exit;
}

function jsonErr(string $message, int $code = 400): never {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

// ── PDO connection ────────────────────────────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $url = getenv('MYSQL_URL');

        if ($url) {
            $parts  = parse_url($url);
            $host   = $parts['host'];
            $port   = $parts['port'] ?? 3306;
            $user   = $parts['user'];
            $pass   = $parts['pass'];
            $dbname = ltrim($parts['path'], '/');
        } else {
            // Local fallback
            $host   = 'localhost';
            $port   = 3307;
            $user   = 'root';
            $pass   = '';
            $dbname = 'shadymedowsv2';
        }

        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
        try {
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (\PDOException $e) {
            error_log('DB connection failed: ' . $e->getMessage());
            jsonErr('Database connection failed. Please try again later.', 503);
        }
    }
    return $pdo;
}

// ── Session bootstrap ─────────────────────────────────────────
function startSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

// ── Auth guard (regular users) ────────────────────────────────
function requireAuth(): array {
    startSession();
    if (empty($_SESSION['user_id'])) {
        jsonErr('Not authenticated. Please log in.', 401);
    }
    return ['id' => $_SESSION['user_id'], 'username' => $_SESSION['username']];
}

// ── Admin auth guard ──────────────────────────────────────────
function requireAdmin(): void {
    startSession();
    if (empty($_SESSION['admin_logged_in'])) {
        jsonErr('Admin access required.', 403);
    }
}

// ── PHPMailer helper ──────────────────────────────────────────
function sendMail(string $toEmail, string $toName, string $subject, string $htmlBody): bool {
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;
        $mail->setFrom(SMTP_USER, SMTP_FROM_NAME);
        $mail->addAddress($toEmail, $toName);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->send();
        return true;
    } catch (\Exception $e) {
        error_log('PHPMailer error: ' . $mail->ErrorInfo);
        return false;
    }
}

// ── Generate a numeric OTP ────────────────────────────────────
function generateOtp(): string {
    return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}
