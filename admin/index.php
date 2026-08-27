<?php
/* =====================================================================
   Admin-Bereich: Anmeldung und Verwaltung der Mietflächen
   ---------------------------------------------------------------------
   Eine Seite, drei Zustände: Anmeldeformular, Flächenliste, Speichern.
   Nach dem Speichern wird data/flaechen.json geschrieben und daraus
   data/flaechen.js neu erzeugt. Die öffentliche Seite ist sofort aktuell.

   Bearbeitet werden die Mieteinheiten: Bezeichnung, Fläche, Mietzins,
   Status, Datum und Nutzung. Die Raumaufteilung stammt aus der
   Gebäudeaufnahme und wird nur angezeigt, nicht verändert.
   ===================================================================== */

declare(strict_types=1);

require_once dirname(__DIR__) . '/api/lib/auth.php';
require_once dirname(__DIR__) . '/api/lib/daten.php';

const GESCHOSS_TEXT = ['EG' => 'Erdgeschoss', 'UG' => 'Untergeschoss'];

/* --- Abmelden -------------------------------------------------------- */
if (isset($_GET['abmelden'])) {
    abmelden();
    header('Location: index.php');
    exit;
}

/* --- Ist überhaupt eingerichtet? ------------------------------------- */
try {
    konfig();
} catch (Throwable $e) {
    echo '<!doctype html><meta charset="utf-8"><title>Nicht eingerichtet</title>'
       . '<p style="font-family:sans-serif;max-width:40em;margin:4em auto">'
       . 'Der Admin-Bereich ist noch nicht eingerichtet. '
       . '<a href="einrichten.php">Jetzt einrichten</a></p>';
    exit;
}

$meldung = null;
$meldung_art = 'gut';

/* --- Anmeldung ------------------------------------------------------- */
if (!angemeldet()) {
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['anmelden'])) {
        $rest = sperre_rest();
        if ($rest > 0) {
            $meldung = 'Zu viele Fehlversuche. Bitte in ' . ceil($rest / 60) . ' Minuten erneut versuchen.';
            $meldung_art = 'schlecht';
        } elseif (anmelden((string)($_POST['benutzer'] ?? ''), (string)($_POST['passwort'] ?? ''))) {
            header('Location: index.php');
            exit;
        } else {
            $meldung = 'Benutzername oder Passwort stimmt nicht.';
            $meldung_art = 'schlecht';
        }
    }
    anmeldeseite($meldung, $meldung_art);
    exit;
}

/* --- Ab hier ist angemeldet ------------------------------------------ */
try {
    $daten = daten_lesen();
} catch (Throwable $e) {
    $daten = ['gebaeude' => [], 'einheiten' => []];
    $meldung = $e->getMessage();
    $meldung_art = 'schlecht';
}

$gebaeude_ids = array_map(static fn($g) => (string)$g['id'], $daten['gebaeude'] ?? []);
$gebaeude_namen = [];
foreach ($daten['gebaeude'] ?? [] as $g) {
    $gebaeude_namen[(string)$g['id']] = (string)$g['name'];
}

