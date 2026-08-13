<?php
/* =====================================================================
   Datenschicht: Mietflächen lesen und schreiben
   ---------------------------------------------------------------------
   Quelle der Wahrheit ist data/flaechen.json. Nach jedem Schreiben wird
   data/flaechen.js neu erzeugt. Die öffentlichen Seiten laden nur diese
   JS-Datei, damit sie ohne fetch und ohne PHP funktionieren.

   Geschrieben wird immer zuerst in eine temporäre Datei und dann
   umbenannt. So kann bei einem Abbruch nie eine halbe Datei entstehen.
   ===================================================================== */

declare(strict_types=1);

require_once __DIR__ . '/kompat.php';

const STATUS_ERLAUBT = ['frei', 'bald', 'vermietet'];

function daten_verzeichnis(): string
{
    return dirname(__DIR__, 2) . '/data';
}

function daten_pfad_json(): string
{
    return daten_verzeichnis() . '/flaechen.json';
}

function daten_pfad_js(): string
{
    return daten_verzeichnis() . '/flaechen.js';
}

/** Liest die Flächendaten. Wirft bei fehlender oder defekter Datei. */
function daten_lesen(): array
{
    $pfad = daten_pfad_json();
    if (!is_readable($pfad)) {
        throw new RuntimeException('Die Datei data/flaechen.json fehlt oder ist nicht lesbar.');
    }
    $roh = file_get_contents($pfad);
    if ($roh === false) {
        throw new RuntimeException('Die Datei data/flaechen.json konnte nicht gelesen werden.');
    }
    $daten = json_decode($roh, true);
    if (!is_array($daten) || !isset($daten['einheiten']) || !is_array($daten['einheiten'])) {
        throw new RuntimeException('Die Datei data/flaechen.json ist beschädigt.');
    }
    return $daten;
}

/**
 * Schreibt die Flächendaten und erzeugt flaechen.js neu.
 * Legt vorher eine datierte Sicherung an.
 */
