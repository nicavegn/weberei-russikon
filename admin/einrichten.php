<?php
/* =====================================================================
   Einmalige Einrichtung des Admin-Bereichs
   ---------------------------------------------------------------------
   Erzeugt api/konfig.php mit Benutzername, Passwort-Hash und den
   Mailadressen. Läuft ausschliesslich, solange konfig.php noch nicht
   existiert. Danach verweigert die Seite den Dienst, damit niemand die
   Zugangsdaten nachträglich überschreiben kann.
   ===================================================================== */

declare(strict_types=1);

require_once dirname(__DIR__) . '/api/lib/kompat.php';

$konfig_pfad = dirname(__DIR__) . '/api/konfig.php';

if (is_file($konfig_pfad)) {
    http_response_code(403);
    echo '<!doctype html><meta charset="utf-8"><title>Bereits eingerichtet</title>'
       . '<p style="font-family:sans-serif;max-width:40em;margin:4em auto">'
       . 'Der Admin-Bereich ist bereits eingerichtet. Diese Seite ist deshalb '
       . 'gesperrt. Löschen Sie <code>api/konfig.php</code> auf dem Server, '
       . 'falls Sie die Einrichtung wirklich neu starten wollen. '
       . '<a href="index.php">Zur Anmeldung</a></p>';
    exit;
}

$fehler = [];
$fertig = false;

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $benutzer   = trim((string)($_POST['benutzer'] ?? ''));
    $passwort   = (string)($_POST['passwort'] ?? '');
    $passwort2  = (string)($_POST['passwort2'] ?? '');
    $empfaenger = trim((string)($_POST['empfaenger'] ?? ''));
    $absender   = trim((string)($_POST['absender'] ?? ''));

    if (!preg_match('/^[a-zA-Z0-9._-]{3,40}$/', $benutzer)) {
        $fehler[] = 'Der Benutzername braucht 3 bis 40 Zeichen, erlaubt sind Buchstaben, Ziffern, Punkt, Strich und Unterstrich.';
    }
    if (mb_strlen($passwort) < 12) {
        $fehler[] = 'Das Passwort muss mindestens 12 Zeichen lang sein.';
    }
    if ($passwort !== $passwort2) {
        $fehler[] = 'Die beiden Passwörter stimmen nicht überein.';
    }
    if (!filter_var($empfaenger, FILTER_VALIDATE_EMAIL)) {
        $fehler[] = 'Die Empfängeradresse ist keine gültige E-Mail-Adresse.';
    }
    if (!filter_var($absender, FILTER_VALIDATE_EMAIL)) {
        $fehler[] = 'Die Absenderadresse ist keine gültige E-Mail-Adresse.';
    }

    if (!$fehler) {
        $inhalt = "<?php\n"
            . "/* Automatisch erzeugt von admin/einrichten.php am " . date('d.m.Y H:i') . ".\n"
            . "   Diese Datei enthält Zugangsdaten und gehört NICHT ins Git-Repository. */\n\n"
            . "return [\n"
            . "    'admin_benutzer' => " . var_export($benutzer, true) . ",\n"
            . "    'admin_hash'     => " . var_export(password_hash($passwort, PASSWORD_DEFAULT), true) . ",\n"
            . "    'empfaenger'     => " . var_export($empfaenger, true) . ",\n"
            . "    'absender'       => " . var_export($absender, true) . ",\n"
            . "    'absender_name'  => 'Alte Weberei Russikon',\n"
            . "    'betreff'        => 'Anfrage Mietfläche',\n"
            . "];\n";

        if (@file_put_contents($konfig_pfad, $inhalt, LOCK_EX) === false) {
            $fehler[] = 'Die Datei api/konfig.php konnte nicht geschrieben werden. '
                      . 'Bitte geben Sie dem Ordner api/ vorübergehend Schreibrechte.';
        } else {
            @chmod($konfig_pfad, 0640);
            $fertig = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Einrichtung | Alte Weberei Russikon</title>
  <link rel="stylesheet" href="../css/fonts.css?v=5">
  <link rel="stylesheet" href="../css/style.css?v=5">
  <link rel="stylesheet" href="admin.css?v=5">
</head>
<body class="admin-body">
  <main class="admin-schmal">
    <h1>Admin-Bereich einrichten</h1>

    <?php if ($fertig): ?>
      <div class="hinweis hinweis--gut">
        <p><strong>Die Einrichtung ist abgeschlossen.</strong></p>
        <p>
          Löschen Sie jetzt bitte die Datei <code>admin/einrichten.php</code> vom
          Server. Sie wird nicht mehr gebraucht und sperrt sich zwar selbst,
          gelöscht ist aber sauberer.
        </p>
        <p><a class="btn btn--primary" href="index.php">Zur Anmeldung</a></p>
      </div>
    <?php else: ?>
      <p class="admin-lead">
        Diese Seite läuft nur ein einziges Mal. Sie legt die Zugangsdaten für die
        Flächenverwaltung an und bestimmt, wohin die Anfragen aus dem
        Kontaktformular gehen.
      </p>

      <?php if ($fehler): ?>
        <div class="hinweis hinweis--schlecht">
          <ul><?php foreach ($fehler as $f): ?><li><?= htmlspecialchars($f, ENT_QUOTES, 'UTF-8') ?></li><?php endforeach; ?></ul>
        </div>
      <?php endif; ?>

      <form method="post" class="admin-form">
        <div class="feld">
          <label for="benutzer">Benutzername</label>
          <input type="text" id="benutzer" name="benutzer" required autocomplete="username"
                 value="<?= htmlspecialchars((string)($_POST['benutzer'] ?? 'verwaltung'), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="feld">
          <label for="passwort">Passwort, mindestens 12 Zeichen</label>
          <input type="password" id="passwort" name="passwort" required autocomplete="new-password" minlength="12">
        </div>
        <div class="feld">
          <label for="passwort2">Passwort wiederholen</label>
          <input type="password" id="passwort2" name="passwort2" required autocomplete="new-password" minlength="12">
        </div>
        <hr class="rule">
        <div class="feld">
          <label for="empfaenger">Anfragen gehen an diese Adresse</label>
          <input type="email" id="empfaenger" name="empfaenger" required
                 value="<?= htmlspecialchars((string)($_POST['empfaenger'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="feld">
          <label for="absender">Absenderadresse der Website</label>
          <input type="email" id="absender" name="absender" required
                 value="<?= htmlspecialchars((string)($_POST['absender'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
          <p class="feld-hinweis">
            Muss zur eigenen Domain gehören, zum Beispiel
            website@weberei-russikon.ch. Fremde Adressen werden von
            Mailservern als Fälschung aussortiert.
          </p>
        </div>
        <button type="submit" class="btn btn--primary">Einrichten</button>
      </form>
    <?php endif; ?>
  </main>
</body>
</html>
