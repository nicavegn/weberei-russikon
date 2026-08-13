<?php
/* =====================================================================
   Anmeldung und Sitzungsverwaltung für den Admin-Bereich
   ---------------------------------------------------------------------
   Ein einziges Konto, Passwort als Hash in konfig.php. Kein Klartext,
   keine Datenbank. Dazu ein Zeitschloss gegen das Durchprobieren von
   Passwörtern und ein Token gegen seitenübergreifende Anfragen.
   ===================================================================== */

declare(strict_types=1);

require_once __DIR__ . '/kompat.php';

const SITZUNG_NAME       = 'weberei_admin';
const SITZUNG_DAUER      = 7200;   // zwei Stunden ohne Aktivität
const VERSUCHE_MAX       = 5;      // Fehlversuche je Herkunft
const VERSUCHE_MAX_ALLE  = 30;     // Fehlversuche über alle Herkünfte zusammen
const VERSUCHE_FENSTER   = 3600;   // Zeitfenster für die Gesamtzählung, eine Stunde
const SPERRE_SEKUNDEN    = 900;    // fünfzehn Minuten

/**
 * Ordner für Dateien, die im Betrieb entstehen: Anmeldeversuche und die
 * Wartezeit des Anfrageformulars.
 *
 * Bewusst unter data/ und nicht im Systemtemp. Auf günstigem Shared Hosting
 * wird der Systemtemp geleert oder ist zwischen Kunden geteilt, dann wäre die
 * Sperre wirkungslos oder liesse sich von fremder Seite beeinflussen.
 * Ist data/ wider Erwarten nicht beschreibbar, bleibt der Systemtemp als
 * Rückfall, damit die Anmeldung nicht ganz ausfällt.
 */
function laufzeit_verzeichnis(): string
{
    static $pfad = null;
    if ($pfad !== null) {
        return $pfad;
    }
    $ordner = dirname(__DIR__, 2) . '/data/laufzeit';
    if (!is_dir($ordner)) {
        @mkdir($ordner, 0755, true);
    }
    if (is_dir($ordner) && is_writable($ordner)) {
        $sperre = $ordner . '/.htaccess';
        if (!is_file($sperre)) {
            @file_put_contents(
                $sperre,
                "Require all denied\n\n"
                . "<IfModule !mod_authz_core.c>\n    Order deny,allow\n    Deny from all\n</IfModule>\n\n"
                . "Options -Indexes\n"
            );
        }
        $pfad = $ordner;
    } else {
        $pfad = sys_get_temp_dir();
    }
    return $pfad;
}

/** Kennung der Herkunft, gekürzt und gehasht, damit keine IP im Klartext liegt. */
function herkunft_kennung(): string
{
    return substr(sha1((string)($_SERVER['REMOTE_ADDR'] ?? 'unbekannt')), 0, 16);
}

function konfig(): array
{
    static $konfig = null;
    if ($konfig !== null) {
        return $konfig;
    }
    $pfad = dirname(__DIR__) . '/konfig.php';
    if (!is_file($pfad)) {
        throw new RuntimeException(
            'Die Datei api/konfig.php fehlt. Rufen Sie einmalig admin/einrichten.php auf.'
        );
    }
    $konfig = require $pfad;
    if (!is_array($konfig)) {
        throw new RuntimeException('Die Datei api/konfig.php ist beschädigt.');
    }
    return $konfig;
}

