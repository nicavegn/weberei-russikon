# Hosting und Inbetriebnahme bei Hostpoint

Diese Anleitung führt die Website von der Vorschau auf GitHub Pages zu einem
produktiven Betrieb bei Hostpoint unter **alte-weberei-russikon.ch**, mit
Admin-Login und funktionierendem Anfrageformular.

Rechnen Sie mit gut einer Stunde, die meiste Zeit davon mit Warten auf
Bestätigungsmails.

Preise und Angaben von hostpoint.ch, Stand 01.10.2026. Vor der Bestellung
kurz gegenprüfen.

---

## 1. Was die Seite braucht

| Anforderung | Wert |
|---|---|
| PHP | 8.0 oder neuer, empfohlen 8.3 |
| Datenbank | keine |
| Speicher | rund 3 MB |
| Schreibrechte | auf `data/`, einmalig auf `api/` |
| Mailversand | die PHP-Funktion `mail()` |
| Zertifikat | HTTPS, bei Hostpoint als FreeSSL inbegriffen |

Kein Build, kein Node, kein Composer. Es werden schlicht Dateien hochgeladen.

## 2. Bestellen

Auf **hostpoint.ch** zuerst die Domain suchen, dann das Paket dazunehmen.

| Position | Preis (inkl. MWST) |
|---|---|
| Webhosting **Standard** (100 GB, 10 Domains, unbegrenzt Mailkonten, SFTP und SSH) | CHF 15.90 im Monat |
| Domain **alte-weberei-russikon.ch** | CHF 5 im ersten Jahr, danach CHF 15 im Jahr |
| Domain Shield, optional | CHF 12 im Jahr |

Standard genügt völlig, die Website braucht rund 3 MB. Die grösseren Pakete
Smart und Business bringen hier nichts.

**Vor dem Bestellen klären: wer ist Inhaber der Domain?** Der Inhaber ist
rechtlich der Eigentümer der Domain und nicht ohne Weiteres wechselbar.
Empfehlung: nicht eine Einzelperson, sondern die **WR Weberei Russikon AG**
oder die SOLIDA als Verwalterin, mit einer Firmenadresse als Kontakt. Domain
Shield verbirgt die Inhaberdaten vor dem öffentlichen Register.

**Nicht verwechseln:** `weberei-russikon.ch` ohne «alte» existiert bereits und
leitet auf getzner.at weiter. Sie gehört dem früheren Betreiber und ist nicht
unsere Domain.

## 3. Im Hostpoint Control Panel einrichten

1. **Domain dem Webhosting zuweisen.** Bei gemeinsamer Bestellung geschieht das
   meist von selbst. Es entsteht der Ordner
   `/home/<benutzer>/www/alte-weberei-russikon.ch/`. Das ist das
   Document-Root, dort gehört die Website hin.
2. **HTTPS.** FreeSSL wird bei der Erstellung der Website automatisch
   aktiviert. Danach unter *Websites, Web-Einstellungen* das Häkchen
   «Alle Anfragen automatisch auf https:// weiterleiten (SSL forcieren)»
   setzen. Das erledigt die Umleitung, eine eigene `.htaccess` ist nicht
   nötig.
3. **PHP-Version** unter *Websites, Web-Einstellungen* auf 8.3 stellen.
4. **SSH-Zugang aktivieren** unter *Webhosting, Advanced, SSH-Zugang*.
   Ohne das gibt es keinen SFTP-Zugang.
5. **Passwort setzen** unter *Webhosting, Advanced, Passwort-Wechsel*. Den
   Benutzernamen des Haupt-FTP-Accounts finden Sie im Hosting-Vertrag.
6. **Mailkonto anlegen:** `website@alte-weberei-russikon.ch`. Das ist die
   Absenderadresse der Website. Weitere Konten kosten nichts.

Wohin die Anfragen gehen, bestimmen Sie bei der Einrichtung in Abschnitt 5. Das
kann ein Konto bei Hostpoint sein, etwa `vermietung@alte-weberei-russikon.ch`,
oder direkt eine bestehende SOLIDA-Adresse. Letzteres spart ein Postfach, das
jemand lesen muss.

