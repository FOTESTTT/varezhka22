<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

session_start();

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? 'read';

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function isAdminLoggedIn(): bool
{
    return !empty($_SESSION['admin_user_id']);
}

function requireAdmin(): void
{
    if (!isAdminLoggedIn()) {
        respond(['ok' => false, 'error' => 'Требуется вход в админ-панель'], 401);
    }
}

function loginAdmin(PDO $pdo, string $username, string $password): array
{
    $statement = $pdo->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1');
    $statement->execute([$username]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        respond(['ok' => false, 'error' => 'Неверный логин или пароль'], 401);
    }

    $_SESSION['admin_user_id'] = (int) $user['id'];
    $_SESSION['admin_username'] = $user['username'];

    return [
        'id' => (int) $user['id'],
        'username' => $user['username'],
    ];
}

function updateAdminCredentials(PDO $pdo, int $userId, string $username, string $password): array
{
    if ($username === '') {
        respond(['ok' => false, 'error' => 'Введите логин'], 400);
    }

    if (strlen($password) < 4) {
        respond(['ok' => false, 'error' => 'Пароль должен быть не короче 4 символов'], 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $statement = $pdo->prepare('UPDATE admin_users SET username = ?, password_hash = ? WHERE id = ?');
    $statement->execute([$username, $hash, $userId]);

    $_SESSION['admin_username'] = $username;

    return [
        'id' => $userId,
        'username' => $username,
    ];
}

function readData(PDO $pdo): array
{
    $settings = [];
    foreach ($pdo->query('SELECT setting_key, setting_value FROM site_settings') as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $site = [
        'name' => $settings['name'] ?? '',
        'title' => $settings['title'] ?? '',
        'tagline' => $settings['tagline'] ?? '',
        'description' => $settings['description'] ?? '',
        'address' => $settings['address'] ?? '',
        'phone' => $settings['phone'] ?? '',
        'hours' => $settings['hours'] ?? '',
        'season' => $settings['season'] ?? '',
        'mapCenter' => [
            (float) ($settings['map_lat'] ?? 0),
            (float) ($settings['map_lng'] ?? 0),
        ],
        'copyright' => $settings['copyright'] ?? '',
    ];

    $features = $pdo
        ->query('SELECT title, text FROM features ORDER BY sort_order, id')
        ->fetchAll();

    $promotions = $pdo
        ->query('SELECT title, text, image FROM promotions ORDER BY sort_order, id')
        ->fetchAll();

    $menu = [];
    $categories = $pdo
        ->query('SELECT id, category FROM menu_categories ORDER BY sort_order, id')
        ->fetchAll();
    $itemStatement = $pdo->prepare('SELECT name, price FROM menu_items WHERE category_id = ? ORDER BY sort_order, id');

    foreach ($categories as $category) {
        $itemStatement->execute([$category['id']]);
        $menu[] = [
            'category' => $category['category'],
            'items' => $itemStatement->fetchAll(),
        ];
    }

    $gallery = $pdo
        ->query('SELECT type, src, poster, title FROM gallery_items ORDER BY sort_order, id')
        ->fetchAll();

    foreach ($gallery as &$item) {
        if ($item['poster'] === null) {
            unset($item['poster']);
        }
    }
    unset($item);

    return [
        'site' => $site,
        'features' => $features,
        'promotions' => $promotions,
        'menu' => $menu,
        'gallery' => $gallery,
    ];
}

function upsertSetting(PDO $pdo, string $key, string $value): void
{
    $statement = $pdo->prepare(
        'INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)'
    );
    $statement->execute([$key, $value]);
}

function saveData(PDO $pdo, array $data): void
{
    $pdo->beginTransaction();

    try {
        $site = $data['site'] ?? [];
        $mapCenter = $site['mapCenter'] ?? [0, 0];

        $settings = [
            'name' => (string) ($site['name'] ?? ''),
            'title' => (string) ($site['title'] ?? ''),
            'tagline' => (string) ($site['tagline'] ?? ''),
            'description' => (string) ($site['description'] ?? ''),
            'address' => (string) ($site['address'] ?? ''),
            'phone' => (string) ($site['phone'] ?? ''),
            'hours' => (string) ($site['hours'] ?? ''),
            'season' => (string) ($site['season'] ?? ''),
            'map_lat' => (string) ($mapCenter[0] ?? 0),
            'map_lng' => (string) ($mapCenter[1] ?? 0),
            'copyright' => (string) ($site['copyright'] ?? ''),
        ];

        foreach ($settings as $key => $value) {
            upsertSetting($pdo, $key, $value);
        }

        $pdo->exec('DELETE FROM features');
        $featureStatement = $pdo->prepare('INSERT INTO features (title, text, sort_order) VALUES (?, ?, ?)');
        foreach (($data['features'] ?? []) as $index => $feature) {
            $featureStatement->execute([
                (string) ($feature['title'] ?? ''),
                (string) ($feature['text'] ?? ''),
                $index + 1,
            ]);
        }

        $pdo->exec('DELETE FROM promotions');
        $promotionStatement = $pdo->prepare('INSERT INTO promotions (title, text, image, sort_order) VALUES (?, ?, ?, ?)');
        foreach (($data['promotions'] ?? []) as $index => $promotion) {
            $promotionStatement->execute([
                (string) ($promotion['title'] ?? ''),
                (string) ($promotion['text'] ?? ''),
                (string) ($promotion['image'] ?? ''),
                $index + 1,
            ]);
        }

        $pdo->exec('DELETE FROM menu_categories');
        $categoryStatement = $pdo->prepare('INSERT INTO menu_categories (category, sort_order) VALUES (?, ?)');
        $itemStatement = $pdo->prepare('INSERT INTO menu_items (category_id, name, price, sort_order) VALUES (?, ?, ?, ?)');

        foreach (($data['menu'] ?? []) as $categoryIndex => $category) {
            $categoryStatement->execute([
                (string) ($category['category'] ?? ''),
                $categoryIndex + 1,
            ]);
            $categoryId = (int) $pdo->lastInsertId();

            foreach (($category['items'] ?? []) as $itemIndex => $item) {
                $itemStatement->execute([
                    $categoryId,
                    (string) ($item['name'] ?? ''),
                    (string) ($item['price'] ?? ''),
                    $itemIndex + 1,
                ]);
            }
        }

        $pdo->exec('DELETE FROM gallery_items');
        $galleryStatement = $pdo->prepare(
            'INSERT INTO gallery_items (type, src, poster, title, sort_order) VALUES (?, ?, ?, ?, ?)'
        );
        foreach (($data['gallery'] ?? []) as $index => $item) {
            $galleryStatement->execute([
                ($item['type'] ?? 'image') === 'video' ? 'video' : 'image',
                (string) ($item['src'] ?? ''),
                $item['poster'] ?? null,
                (string) ($item['title'] ?? ''),
                $index + 1,
            ]);
        }

        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }
}

try {
    $pdo = getPdo();

    if ($action === 'status') {
        respond([
            'ok' => true,
            'authenticated' => isAdminLoggedIn(),
            'user' => isAdminLoggedIn()
                ? ['id' => (int) $_SESSION['admin_user_id'], 'username' => (string) $_SESSION['admin_username']]
                : null,
        ]);
    }

    if ($action === 'login') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(['ok' => false, 'error' => 'Для входа используйте POST'], 405);
        }

        $raw = file_get_contents('php://input');
        $credentials = json_decode((string) $raw, true);

        if (!is_array($credentials)) {
            respond(['ok' => false, 'error' => 'Некорректный JSON'], 400);
        }

        $user = loginAdmin(
            $pdo,
            trim((string) ($credentials['username'] ?? '')),
            (string) ($credentials['password'] ?? '')
        );
        respond(['ok' => true, 'user' => $user]);
    }

    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        respond(['ok' => true]);
    }

    if ($action === 'credentials') {
        requireAdmin();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(['ok' => false, 'error' => 'Для изменения доступа используйте POST'], 405);
        }

        $raw = file_get_contents('php://input');
        $credentials = json_decode((string) $raw, true);

        if (!is_array($credentials)) {
            respond(['ok' => false, 'error' => 'Некорректный JSON'], 400);
        }

        $user = updateAdminCredentials(
            $pdo,
            (int) $_SESSION['admin_user_id'],
            trim((string) ($credentials['username'] ?? '')),
            (string) ($credentials['password'] ?? '')
        );
        respond(['ok' => true, 'user' => $user]);
    }

    if ($action === 'read') {
        respond(['ok' => true, 'data' => readData($pdo)]);
    }

    if ($action === 'save') {
        requireAdmin();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respond(['ok' => false, 'error' => 'Для сохранения используйте POST'], 405);
        }

        $raw = file_get_contents('php://input');
        $data = json_decode((string) $raw, true);

        if (!is_array($data)) {
            respond(['ok' => false, 'error' => 'Некорректный JSON'], 400);
        }

        saveData($pdo, $data);
        respond(['ok' => true, 'data' => readData($pdo)]);
    }

    respond(['ok' => false, 'error' => 'Неизвестное действие'], 404);
} catch (Throwable $error) {
    respond(['ok' => false, 'error' => $error->getMessage()], 500);
}