function daten_schreiben(array $daten): void
{
    $daten['_stand'] = date('Y-m-d');

    $json = json_encode(
        $daten,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    if ($json === false) {
        throw new RuntimeException('Die Daten liessen sich nicht in JSON umwandeln.');
    }

    sicherung_anlegen();
    atomar_schreiben(daten_pfad_json(), $json . "\n");
    atomar_schreiben(daten_pfad_js(), js_erzeugen($json));
}

/** Schreibt über eine temporäre Datei, damit nie ein Torso entsteht. */
function atomar_schreiben(string $ziel, string $inhalt): void
{
    $temp = $ziel . '.tmp' . bin2hex(random_bytes(4));
    if (file_put_contents($temp, $inhalt, LOCK_EX) === false) {
        throw new RuntimeException('Schreiben fehlgeschlagen: ' . basename($ziel) .
            '. Bitte prüfen Sie die Schreibrechte im Ordner data/.');
    }
    if (!rename($temp, $ziel)) {
        @unlink($temp);
        throw new RuntimeException('Umbenennen fehlgeschlagen: ' . basename($ziel) . '.');
    }
    @chmod($ziel, 0644);
}

/** Behält die letzten zehn Sicherungen. */
function sicherung_anlegen(): void
{
    $quelle = daten_pfad_json();
    if (!is_file($quelle)) {
        return;
    }
    $ordner = daten_verzeichnis() . '/sicherungen';
    if (!is_dir($ordner) && !@mkdir($ordner, 0755, true) && !is_dir($ordner)) {
        return;   // Sicherung ist Kür, kein Grund zum Abbruch
    }
    /* Eigene Sperre im Ordner, damit die Sicherungen auch dann nicht
       ausgeliefert werden, wenn die Regel in data/.htaccess nicht greift. */
    $sperre = $ordner . '/.htaccess';
    if (!is_file($sperre)) {
        @file_put_contents(
            $sperre,
            "Require all denied\n\n"
            . "<IfModule !mod_authz_core.c>\n    Order deny,allow\n    Deny from all\n</IfModule>\n\n"
            . "Options -Indexes\n"
        );
    }
    @copy($quelle, $ordner . '/flaechen-' . date('Y-m-d_His') . '.json');

    $alte = glob($ordner . '/flaechen-*.json') ?: [];
    sort($alte);
    foreach (array_slice($alte, 0, max(0, count($alte) - 10)) as $weg) {
        @unlink($weg);
    }
}

/** Baut den Inhalt von data/flaechen.js. */
function js_erzeugen(string $json): string
{
    return <<<JS
/* =====================================================================
   Flächendaten der Alten Weberei Russikon
   ---------------------------------------------------------------------
   ACHTUNG: Diese Datei wird automatisch erzeugt. Nicht von Hand ändern.
   Quelle ist data/flaechen.json, geschrieben vom Admin-Bereich.
   Neu erzeugen: im Admin einmal speichern.

   Bewusst eine JS-Datei und kein fetch auf die JSON, damit die Seiten
   auch ohne Server und ohne PHP laufen (kein CORS, keine Abhängigkeit).
   ===================================================================== */

const WEBEREI_DATEN = {$json};

JS;
}

/**
 * Liest einen Geldbetrag aus dem Formular. Leer ergibt null.
 * Erlaubt sind Schreibweisen wie 1'200, 1200.50 oder 1200,50.
 */
function betrag_lesen(string $roh, string $id, string $was, float $grenze): ?float
{
    $roh = trim($roh);
    if ($roh === '') {
        return null;
    }
    $wert = (float)str_replace(["'", '’', ' ', ','], ['', '', '', '.'], $roh);
    if ($wert <= 0 || $wert > $grenze) {
        throw new InvalidArgumentException("Ungültiger Wert bei {$was} von {$id}.");
    }
    return round($wert, 2);
}

/**
 * Prüft und säubert eine Mieteinheit aus dem Formular.
 *
 * Eine Einheit ist das, was am Stück vermietet wird. Sie kann aus mehreren
 * Räumen bestehen. Die Räume selbst stammen aus der Gebäudeaufnahme und
 * werden im Admin nicht verändert, sie werden unverändert durchgereicht.
 *
 * Der Status kommt nicht aus einem Auswahlfeld, sondern aus dem Häkchen
 * «verfügbar» zusammen mit dem Datum:
 *   Häkchen aus                       -> vermietet
 *   Häkchen an, Datum in der Zukunft  -> wird frei
 *   Häkchen an, kein Datum            -> frei
 */
function einheit_pruefen(array $roh, array $gebaeude_ids, array $bestand): array
{
    $id = trim((string)($roh['id'] ?? ''));
    if ($id === '' || !preg_match('/^[A-Za-z0-9\-]{1,24}$/', $id)) {
        throw new InvalidArgumentException(
            'Ungültige Kennung. Erlaubt sind Buchstaben, Ziffern und Bindestriche.'
        );
    }

    $gebaeude = (string)($roh['gebaeude'] ?? '');
    if (!in_array($gebaeude, $gebaeude_ids, true)) {
        throw new InvalidArgumentException("Unbekannter Gebäudeteil bei {$id}.");
    }

    $geschoss = (string)($roh['geschoss'] ?? '');
    if (!in_array($geschoss, ['EG', 'UG'], true)) {
        throw new InvalidArgumentException("Ungültiges Geschoss bei {$id}.");
    }

    $flaeche = (float)str_replace(["'", '’', ','], ['', '', '.'], (string)($roh['flaeche'] ?? '0'));
    if ($flaeche <= 0 || $flaeche > 100000) {
        throw new InvalidArgumentException("Ungültige Quadratmeterzahl bei {$id}.");
    }

    $frei_ab = trim((string)($roh['frei_ab'] ?? ''));
    if ($frei_ab !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $frei_ab)) {
        throw new InvalidArgumentException("Ungültiges Datum bei {$id}. Format: JJJJ-MM-TT.");
    }

    if (empty($roh['verfuegbar'])) {
        $status  = 'vermietet';
        $frei_ab = '';
    } elseif ($frei_ab !== '' && $frei_ab > date('Y-m-d')) {
        $status = 'bald';
    } else {
        $status  = 'frei';
        $frei_ab = '';          // ein Datum in der Vergangenheit sagt nichts mehr
    }

    $preis_min = betrag_lesen((string)($roh['preis_min'] ?? ''), $id, 'Mietzins von', 10000);
    $preis_max = betrag_lesen((string)($roh['preis_max'] ?? ''), $id, 'Mietzins bis', 10000);
    $fixmiete  = betrag_lesen((string)($roh['fixmiete'] ?? ''), $id, 'Fixmiete', 1000000);

    if ($preis_min !== null && $preis_max !== null && $preis_max < $preis_min) {
        throw new InvalidArgumentException(
            "Bei {$id} ist der obere Mietzins kleiner als der untere."
        );
    }

    $nebenkosten = (string)($roh['nebenkosten'] ?? 'exkl.');
    if (!in_array($nebenkosten, ['inkl.', 'exkl.'], true)) {
        $nebenkosten = 'exkl.';
    }

    /* Die Raumaufteilung stammt aus der Gebäudeaufnahme und bleibt, wie sie
       ist. Sie wird aus dem bestehenden Datensatz übernommen. */
    $raeume = [];
    foreach ($bestand as $alt) {
        if (($alt['id'] ?? '') === $id && isset($alt['raeume']) && is_array($alt['raeume'])) {
            $raeume = $alt['raeume'];
            break;
        }
    }

    return [
        'id'          => $id,
        'gebaeude'    => $gebaeude,
        'geschoss'    => $geschoss,
        'bezeichnung' => mb_substr(trim((string)($roh['bezeichnung'] ?? '')), 0, 80),
        'flaeche'     => round($flaeche, 2),
        'nutzung'     => mb_substr(trim((string)($roh['nutzung'] ?? '')), 0, 80),
        'status'      => $status,
        'frei_ab'     => $frei_ab === '' ? null : $frei_ab,
        'preis_min'   => $preis_min,
        'preis_max'   => $preis_max,
        'fixmiete'    => $fixmiete,
        'nebenkosten' => $nebenkosten,
        'teilbar'     => !empty($roh['teilbar']),
        'hinweis'     => mb_substr(trim((string)($roh['hinweis'] ?? '')), 0, 200),
        'raeume'      => $raeume,
    ];
}