function sitzung_starten(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name(SITZUNG_NAME);
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => !empty($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();

    // Sitzung nach Untätigkeit verfallen lassen
    if (isset($_SESSION['aktiv']) && time() - (int)$_SESSION['aktiv'] > SITZUNG_DAUER) {
        abmelden();
        session_start();
    }
    $_SESSION['aktiv'] = time();
}

function angemeldet(): bool
{
    sitzung_starten();
    return !empty($_SESSION['admin']);
}

function anmeldung_erzwingen(): void
{
    if (!angemeldet()) {
        header('Location: index.php');
        exit;
    }
}

/* --- Zeitschloss ---------------------------------------------------- */

/* Gezählt wird zweistufig. Je Herkunft sperren fünf Fehlversuche für
   fünfzehn Minuten, damit niemand ein Passwort durchprobiert. Zusätzlich
   gilt eine Obergrenze über alle Herkünfte, sonst liesse sich das
   Durchprobieren einfach auf viele Adressen verteilen. Nur die zweite
   Stufe kann die Verwaltung für alle sperren, und sie greift erst bei
   dreissig Fehlversuchen in einer Stunde. Ein einzelner Besucher kann Sie
   damit nicht mehr aussperren. */

function sperrdatei(): string
{
    return laufzeit_verzeichnis() . '/anmeldeversuche.json';
}

function versuche_lesen(): array
{
    $roh = @file_get_contents(sperrdatei());
    $d = $roh === false ? null : json_decode($roh, true);
    if (!is_array($d)) {
        $d = [];
    }
    return [
        'herkuenfte' => is_array($d['herkuenfte'] ?? null) ? $d['herkuenfte'] : [],
        'gesamt'     => is_array($d['gesamt'] ?? null)
            ? $d['gesamt'] : ['anzahl' => 0, 'beginn' => 0, 'letzter' => 0],
    ];
}

function versuche_schreiben(array $v): void
{
    /* Alte Einträge wegräumen, sonst wächst die Datei endlos. */
    $grenze = time() - SPERRE_SEKUNDEN;
    foreach ($v['herkuenfte'] as $kennung => $eintrag) {
        if ((int)($eintrag['letzter'] ?? 0) < $grenze) {
            unset($v['herkuenfte'][$kennung]);
        }
    }
    @file_put_contents(sperrdatei(), json_encode($v), LOCK_EX);
}

/** Verbleibende Sperrzeit in Sekunden, 0 wenn nicht gesperrt. */
function sperre_rest(): int
{
    $v = versuche_lesen();
    $jetzt = time();
    $rest = 0;
    $geaendert = false;

    $eigen = $v['herkuenfte'][herkunft_kennung()] ?? ['anzahl' => 0, 'letzter' => 0];
    if ((int)$eigen['anzahl'] >= VERSUCHE_MAX) {
        $eigen_rest = SPERRE_SEKUNDEN - ($jetzt - (int)$eigen['letzter']);
        if ($eigen_rest > 0) {
            $rest = $eigen_rest;
        } else {
            /* Sperre abgelaufen. Den Zähler zurücksetzen, sonst stünde er
               weiterhin auf fünf und schon der nächste Tippfehler würde
               sofort wieder sperren, statt fünf neue Versuche zu geben. */
            unset($v['herkuenfte'][herkunft_kennung()]);
            $geaendert = true;
        }
    }

    $gesamt = $v['gesamt'];
    if ((int)$gesamt['anzahl'] >= VERSUCHE_MAX_ALLE) {
        $gesamt_rest = SPERRE_SEKUNDEN - ($jetzt - (int)$gesamt['letzter']);
        if ($gesamt_rest > 0) {
            $rest = max($rest, $gesamt_rest);
        } else {
            $v['gesamt'] = ['anzahl' => 0, 'beginn' => 0, 'letzter' => 0];
            $geaendert = true;
        }
    }

    if ($geaendert) {
        versuche_schreiben($v);
    }
    return $rest;
}

function versuch_vermerken(bool $erfolg): void
{
    $v = versuche_lesen();
    $kennung = herkunft_kennung();
    $jetzt = time();

    if ($erfolg) {
        // Der richtige Zugang ist da, beide Zähler dürfen zurück auf null.
        unset($v['herkuenfte'][$kennung]);
        $v['gesamt'] = ['anzahl' => 0, 'beginn' => 0, 'letzter' => 0];
        versuche_schreiben($v);
        return;
    }

    $eigen = $v['herkuenfte'][$kennung] ?? ['anzahl' => 0, 'letzter' => 0];
    $v['herkuenfte'][$kennung] = [
        'anzahl'  => (int)$eigen['anzahl'] + 1,
        'letzter' => $jetzt,
    ];

    // Die Gesamtzählung läuft in einem Zeitfenster und beginnt danach neu.
    $gesamt = $v['gesamt'];
    if ($jetzt - (int)$gesamt['beginn'] > VERSUCHE_FENSTER) {
        $gesamt = ['anzahl' => 0, 'beginn' => $jetzt, 'letzter' => 0];
    }
    $gesamt['anzahl']  = (int)$gesamt['anzahl'] + 1;
    $gesamt['letzter'] = $jetzt;
    $v['gesamt'] = $gesamt;

    versuche_schreiben($v);
}

/* --- Anmelden und abmelden ------------------------------------------ */

function anmelden(string $benutzer, string $passwort): bool
{
    sitzung_starten();
    $k = konfig();

    $benutzer_ok = hash_equals((string)($k['admin_benutzer'] ?? ''), $benutzer);
    $passwort_ok = password_verify($passwort, (string)($k['admin_hash'] ?? ''));

    // Beide Prüfungen laufen immer, damit die Antwortzeit nichts verrät.
    if (!$benutzer_ok || !$passwort_ok) {
        versuch_vermerken(false);
        return false;
    }

    session_regenerate_id(true);
    $_SESSION['admin'] = $benutzer;
    $_SESSION['aktiv'] = time();
    versuch_vermerken(true);
    return true;
}

function abmelden(): void
{
    sitzung_starten();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/* --- Token gegen seitenübergreifende Anfragen ----------------------- */

function token(): string
{
    sitzung_starten();
    if (empty($_SESSION['token'])) {
        $_SESSION['token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['token'];
}

function token_pruefen(?string $wert): bool
{
    sitzung_starten();
    return !empty($_SESSION['token']) && is_string($wert)
        && hash_equals($_SESSION['token'], $wert);
}

/** Kurzschreibweise für die Ausgabe in HTML. */
function h(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
