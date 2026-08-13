# Hosting und Inbetriebnahme

Diese Anleitung führt die Website von der bisherigen Vorschau auf GitHub Pages
zu einem produktiven Betrieb auf einem Schweizer Hoster mit eigener Domain,
Admin-Login und funktionierendem Anfrageformular.

Rechnen Sie mit rund zwei Stunden für die Ersteinrichtung.

---

## 1. Was die Seite braucht

| Anforderung | Wert |
|---|---|
| PHP | Version 8.0 oder neuer |
| Datenbank | keine |
| Schreibrechte | nur auf `data/` und einmalig auf `api/` |
| Mailversand | die PHP-Funktion `mail()` oder SMTP des Hosters |
| Zertifikat | HTTPS, bei allen genannten Anbietern kostenlos inbegriffen |

Kein Build, kein Node, kein Composer. Es werden schlicht Dateien hochgeladen.

## 2. Hoster und Domain

Empfohlen wird ein Schweizer Anbieter, weil Daten und Mailverkehr damit in der
Schweiz bleiben, was für eine Immobilienverwaltung das sauberere Bild abgibt.

| Anbieter | Einstiegspaket | ungefähr pro Jahr | Bemerkung |
|---|---|---|---|
| Hostpoint | Smart | rund 90 bis 120 CHF | verbreitet, deutschsprachiger Support |
| Infomaniak | Starter Hosting | rund 70 bis 100 CHF | ökologisch positioniert, Rechenzentrum Genf |
| Cyon | Web Hosting S | rund 100 bis 130 CHF | Basel, guter Ruf beim Support |

Alle drei bieten Apache mit `.htaccess`, PHP 8, kostenloses HTTPS und
Mailkonten. Die Domain **weberei-russikon.ch** kostet zusätzlich etwa 15 bis
20 Franken im Jahr und lässt sich beim selben Anbieter bestellen.

**Schritte**

1. Hosting-Paket und Domain `weberei-russikon.ch` bestellen.
2. Im Kundenbereich HTTPS aktivieren, meist Let's Encrypt, ein Klick.
3. Erzwingen, dass `http` auf `https` umgeleitet wird. Bei allen drei
   Anbietern eine Einstellung im Panel.
4. Ein Mailkonto `vermietung@weberei-russikon.ch` anlegen sowie eine
   Absenderadresse `website@weberei-russikon.ch`.

## 3. Dateien hochladen

Laden Sie den **Inhalt** des Ordners `webseite/` in das Web-Verzeichnis des
Hosters. Das heisst je nach Anbieter `public_html`, `httpdocs` oder `www`.

Danach sieht es auf dem Server so aus:

```
public_html/
├── index.html
├── geschichte.html
├── vermietung.html
├── robots.txt
├── admin/          Login und Flächenverwaltung
├── api/            Endpunkte und Bibliotheken
├── css/  js/  assets/
└── data/           flaechen.json und flaechen.js
```

Nicht hochladen müssen Sie `README.md`, `HOSTING.md` und `.gitignore`. Sie
schaden aber auch nicht.

**Rechte setzen**

- `data/` braucht Schreibrechte, damit der Admin speichern kann: `755`,
  bei manchen Hostern `775`.
- `api/` braucht **einmalig** Schreibrechte, damit die Einrichtung die Datei
  `konfig.php` anlegen kann. Danach wieder auf `755` zurücksetzen.

## 4. Admin-Bereich einrichten

1. Rufen Sie **`https://weberei-russikon.ch/admin/einrichten.php`** auf.
2. Tragen Sie Benutzername und ein Passwort mit mindestens 12 Zeichen ein,
   dazu die Empfänger- und die Absenderadresse.
3. Nach dem Absenden entsteht `api/konfig.php` mit dem Passwort-Hash. Das
   Passwort selbst wird nirgends gespeichert.
4. **Löschen Sie danach `admin/einrichten.php` vom Server.** Die Datei sperrt
   sich zwar selbst, sobald `konfig.php` existiert, aber gelöscht ist sauberer.
5. Setzen Sie die Rechte von `api/` zurück auf `755`.

Ab jetzt melden Sie sich unter `https://weberei-russikon.ch/admin/` an und
pflegen dort Status, Quadratmeter, Mietzins und Beschreibung jeder Fläche.
Beim Speichern wird `data/flaechen.json` geschrieben und daraus
`data/flaechen.js` neu erzeugt. Die öffentliche Seite ist damit sofort aktuell.