## 4. Dateien hochladen

**Upload-Ordner erzeugen.** Das Werkzeug kopiert die Website in den Ordner
`hochladen/` und lässt weg, was auf dem Server nichts verloren hat
(`.git`, diese Anleitung, die Zugangsdaten, Laufzeitdateien):

```bash
py unterlagen/werkzeuge/hochladen_vorbereiten.py
```

**Hochladen mit WinSCP** (kostenlos, winscp.net):

| Feld | Wert |
|---|---|
| Dateiprotokoll | SFTP |
| Rechnername | Servername aus dem Control Panel unter *Services, Advanced, FTP* |
| Portnummer | 22 |
| Benutzername | der Haupt-FTP-Account aus dem Vertrag |
| Passwort | das in Schritt 5 gesetzte |

Rechts auf dem Server nach `www/alte-weberei-russikon.ch/` wechseln, links den
**Inhalt** von `hochladen/` markieren (Strg+A) und hinüberziehen. Nicht den
Ordner selbst, sonst steht die Website unter `/hochladen/`.

**Wichtig: die versteckten Dateien.** Drei Dateien heissen `.htaccess` und
schützen den Server. Ohne sie wären Zugangsdaten und Bibliotheken von aussen
erreichbar. WinSCP zeigt Punkt-Dateien auf dem Server erst nach **Strg+Alt+H**.
Prüfen Sie nach dem Hochladen, dass sie dort stehen:

- `api/.htaccess`
- `api/lib/.htaccess`
- `data/.htaccess`

**Rechte.** Normalerweise genügen die Standardrechte. Meldet der Admin später,
er könne nicht schreiben, setzen Sie `data/` im WinSCP-Fenster per Rechtsklick,
*Eigenschaften* auf 755, notfalls 775.

## 5. Admin-Bereich einrichten

1. Rufen Sie **`https://alte-weberei-russikon.ch/admin/einrichten.php`** auf.
2. Tragen Sie Benutzername und ein Passwort mit mindestens 12 Zeichen ein.
   Dazu die **Empfängeradresse** (wohin die Anfragen gehen) und die
   **Absenderadresse** `website@alte-weberei-russikon.ch`.
3. Nach dem Absenden entsteht `api/konfig.php` mit dem Passwort-Hash. Das
   Passwort selbst wird nirgends gespeichert.
4. **Löschen Sie danach `admin/einrichten.php` auf dem Server.** Die Datei sperrt
   sich zwar selbst, gelöscht ist sauberer.

Ab jetzt melden Sie sich unter `https://alte-weberei-russikon.ch/admin/` an.
Beim Speichern wird `data/flaechen.json` geschrieben und daraus
`data/flaechen.js` neu erzeugt. Die öffentliche Seite ist sofort aktuell.

Von den letzten zehn Ständen liegt automatisch eine Sicherung in
`data/sicherungen/`. Daneben entsteht `data/laufzeit/` mit den Zählern für
Anmeldeversuche und die Wartezeit des Formulars. Beide Ordner legt die Website
selbst an und schützt sie mit einer eigenen `.htaccess`.

## 6. Formularversand prüfen

Senden Sie über das Formular auf der Vermietungsseite eine Testanfrage an sich
selbst.

Hostpoint versendet `mail()` über einen Maildienst auf dem Webserver. Ohne
eigene Angabe steht als Absender `<benutzer>@webuser.mail.hostpoint.ch`, was bei
aktivem SPF, DKIM oder DMARC Probleme macht. Unser Formular setzt die
Absenderadresse selbst, deshalb sollte es ohne Zusatz klappen.

Kommt nichts an, oder landet die Mail im Spam, legen Sie im Document-Root eine
Datei `.user.ini` an mit:

```
sendmail_path = "/usr/sbin/sendmail -t -f website@alte-weberei-russikon.ch"
```

Geht ein Versand schief, landet die Anfrage zusätzlich in
`api/anfragen-nicht-zugestellt.log`. Es geht also nichts verloren.

