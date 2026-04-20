<?php
use PHPUnit\Framework\TestCase;

class DatabaseTest extends TestCase {
    private $pdo;

    protected function setUp(): void {
        $this->pdo = new PDO('mysql:host=localhost;port=3307;dbname=shadymedowsv2', 'root', '');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function testConnection() {
        $this->assertInstanceOf(PDO::class, $this->pdo);
    }

    public function testUsersTableExists() {
        $result = $this->pdo->query("SHOW TABLES LIKE 'users'");
        $this->assertNotEmpty($result->fetch());
    }

    public function testBookingsTableExists() {
        $result = $this->pdo->query("SHOW TABLES LIKE 'bookings'");
        $this->assertNotEmpty($result->fetch());
    }

    public function testInsertUser() {
        $stmt = $this->pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $result = $stmt->execute(['testuser', 'test@test.com', password_hash('password123', PASSWORD_BCRYPT)]);
        $this->assertTrue($result);
        $this->pdo->prepare("DELETE FROM users WHERE email = 'test@test.com'")->execute();
    }

    public function testSelectUser() {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute(['shadymedows@gmail.com']);
        $user = $stmt->fetch();
        $this->assertNotEmpty($user);
    }
}