Von den letzten zehn Ständen liegt automatisch eine Sicherung in
`data/sicherungen/`. Daneben entsteht `data/laufzeit/` mit den Zählern für
Anmeldeversuche und die Wartezeit des Formulars. Beide Ordner legt die Website
selbst an und schützt sie mit einer eigenen `.htaccess`. Sie gehören nicht ins
Backup und nicht ins Repository, `data/` muss dafür aber beschreibbar sein.

## 5. Formularversand prüfen

Senden Sie über das Formular auf der Vermietungsseite eine Testanfrage an sich
selbst.

Kommt nichts an, liegt es fast immer an der Absenderadresse. Sie **muss** zur
eigenen Domain gehören. Eine Anfrage, die vorgibt von `gmail.com` zu kommen,
aber vom Server des Hosters stammt, wird von Mailservern aussortiert.

Falls `mail()` beim Hoster gesperrt ist, richten Sie stattdessen SMTP ein. Der
Versand steckt gebündelt am Ende von `api/anfrage.php`, dort ist dann die
Funktion `mail()` durch die SMTP-Bibliothek des Hosters zu ersetzen.

Geht ein Versand schief, landet die Anfrage zusätzlich in
`api/anfragen-nicht-zugestellt.log`. Es geht also nichts verloren.

## 6. Sichtbarkeit für Suchmaschinen

Solange die Seite noch nicht öffentlich sein soll, bleibt alles wie bisher:

- `robots.txt` enthält `Disallow: /`
- alle drei Seiten tragen `<meta name="robots" content="noindex, nofollow">`

**Zum Freischalten** entfernen Sie diese `meta`-Zeile aus `index.html`,
`geschichte.html` und `vermietung.html` und ändern `robots.txt` auf:

```
User-agent: *
Allow: /
```

Der Admin-Bereich behält seine `noindex`-Angabe in jedem Fall.

## 7. Was mit GitHub geschieht

Das Repository bleibt sinnvoll als Versionsgeschichte und Sicherung. Nur ist
GitHub Pages dann nicht mehr die veröffentlichte Adresse.

- Weiterhin committen und pushen wie bisher.
- GitHub Pages im Repository unter *Settings, Pages* abschalten, damit nicht
  zwei Fassungen im Netz stehen.
- `api/konfig.php` ist über `.gitignore` ausgeschlossen und darf **nie**
  eingecheckt werden. Sie enthält den Passwort-Hash.

Beim Aufspielen einer neuen Fassung laden Sie die geänderten Dateien hoch.
Achten Sie darauf, `data/flaechen.json` und `data/flaechen.js` **nicht** zu
überschreiben, wenn im Admin bereits gepflegte Daten liegen. Sonst verlieren
Sie diese Änderungen.

## 8. Wenn der Hoster nginx statt Apache einsetzt

Die beiden `.htaccess`-Dateien wirken dann nicht. Nehmen Sie stattdessen in die
Serverkonfiguration auf:

```nginx
location ~ ^/api/(konfig|konfig\.beispiel)\.php$ { deny all; }
location ^~ /api/lib/                            { deny all; }
location ^~ /data/sicherungen/                   { deny all; }
location ~ \.log$                                { deny all; }
```

Bei Hostpoint, Infomaniak und Cyon läuft Apache, dort ist nichts zu tun.

## 9. Kurze Prüfliste vor dem Freischalten

- [ ] `https://weberei-russikon.ch` lädt, das Schloss im Browser ist geschlossen
- [ ] `http://` leitet auf `https://` um
- [ ] Vermietungsseite zeigt alle Flächen, Klick öffnet das Detail-Panel
- [ ] Testanfrage kommt bei der Verwaltung an, Antworten geht an den Absender
- [ ] Anmeldung im Admin klappt, eine Änderung erscheint sofort auf der Website
- [ ] `https://weberei-russikon.ch/api/konfig.php` liefert 403 statt Inhalt
- [ ] `https://weberei-russikon.ch/admin/einrichten.php` ist gelöscht oder gesperrt
- [ ] `noindex` entfernt und `robots.txt` angepasst, falls die Seite öffentlich sein soll
