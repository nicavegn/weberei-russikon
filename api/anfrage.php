<?php
/* =====================================================================
   Anfrageformular der Vermietungsseite
   ---------------------------------------------------------------------
   Nimmt die Anfrage entgegen, prüft sie, und schickt sie per E-Mail an
   die Verwaltung. Antwortet als JSON, damit die Seite ohne Neuladen eine
   Rückmeldung anzeigen kann.

   Schutzmassnahmen: Honigtopf-Feld, Mindestzeit zwischen zwei Anfragen
   derselben Herkunft, Längenbegrenzung, und strikte Prüfung aller Werte,
   die in Kopfzeilen der Mail landen.
   ===================================================================== */

declare(strict_types=1);

require_once __DIR__ . '/lib/auth.php';    // wegen konfig()
require_once __DIR__ . '/lib/daten.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const WARTEZEIT = 30;   // Sekunden zwischen zwei Anfragen derselben Herkunft

/* Kein Rückgabetyp "never", damit die Datei auch auf PHP 8.0 läuft. */
function antwort(bool $ok, string $text, int $code = 200)
{
    http_response_code($code);
    echo json_encode(
        $ok ? ['ok' => true, 'meldung' => $text] : ['ok' => false, 'fehler' => $text],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

/** 2136.12 -> "2'136.12", 303.00 -> "303" */
function zahl_kurz(float $wert): string
{
    $s = number_format($wert, 2, '.', "'");
    return str_contains($s, '.') ? rtrim(rtrim($s, '0'), '.') : $s;
}

/* str_starts_with und str_contains gibt es erst ab PHP 8.0, das ist die
   Mindestversion dieser Seite. Für ältere Installationen hier ein Ersatz. */
if (!function_exists('str_starts_with')) {
    function str_starts_with(string $heu, string $nadel): bool
    {
        return strncmp($heu, $nadel, strlen($nadel)) === 0;
    }
}
if (!function_exists('str_contains')) {
    function str_contains(string $heu, string $nadel): bool
    {
        return $nadel === '' || strpos($heu, $nadel) !== false;
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(false, 'Nur Einsendungen per POST werden verarbeitet.', 405);
}

/* --- Honigtopf: für Menschen unsichtbar, Skripte füllen ihn aus ----- */
if (trim((string)($_POST['webseite'] ?? '')) !== '') {
    // Nicht verraten, dass die Einsendung erkannt wurde.
    antwort(true, 'Vielen Dank für Ihre Anfrage.');
}

/* --- Zeitschloss je Herkunft ----------------------------------------
   Die Spur liegt unter data/laufzeit/, nicht im Systemtemp. Siehe die
   Begründung bei laufzeit_verzeichnis() in lib/auth.php.               */
$spur = laufzeit_verzeichnis() . '/anfrage-' . herkunft_kennung() . '.txt';
if (is_file($spur) && time() - (int)@filemtime($spur) < WARTEZEIT) {
    antwort(false, 'Bitte warten Sie einen Moment, bevor Sie eine weitere Anfrage senden.', 429);
}

/* --- Eingaben prüfen ------------------------------------------------ */
$name      = trim((string)($_POST['name'] ?? ''));
$firma     = trim((string)($_POST['firma'] ?? ''));
$email     = trim((string)($_POST['email'] ?? ''));
$telefon   = trim((string)($_POST['telefon'] ?? ''));
$nachricht = trim((string)($_POST['nachricht'] ?? ''));
$flaeche   = trim((string)($_POST['flaeche'] ?? ''));
$raum      = trim((string)($_POST['raum'] ?? ''));

if ($name === '' || mb_strlen($name) > 100) {
    antwort(false, 'Bitte geben Sie Ihren Namen an.', 422);
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    antwort(false, 'Bitte geben Sie eine gültige E-Mail-Adresse an.', 422);
}
if (mb_strlen($nachricht) < 10 || mb_strlen($nachricht) > 4000) {
    antwort(false, 'Bitte schreiben Sie uns ein paar Sätze zu Ihrem Anliegen.', 422);
}
if (mb_strlen($firma) > 120 || mb_strlen($telefon) > 40) {
    antwort(false, 'Eine Ihrer Angaben ist zu lang.', 422);
}
// Zeilenumbrüche in Kopfzeilen wären ein Einfallstor für fremde Empfänger.
foreach ([$name, $firma, $email, $telefon] as $wert) {
    if (preg_match('/[\r\n]/', $wert)) {
        antwort(false, 'Ungültige Eingabe.', 422);
    }
}
/* Die Kennungen von Fläche und Raum landen im Betreff, auch dann, wenn sie zu
   nichts passen. Sie müssen deshalb genauso streng geprüft werden wie die
   Kennungen in data/flaechen.json, sonst liessen sich über diese Felder eigene
   Kopfzeilen einschleusen.

   Der Punkt gehört seit dem 21.08.2026 dazu: Die Räume heissen jetzt 27EG5.3
   statt 27EG20. Für Kopfzeilen ist er ungefährlich, gefährlich wären allein
   Zeilenumbrüche, und die schliesst das Muster aus. */
$muster_kennung = '/^[A-Za-z0-9.\-]{1,26}$/';
if ($flaeche !== '' && !preg_match($muster_kennung, $flaeche)) {
    antwort(false, 'Die gewählte Fläche ist unbekannt.', 422);
}
if ($raum !== '' && !preg_match($muster_kennung, $raum)) {
    antwort(false, 'Der gewählte Raum ist unbekannt.', 422);
}

/* --- Fläche auflösen ------------------------------------------------
   Der Wert ist die Kennung einer Mieteinheit aus data/flaechen.json.    */
$flaeche_text = 'Allgemeine Anfrage';
if ($flaeche !== '') {
    $flaeche_text = $flaeche;   // Rückfall, falls nichts passt
    try {
        $daten = daten_lesen();
        $gebaeude_namen = [];
        foreach ($daten['gebaeude'] ?? [] as $g) {
            $gebaeude_namen[(string)($g['id'] ?? '')] = (string)($g['name'] ?? '');
        }
        foreach ($daten['einheiten'] as $e) {
            if (($e['id'] ?? '') !== $flaeche) {
                continue;
            }
            $ort = sprintf(
                '%s, %s',
                $gebaeude_namen[$e['gebaeude'] ?? ''] ?? ($e['gebaeude'] ?? ''),
                ($e['geschoss'] ?? '') === 'EG' ? 'Erdgeschoss' : 'Untergeschoss'
            );

            /* Gilt die Anfrage einem einzelnen Raum, steht dieser vorn und die
               Einheit nur noch als Herkunft dahinter. Sonst ginge im Betreff
               unter, worum es tatsächlich geht. */
            $treffer = null;
            if ($raum !== '') {
                foreach ($e['raeume'] ?? [] as $r) {
                    if (($r['id'] ?? '') === $raum) {
                        $treffer = $r;
                        break;
                    }
                }
            }
            if ($treffer !== null) {
                $flaeche_text = sprintf(
                    '%s, %s (%s, %s m², aus der Einheit %s)',
                    $treffer['bez'] ?? $raum,
                    $ort,
                    $raum,
                    zahl_kurz((float)($treffer['qm'] ?? 0)),
                    $e['bezeichnung'] ?? ($e['id'] ?? '')
                );
                break;
            }

            $teile = [];
            foreach ($e['raeume'] ?? [] as $r) {
                $teile[] = sprintf(
                    '%s%s (%s m²)',
                    !empty($r['id']) ? $r['id'] . ' ' : '',
                    $r['bez'] ?? '?',
                    zahl_kurz((float)($r['qm'] ?? 0))
                );
            }
            $zusatz = '';
            if (count($teile) > 1) {
                $zusatz = sprintf(
                    "\n           %s: %s",
                    !empty($e['teilbar']) ? 'einzeln mietbar' : 'nur zusammen mietbar',
                    implode(', ', $teile)
                );
            }
            $flaeche_text = sprintf(
                '%s, %s (%s, %s m²)%s',
                $e['bezeichnung'] ?? $flaeche,
                $ort,
                $e['marke'] ?? $e['id'],
                zahl_kurz((float)$e['flaeche']),
                $zusatz
            );
            break;
        }
    } catch (Throwable $e) {
        // Datei defekt: Anfrage trotzdem zustellen, mit dem Rohwert
    }
}

/* --- Mail bauen und senden ------------------------------------------ */
try {
    $k = konfig();
} catch (Throwable $e) {
    antwort(false, 'Der Formularversand ist noch nicht eingerichtet.', 500);
}

$empfaenger = (string)($k['empfaenger'] ?? '');
$absender   = (string)($k['absender'] ?? '');
if ($empfaenger === '' || $absender === '') {
    antwort(false, 'Der Formularversand ist noch nicht vollständig eingerichtet.', 500);
}

$betreff = sprintf('%s: %s', (string)($k['betreff'] ?? 'Anfrage Mietfläche'), $flaeche_text);

$koerper = implode("\n", [
    'Neue Anfrage über die Website der Alten Weberei Russikon.',
    '',
    'Fläche:    ' . $flaeche_text,
    'Name:      ' . $name,
    'Firma:     ' . ($firma !== '' ? $firma : 'keine Angabe'),
    'E-Mail:    ' . $email,
    'Telefon:   ' . ($telefon !== '' ? $telefon : 'keine Angabe'),
    'Eingegangen: ' . date('d.m.Y H:i'),
    '',
    'Nachricht:',
    '----------------------------------------------------------',
    $nachricht,
    '----------------------------------------------------------',
    '',
    'Antworten Sie einfach auf diese Mail, dann geht die Antwort direkt',
    'an ' . $email . '.',
]);

$kopfzeilen = [
    'From: ' . mb_encode_mimeheader((string)($k['absender_name'] ?? 'Website')) . ' <' . $absender . '>',
    'Reply-To: ' . mb_encode_mimeheader($name) . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'MIME-Version: 1.0',
    'X-Mailer: Weberei Russikon Website',
];

$gesendet = @mail(
    $empfaenger,
    mb_encode_mimeheader($betreff, 'UTF-8'),
    $koerper,
    implode("\r\n", $kopfzeilen),
    '-f' . $absender
);

if (!$gesendet) {
    // Damit keine Anfrage verloren geht, wird sie zusätzlich protokolliert.
    @file_put_contents(
        __DIR__ . '/anfragen-nicht-zugestellt.log',
        date('c') . "\n" . $koerper . "\n\n====\n\n",
        FILE_APPEND | LOCK_EX
    );
    antwort(false,
        'Die Anfrage konnte gerade nicht versendet werden. Bitte schreiben Sie uns direkt an ' .
        $empfaenger . '.', 500);
}

@touch($spur);
antwort(true, 'Vielen Dank, Ihre Anfrage ist eingegangen.');
