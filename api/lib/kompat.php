<?php
/* =====================================================================
   Rückfallebene für die mbstring-Erweiterung
   ---------------------------------------------------------------------
   Die Seite nutzt mb_strlen, mb_substr und mb_encode_mimeheader, um mit
   Umlauten korrekt umzugehen. Auf den meisten Hostings ist mbstring
   vorhanden, garantiert ist es aber nicht. Fehlt sie, gäbe es einen
   Fatal Error und die Seite wäre tot.

   Deshalb hier einfache Ersatzfunktionen, die nur dann definiert werden,
   wenn das Original fehlt. Sie decken UTF-8 ab, mehr wird nicht gebraucht.
   ===================================================================== */

declare(strict_types=1);

if (!function_exists('mb_strlen')) {
    /** Zählt Zeichen, nicht Bytes. Fortsetzungsbytes (10xxxxxx) zählen nicht. */
    function mb_strlen($zeichenkette, $kodierung = null): int
    {
        $s = (string)$zeichenkette;
        $anzahl = 0;
        for ($i = 0, $n = strlen($s); $i < $n; $i++) {
            if ((ord($s[$i]) & 0xC0) !== 0x80) {
                $anzahl++;
            }
        }
        return $anzahl;
    }
}

if (!function_exists('mb_substr')) {
    /** Schneidet an Zeichengrenzen, damit kein Umlaut zerrissen wird. */
    function mb_substr($zeichenkette, $start, $laenge = null, $kodierung = null): string
    {
        $s = (string)$zeichenkette;
        $treffer = [];
        preg_match_all('/./us', $s, $treffer);
        $zeichen = $treffer[0];
        $teil = $laenge === null
            ? array_slice($zeichen, (int)$start)
            : array_slice($zeichen, (int)$start, (int)$laenge);
        return implode('', $teil);
    }
}

if (!function_exists('mb_encode_mimeheader')) {
    /**
     * Kodiert Kopfzeilen nach RFC 2047, damit Umlaute im Betreff und im
     * Absendernamen bei jedem Mailprogramm richtig ankommen.
     */
    function mb_encode_mimeheader($zeichenkette, $zeichensatz = 'UTF-8', $umbruch = null, $zeilenende = null): string
    {
        $s = (string)$zeichenkette;
        // Reines ASCII braucht keine Kodierung
        if (preg_match('/^[\x20-\x7E]*$/', $s)) {
            return $s;
        }
        return '=?UTF-8?B?' . base64_encode($s) . '?=';
    }
}