/* --- Speichern -------------------------------------------------------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['speichern'])) {
    if (!token_pruefen($_POST['token'] ?? null)) {
        $meldung = 'Die Sitzung ist abgelaufen. Bitte laden Sie die Seite neu.';
        $meldung_art = 'schlecht';
    } else {
        try {
            $bestand = $daten['einheiten'];
            $neu = [];
            $gesehen = [];
            foreach (($_POST['einheiten'] ?? []) as $roh) {
                if (!is_array($roh) || trim((string)($roh['id'] ?? '')) === '') {
                    continue;
                }
                $e = einheit_pruefen($roh, $gebaeude_ids, $bestand);
                if (isset($gesehen[$e['id']])) {
                    throw new InvalidArgumentException('Die Kennung ' . $e['id'] . ' kommt zweimal vor.');
                }
                $gesehen[$e['id']] = true;
                $neu[] = $e;
            }
            if (!$neu) {
                throw new InvalidArgumentException('Es muss mindestens eine Fläche bestehen bleiben.');
            }

            $daten['einheiten'] = $neu;
            daten_schreiben($daten);
            $meldung = count($neu) . ' Flächen gespeichert. Die Website ist aktualisiert.';
            $meldung_art = 'gut';
        } catch (Throwable $e) {
            $meldung = $e->getMessage();
            $meldung_art = 'schlecht';
        }
    }
}

$frei = array_filter(
    $daten['einheiten'],
    static fn($e) => in_array($e['status'] ?? '', ['frei', 'bald'], true)
);
$summe = array_sum(array_map(static fn($e) => (float)($e['flaeche'] ?? 0), $frei));

/* =====================================================================
   Ausgabe
   ===================================================================== */

function anmeldeseite(?string $meldung, string $art): void
{
    ?>
<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Anmeldung | Alte Weberei Russikon</title>
  <link rel="stylesheet" href="../css/fonts.css?v=7">
  <link rel="stylesheet" href="../css/style.css?v=7">
  <link rel="stylesheet" href="admin.css?v=7">
</head>
<body class="admin-body">
  <main class="admin-schmal admin-anmeldung">
    <h1>Flächenverwaltung</h1>
    <p class="admin-lead">Alte Weberei Russikon</p>

    <?php if ($meldung): ?>
      <div class="hinweis hinweis--<?= $art === 'gut' ? 'gut' : 'schlecht' ?>"><p><?= h($meldung) ?></p></div>
    <?php endif; ?>

    <form method="post" class="admin-form">
      <div class="feld">
        <label for="benutzer">Benutzername</label>
        <input type="text" id="benutzer" name="benutzer" required autocomplete="username" autofocus>
      </div>
      <div class="feld">
        <label for="passwort">Passwort</label>
        <input type="password" id="passwort" name="passwort" required autocomplete="current-password">
      </div>
      <button type="submit" name="anmelden" value="1" class="btn btn--primary">Anmelden</button>
    </form>

    <p class="admin-fuss"><a href="../vermietung.html">Zurück zur Website</a></p>
  </main>
</body>
</html>
    <?php
}
?>
<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Flächenverwaltung | Alte Weberei Russikon</title>
  <link rel="stylesheet" href="../css/fonts.css?v=7">
  <link rel="stylesheet" href="../css/style.css?v=7">
  <link rel="stylesheet" href="admin.css?v=7">
