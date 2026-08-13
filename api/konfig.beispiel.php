<?php
/* =====================================================================
   Vorlage für api/konfig.php
   ---------------------------------------------------------------------
   Diese Datei ist NUR die Vorlage und enthält keine echten Zugangsdaten.
   Die echte konfig.php wird von admin/einrichten.php erzeugt und ist
   bewusst nicht im Git-Repository (siehe .gitignore).

   Wer sie von Hand anlegen möchte, kopiert diese Datei nach konfig.php
   und trägt die Werte ein. Den Passwort-Hash erzeugt man mit:

       php -r "echo password_hash('IhrPasswort', PASSWORD_DEFAULT);"

   oder bequemer über admin/einrichten.php im Browser.
   ===================================================================== */

return [
    // Anmeldung für den Admin-Bereich
    'admin_benutzer' => 'verwaltung',
    'admin_hash'     => '',   // Ergebnis von password_hash(), nie das Passwort selbst

    // Wohin die Anfragen aus dem Formular gehen
    'empfaenger'     => 'vermietung@weberei-russikon.ch',

    // Absenderadresse. Muss zur Domain gehören, sonst stufen Mailserver
    // die Nachricht als Fälschung ein und sortieren sie aus.
    'absender'       => 'website@weberei-russikon.ch',
    'absender_name'  => 'Alte Weberei Russikon',

    // Betreffzeile der Anfragemails
    'betreff'        => 'Anfrage Mietfläche',
];