## 7. Prüfliste vor dem Freischalten

- [ ] `https://alte-weberei-russikon.ch` lädt, das Schloss ist geschlossen
- [ ] `http://alte-weberei-russikon.ch` leitet auf `https://` um
- [ ] Alle vier Seiten laden, die Grundrisse erscheinen, die Flächenliste füllt sich
- [ ] **`https://alte-weberei-russikon.ch/api/konfig.php` liefert 403**, nicht Inhalt
- [ ] **`https://alte-weberei-russikon.ch/api/lib/auth.php` liefert 403 oder 404**
- [ ] **`https://alte-weberei-russikon.ch/data/sicherungen/` liefert 403 oder 404**
- [ ] `admin/einrichten.php` ist gelöscht
- [ ] Anmeldung im Admin klappt, eine Änderung erscheint sofort auf der Website
- [ ] Testanfrage kommt an, Antworten geht an den Absender der Anfrage

Meldet eine Seite beim ersten Aufruf «500 Internal Server Error», liegt es fast
immer an einer `.htaccess`. Dann diese Datei kurz umbenennen und melden, welche.

## 8. Sichtbarkeit für Suchmaschinen

Solange die Seite nicht öffentlich sein soll, bleibt alles wie bisher:

- `robots.txt` enthält `Disallow: /`
- alle vier Seiten tragen `<meta name="robots" content="noindex, nofollow">`

**Zum Freischalten** entfernen Sie diese `meta`-Zeile aus `index.html`,
`geschichte.html`, `vermietung.html` und `verwalter.html` und ändern
`robots.txt` auf:

```
User-agent: *
Allow: /
```

Der Admin-Bereich behält seine `noindex`-Angabe in jedem Fall. Danach neu
hochladen, wie in Abschnitt 9.

## 9. Updates aufspielen

Änderungen an Gestaltung, Texten oder Skripten:

```bash
py unterlagen/werkzeuge/hochladen_vorbereiten.py --update
```

Der Modus `--update` lässt `data/flaechen.json` und `data/flaechen.js` weg.
Das ist wichtig: Diese beiden Dateien schreibt der Admin-Bereich auf dem
Server. Wer die lokalen Fassungen darüber lädt, macht alle Änderungen rückgängig,
die dort inzwischen gemacht wurden. Der Upload-Ordner enthält sie dann gar
nicht erst, ein Überschreiben ist nicht möglich.

Danach den Inhalt von `hochladen/` wie in Abschnitt 4 hochladen. WinSCP fragt
bei vorhandenen Dateien nach, *Alle überschreiben* genügt.

Wer Änderungen an `css/` oder `js/` aufspielt, zählt vorher die Versionsnummer
hoch, siehe `README.md`, Abschnitt «Zwischenspeicher der Browser».

## 10. Was mit GitHub geschieht

Das Repository bleibt als Versionsgeschichte und Sicherung. GitHub Pages ist
dann nicht mehr die veröffentlichte Adresse.

- Weiterhin committen und pushen wie bisher.
- GitHub Pages im Repository unter *Settings, Pages* **abschalten**, damit nicht
  zwei Fassungen im Netz stehen.
- `api/konfig.php` ist über `.gitignore` ausgeschlossen und darf **nie**
  eingecheckt werden. Sie enthält den Passwort-Hash.
- Die Daten auf dem Server sind ab Livegang die massgebliche Fassung.
  `data/flaechen.json` im Repository ist dann nur noch der Stand vom Aufschalten.

## 11. Quellen

- Preise: hostpoint.ch, Webhosting und Domains
- SFTP: support.hostpoint.ch, «Wie verbinde ich mich via FTP/SFTP mit meinem Server?»
- Document-Root: support.hostpoint.ch, «Wo liegt das Document-Root meiner Website?»
- HTTPS: support.hostpoint.ch, «Domain von HTTP auf HTTPS weiterleiten»
- Mailversand: support.hostpoint.ch, «E-Mail-Versand über die Website»
