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
}