</head>
<body class="admin-body">

  <header class="admin-kopf">
    <div>
      <h1>Flächenverwaltung</h1>
      <p>Alte Weberei Russikon</p>
    </div>
    <div class="admin-kopf__rechts">
      <span class="admin-summe"><strong><?= number_format($summe, 0, '.', '’') ?> m²</strong> verfügbar in <?= count($frei) ?> Flächen</span>
      <a class="btn btn--ghost" href="../vermietung.html" target="_blank" rel="noopener">Website ansehen</a>
      <a class="btn btn--ghost" href="?abmelden=1">Abmelden</a>
    </div>
  </header>

  <main class="admin-inhalt">

    <?php if ($meldung): ?>
      <div class="hinweis hinweis--<?= $meldung_art === 'gut' ? 'gut' : 'schlecht' ?>"><p><?= h($meldung) ?></p></div>
    <?php endif; ?>

    <div class="admin-anleitung">
      <p class="admin-lead">
        Nach dem Speichern ist die öffentliche Website sofort aktuell. Eine
        Sicherung der letzten zehn Stände wird automatisch angelegt. Die
        Raumaufteilung stammt aus der Gebäudeaufnahme und wird hier nur angezeigt.
      </p>
      <ul class="admin-legende">
        <li>
          <strong>Verfügbar</strong>
          Häkchen an, die Fläche erscheint auf der Website. Häkchen aus, sie gilt
          als vermietet und lässt sich nicht anfragen.
        </li>
        <li>
          <strong>Frei ab</strong>
          Nur ausfüllen, wenn die Fläche erst später frei wird. Dann steht auf der
          Website «frei ab» mit diesem Datum. Sonst leer lassen.
        </li>
        <li>
          <strong>Mietzins von, bis</strong>
          Franken je m² und Jahr. «von» gilt für die Übernahme im heutigen
          Zustand, «bis» für die ausgebaute Fläche. Wird nur ein Wert erfasst,
          zeigt die Website diesen. Bleiben beide leer, steht «auf Anfrage».
        </li>
        <li>
          <strong>Fixmiete</strong>
          Fester Betrag in Franken je Monat. Ist er erfasst, gilt er anstelle der
          Quadratmeterpreise.
        </li>
        <li>
          <strong>Einzeln mietbar</strong>
          Häkchen an, wenn die Räume dieser Einheit auch einzeln zu haben sind.
        </li>
      </ul>
    </div>

    <form method="post" id="verwaltung">
      <input type="hidden" name="token" value="<?= h(token()) ?>">

      <?php
      $letztes = null;
      foreach (array_values($daten['einheiten']) as $i => $e):
          $schl = ($e['gebaeude'] ?? '') . '|' . ($e['geschoss'] ?? '');
          if ($schl !== $letztes):
              $letztes = $schl;
      ?>
        <h2 class="admin-gruppe">
          <?= h($gebaeude_namen[$e['gebaeude'] ?? ''] ?? ($e['gebaeude'] ?? '')) ?>
          <span><?= h(GESCHOSS_TEXT[$e['geschoss'] ?? ''] ?? ($e['geschoss'] ?? '')) ?></span>
        </h2>
      <?php endif; ?>

        <?php $verfuegbar = in_array($e['status'] ?? '', ['frei', 'bald'], true); ?>
        <fieldset class="karte" data-status="<?= h((string)($e['status'] ?? 'frei')) ?>">
          <legend>
            <?php if (preg_match('/^#[0-9a-f]{6}$/i', (string)($e['farbe'] ?? ''))): ?>
              <span class="karte__farbe" style="background-color: <?= h((string)$e['farbe']) ?>"
                    title="Farbe dieser Fläche im Grundriss"></span>
            <?php endif; ?>
            <span class="karte__nr"><?= h((string)($e['id'] ?? '')) ?></span>
            <?= h((string)($e['bezeichnung'] ?? 'Neue Fläche')) ?>
          </legend>

          <input type="hidden" name="einheiten[<?= $i ?>][id]" value="<?= h((string)($e['id'] ?? '')) ?>">
          <input type="hidden" name="einheiten[<?= $i ?>][gebaeude]" value="<?= h((string)($e['gebaeude'] ?? '')) ?>">
          <input type="hidden" name="einheiten[<?= $i ?>][geschoss]" value="<?= h((string)($e['geschoss'] ?? '')) ?>">

          <div class="raster">
            <div class="feld feld--breit karte__schalter">
              <label class="kasten kasten--gross">
                <input type="checkbox" name="einheiten[<?= $i ?>][verfuegbar]" value="1"
                       data-verfuegbar <?= $verfuegbar ? 'checked' : '' ?>>
                <span>Verfügbar, auf der Website anfragbar</span>
              </label>
              <label class="kasten">
                <input type="checkbox" name="einheiten[<?= $i ?>][teilbar]" value="1"
                       <?= !empty($e['teilbar']) ? 'checked' : '' ?>>
                <span>Räume einzeln mietbar</span>
              </label>
            </div>

            <div class="feld">
              <label>Bezeichnung, wie im Plan</label>
              <input type="text" name="einheiten[<?= $i ?>][bezeichnung]" value="<?= h((string)($e['bezeichnung'] ?? '')) ?>">
            </div>
            <div class="feld feld--klein">
              <label>Fläche in m²</label>
              <input type="text" inputmode="decimal" name="einheiten[<?= $i ?>][flaeche]" value="<?= h((string)($e['flaeche'] ?? '')) ?>" required>
            </div>
            <div class="feld feld--klein">
              <label>Frei ab</label>
              <input type="date" name="einheiten[<?= $i ?>][frei_ab]" value="<?= h((string)($e['frei_ab'] ?? '')) ?>">
            </div>

            <div class="feld">
              <label>Nutzung</label>
              <input type="text" name="einheiten[<?= $i ?>][nutzung]" value="<?= h((string)($e['nutzung'] ?? '')) ?>">
            </div>
            <div class="feld feld--klein">
              <label>Mietzins von</label>
              <input type="text" inputmode="decimal" name="einheiten[<?= $i ?>][preis_min]"
                     value="<?= h(($e['preis_min'] ?? null) === null ? '' : (string)$e['preis_min']) ?>"
                     placeholder="CHF/m²/Jahr">
            </div>
            <div class="feld feld--klein">
              <label>Mietzins bis</label>
              <input type="text" inputmode="decimal" name="einheiten[<?= $i ?>][preis_max]"
                     value="<?= h(($e['preis_max'] ?? null) === null ? '' : (string)$e['preis_max']) ?>"
                     placeholder="CHF/m²/Jahr">
            </div>

            <div class="feld feld--klein">
              <label>Fixmiete je Monat</label>
              <input type="text" inputmode="decimal" name="einheiten[<?= $i ?>][fixmiete]"
                     value="<?= h(($e['fixmiete'] ?? null) === null ? '' : (string)$e['fixmiete']) ?>"
                     placeholder="leer = m²-Preis">
            </div>
            <div class="feld feld--klein">
              <label>Nebenkosten</label>
              <select name="einheiten[<?= $i ?>][nebenkosten]">
                <option value="exkl." <?= ($e['nebenkosten'] ?? 'exkl.') === 'exkl.' ? 'selected' : '' ?>>exklusive</option>
                <option value="inkl." <?= ($e['nebenkosten'] ?? '') === 'inkl.' ? 'selected' : '' ?>>inklusive</option>
                <option value="inkl-ohne-heizung" <?= ($e['nebenkosten'] ?? '') === 'inkl-ohne-heizung' ? 'selected' : '' ?>>inklusive, ohne Heizkosten</option>
              </select>
            </div>
            <div class="feld">
              <label>Hinweis auf der Website</label>
              <input type="text" maxlength="200" name="einheiten[<?= $i ?>][hinweis]"
                     value="<?= h((string)($e['hinweis'] ?? '')) ?>"
                     placeholder="z.B. Nur zusammen mietbar.">
            </div>

            <?php if (!empty($e['raeume']) && count($e['raeume']) > 1): ?>
              <div class="feld feld--breit">
                <label>Räume dieser Einheit, aus der Gebäudeaufnahme</label>
                <p class="karte__raeume">
                  <?php
                  $teile = [];
                  foreach ($e['raeume'] as $r) {
                      $teile[] = ($r['bez'] ?? '?') . ' (' . rtrim(rtrim(number_format((float)($r['qm'] ?? 0), 2, '.', ''), '0'), '.') . ' m²)';
                  }
                  echo h(implode(', ', $teile));
                  ?>
                </p>
              </div>
            <?php endif; ?>
          </div>
        </fieldset>
      <?php endforeach; ?>

      <div class="admin-aktionen">
        <span class="admin-fuss">Die Gebäudeteile und die Raumaufteilung sind fest hinterlegt.</span>
        <button type="submit" name="speichern" value="1" class="btn btn--primary">Speichern</button>
      </div>
    </form>
  </main>

  <script src="admin.js?v=7"></script>
</body>
</html>
