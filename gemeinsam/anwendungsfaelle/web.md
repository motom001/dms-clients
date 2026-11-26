# Anwendungsfälle im Browser

Gilt für die Weboberfläche von Ablago am Computer, am Tablet und am Handy. Die Fälle heißen **W1 bis W41** und knüpfen an die Fälle der Apps an (1–24, siehe [README.md](README.md)). Personas wie dort.

**Stand:** 26.11.2026 · Entwürfe, keine Zusage. Fälle, die es in Ablago noch nicht gibt, sind mit *(geplant)* markiert. Alle Namen, Firmen, Adressen und Nummern sind erfunden.

## Inhalt

1. [Grundsätze: Computer, Tablet, Handy](#grundsätze-computer-tablet-handy)
2. [Übergänge zwischen App und Browser](#übergänge-zwischen-app-und-browser)
3. [Die Fälle](#die-fälle)
4. [Matrix: Fall × Persona](#matrix)
5. [Je Persona](#je-persona)
6. [Werkbank am Handy](#werkbank-am-handy)
7. [Barrierefreiheit prüfen](#barrierefreiheit-prüfen)

## Grundsätze: Computer, Tablet, Handy

- **Der Computer ist der Arbeitsplatz:** einrichten, verwalten, in Mengen ordnen, auswerten, gesammelt weitergeben. Genau diese Grenze ziehen auch die Fälle der Apps („Dafür gibt es den Browser …“).
- **Am Handy ersetzt der Browser die App, wo es keine gibt.** Markus, Jonas, Herr Özdemir und die Werkstatt der Tischlerei haben Android. Bis es eine Android-App gibt, ist die mobile Weboberfläche für sie *die* App. Deshalb brauchen die Kernfälle der Apps (fotografieren, nachschlagen, vorzeigen, Zu erledigen, Zählerstand) ein Gegenstück im mobilen Browser.
- **Nach Breite, nicht nach Gerät:** Ein schmales Fenster bekommt die Handy-Ansicht. Ein Tablet (quer, hochkant ab etwa 768 px) bekommt die volle Ansicht. Für Petra, die nur iPhone und iPad hat, ist das iPad der Rechner.
- **Verwaltung am Handy wird nicht verboten, sondern gestaltet.** Der Server kann ein Handy nicht sicher von einem schmalen Fenster unterscheiden, und „Desktop-Website anfordern“ umgeht jede Sperre. Ziel: alles erreichbar und nichts kaputt, mit einem klaren Schwerpunkt auf dem, was man unterwegs wirklich braucht (siehe [Werkbank am Handy](#werkbank-am-handy)).
- **Ohne Bildschirm:** Scanner, Eingangsordner, Laufwerk (SMB/WebDAV) und Postfach führen alle in „Neue Post“. In der Weboberfläche sieht man, was angekommen ist und was hängt.

## Übergänge zwischen App und Browser

- Foto in der App (Fall 1) → am Laptop in „Neue Post“ zuordnen (W7), wenn es mehr Ruhe braucht.
- Verwaltungsmodus am Computer beginnen (W34) → am iPhone bestätigen (Fall 17).
- App verbinden: Code im Browser (W28) → in der App scannen (Fälle 23, 24).
- Mitteilung am Handy (Fall 11) → der Link öffnet dieselbe Mappe im Browser, falls die App fehlt.
- Nur in der App: offline dabei (Fall 9), Widget (14), Siri (20), Kalender des Handys (12). Ein Kalender-Abo im Browser gibt es nicht.

## Die Fälle

Je Fall: Ansicht (Computer, Handy, beides, ohne Bildschirm, E-Mail) und der passende Fall der Apps.

### Hereinholen

- **W1 · Dateien ablegen** (Computer; App 2) – Lena zieht die Online-Rechnung vom Schreibtisch ins Browserfenster. Mehrere Dateien auf einmal werden eine Post.
- **W2 · Im Browser fotografieren** (Handy; App 1) – Jonas hat ein günstiges Android ohne App. Er fotografiert das Zeugnis über „+ Neu → Kamera“ im Browser.
- **W3 · Scanner legt in den Eingangsordner** (ohne Bildschirm) – Die Tischlerei scannt am Bürogerät „an Ablago“. Die Datei landet im Eingangsordner der Büroleitung und wird Post.
- **W4 · E-Mails aus dem Postfach** (Computer; App 4) – Katrin leitet Rechnungen an ein eigenes Postfach weiter. Ablago holt sie ab, die Anhänge werden Dokumente der Post.
- **W5 · Laufwerk: ablegen und blättern** (Computer) – Herr Özdemir zieht im Windows-Explorer die Handwerkerrechnung in „Neue Post“ und blättert dort in seinen Objekten.
- **W6 · Zuspieler aus Diensten** *(zurückgestellt)* (ohne Bildschirm) – Ablago holt Belege selbst aus einem Kundenportal oder Cloud-Speicher.

### Ordnen

- **W7 · Neue Post zuordnen** (beides; App 13) – Lena öffnet „Neue Post“, ordnet den Brief der Versicherung einer Mappe zu oder legt eine neue an.
- **W8 · Aus Dokument ausfüllen** (Computer; App 1) – Ablago schlägt Absender, Rechnungsnummer und Betrag vor. Lena bestätigt nur noch.
- **W9 · Dokument bearbeiten** (Computer) – Petra schwärzt im Arztbrief die Versichertennummer, bevor sie ihn weitergibt. Katrin trennt einen Sammelscan in drei Belege.
- **W10 · Wert eintragen (Zählerstand)** (Handy; App 18) – Herr Özdemir steht im Keller von Haus A und trägt im Handy-Browser die Zählerstände der sechs Wohnungen ein.
- **W41 · Von der Post zur fertigen Mappe (mit Paketen)** (beides; App 1, 13) – Markus lädt den Scan der Wartungsrechnung hoch. Texterkennung, PDF/A und die lokale KI machen daraus ein durchsuchbares Dokument mit Vorschlägen. Er übernimmt sie und legt das Dokument an die Heizung.

### Finden

- **W11 · Schnell suchen, Frag deine Ablage** (beides; App 7, 20) – „Wann läuft der Handyvertrag aus?“ Lena tippt es oben ein und bekommt die Mappe mit der Kündigungsfrist.
- **W12 · Erweiterte Suche** (Computer) – Herr Özdemir sucht alle Rechnungen von Handwerkern für Haus B aus 2025.
- **W13 · Ansichten und Favoriten** (beides; App 7) – Markus klickt links „Haus → Wartungen“, Petra hat „Mama“ als Favorit oben.
- **W14 · Mappe mit allem, was dazugehört** (Computer; App 10) – Markus öffnet die Heizung und sieht Angebot, Wartungsvertrag, alle Wartungen – und dass der Kaufbeleg fehlt. Der Lebenslauf ist Teil der Mappe, kein eigener Bereich.
- **W15 · Dokument ansehen und zeigen** (beides; App 8) – Petra zeigt beim Pflegedienst den Bescheid auf dem iPad. Jonas öffnet sein Zeugnis im Browser.

### Erledigen

- **W16 · Zu erledigen abarbeiten** (beides; App 13) – Lena arbeitet morgens „Zu erledigen“ ab: als Liste, Monat oder Jahr. Erledigtes verschwindet.
- **W17 · Aufgabe zuweisen, weiterleiten** (beides; App 13) – Petra gibt „Widerspruch Pflegegrad schreiben“ an ihren Bruder Jan, mit Frist.
- **W18 · Abwesenheit und Vertretung** (Computer) – Die Büroleiterin geht in Urlaub. Ihre Aufgaben gehen zwei Wochen lang an die Vertretung.
- **W19 · Notiz und Erwähnung** (beides; App 19) – „@Jan bitte unterschreiben“ in der Notiz an der Vollmacht. Jan bekommt eine Aufgabe.
- **W20 · Fristen und Erinnerungen** (beides; App 11, 12) – Lena sieht an der Waschmaschine „Ablago erinnert dich 4 Wochen vor Garantie bis“.
- **W21 · Tägliche Zusammenfassung** (E-Mail; App 11) – Jeden Morgen eine Mail: drei Dinge zu erledigen, eine Frist diese Woche.
- **W39 · Papierkorb** (beides) – Lena hat die falsche Rechnung gelöscht und holt sie aus dem Papierkorb zurück.
- **W40 · Drucken** (Computer) – Herr Özdemir druckt die Handwerkerrechnung für den Mieterordner aus.

### Weitergeben

- **W22 · Einzelnes Dokument weitergeben** (beides; App 21) – Katrin schickt dem Kunden die Rechnung per E-Mail aus Ablago, mit dem Stempel „Kopie“.
- **W23 · Sammel-Weitergabe** (Computer) – Katrin gibt der Steuerberatung alle Belege des Quartals als ZIP – ein Klick statt vierzig.
- **W24 · Auswertung und Summen** (Computer) – Herr Özdemir summiert die Nebenkosten von Haus A für die Abrechnung.
- **W25 · Export für Prüfung und Umzug** (Computer) – Katrin erstellt den Export für die Betriebsprüfung. Markus macht den Vollexport für sein Archiv.

### Einrichten

- **W26 · Erste Einrichtung** (Computer; vor App 23) – Lena geht durch den Assistenten: Ablage benennen, festlegen, was Ablago von sich aus darf, Notfallblatt drucken. Ablago wählt die passenden Pakete selbst; Lena sieht die Auswahl und kann sie ändern *(Auswahl durch Ablago geplant)*.
- **W27 · Personen einladen, Rollen** (Computer) – Lena lädt Tom und Jonas ein. Jonas sieht nur seine Mappen.
- **W28 · App verbinden** *(geplant)* (beides; App 23, 24) – Am Laptop zeigt Ablago einen Code, das iPhone scannt ihn – fertig verbunden.
- **W29 · Mappentypen und Ansichten bauen** (Computer) – Markus baut den Mappentyp „Anlage“ mit Abschnitten und eine Ansicht „Alles mit Wartung“.
- **W30 · Berechtigungen und Testlauf** (Computer) – Markus legt fest: Post sieht nur, für wen sie ist. Der Testlauf zeigt die Ablage mit Jonas’ Augen.
- **W31 · Automatisierungen** (Computer) – Markus lässt neue Rechnungen von Kessler automatisch der Heizung zuordnen.

### Betreiben

- **W32 · Sicherung und Wiederherstellen** (Computer; App 15) – Lena schaltet den Zeitplan ein. Markus spielt nach dem Tausch des NAS die Sicherung ein.
- **W33 · Meldungen in der Werkbank** (Computer; App 15, 16) – Die Übersicht meldet: E-Mail-Versand fehlt, Eingangsordner voll, Texterkennung fehlgeschlagen.
- **W34 · Verwalten, Notfallzugang** (Computer; App 16, 17) – Markus beginnt den Verwaltungsmodus und bestätigt ihn am iPhone. Lena kommt mit dem Notfallblatt wieder hinein.
- **W35 · Datenschutz und Aufbewahrung** (Computer) – Die Tischlerei beantwortet eine Auskunftsanfrage und löscht, was die Aufbewahrungsfrist überschritten hat.
- **W36 · Updates und Systemzustand** (Computer) – Der IT-Dienstleister der Tischlerei prüft Version, Speicher und Sicherungsampel.

### Persönlich

- **W37 · Mein Konto** (beides; Menü der App) – Lena richtet Zwei-Faktor ein, Markus legt einen API-Schlüssel für Homey an.
- **W38 · Mehrere Ablagen wechseln** *(geplant)* (Computer; App 22) – Petra wechselt zwischen ihrer Ablage und der ihrer Mutter, Katrin zwischen Büro und Privat.

## Matrix

● = braucht es dort vor allem · ○ = nutzt es auch

| # | Fall | Ansicht | App | Lena | Jonas | Markus | Petra | Herr Özdemir | Katrin | Brandt |
|---|---|---|---|---|---|---|---|---|---|---|
| W1 | Dateien ablegen | Computer | 2 | ● |  | ○ | ● | ● | ● | ● |
| W2 | Im Browser fotografieren | Handy | 1 | ○ | ● | ○ | ○ | ● | ○ | ○ |
| W3 | Scanner legt in den Eingangsordner | ohne Bildschirm | – | ○ |  | ● | ○ | ● | ● | ● |
| W4 | E-Mails aus dem Postfach | Computer | 4 | ○ |  | ● |  | ● | ● | ● |
| W5 | Laufwerk: ablegen und blättern | Computer | – | ○ |  | ● |  | ● | ○ | ● |
| W6 | Zuspieler aus Diensten *(zurückgestellt)* | ohne Bildschirm | – | ○ |  | ○ |  | ○ | ○ |  |
| W7 | Neue Post zuordnen | beides | 13 | ● | ○ | ● | ● | ● | ● | ● |
| W8 | Aus Dokument ausfüllen | Computer | 1 | ● |  | ● | ○ | ● | ● | ● |
| W9 | Dokument bearbeiten | Computer | – | ○ |  | ○ | ● | ○ | ○ | ● |
| W10 | Wert eintragen (Zählerstand) | Handy | 18 | ○ |  | ○ |  | ● |  |  |
| W41 | Von der Post zur fertigen Mappe | beides | 1, 13 | ● | ○ | ● | ● | ● | ● | ● |
| W11 | Schnell suchen, Frag deine Ablage | beides | 7, 20 | ● | ● | ● | ● | ● | ● | ● |
| W12 | Erweiterte Suche | Computer | – | ○ |  | ● |  | ● | ● | ● |
| W13 | Ansichten und Favoriten | beides | 7 | ● | ● | ● | ● | ● | ● | ● |
| W14 | Mappe mit allem, was dazugehört | Computer | 10 | ● |  | ● | ○ | ● | ○ | ○ |
| W15 | Dokument ansehen und zeigen | beides | 8 | ● | ● | ○ | ● | ○ | ○ |  |
| W16 | Zu erledigen abarbeiten | beides | 13 | ● | ● | ● | ● | ● | ● | ● |
| W17 | Aufgabe zuweisen, weiterleiten | beides | 13 | ● |  | ○ | ● | ○ | ○ | ● |
| W18 | Abwesenheit und Vertretung | Computer | – | ○ |  |  | ● |  | ○ | ● |
| W19 | Notiz und Erwähnung | beides | 19 | ○ |  | ○ | ● | ○ | ○ | ● |
| W20 | Fristen und Erinnerungen | beides | 11, 12 | ● |  | ● | ● | ● | ● | ○ |
| W21 | Tägliche Zusammenfassung | E-Mail | 11 | ○ |  |  | ● | ○ | ● | ● |
| W39 | Papierkorb | beides | – | ● | ○ | ○ | ○ | ○ | ○ | ● |
| W40 | Drucken | Computer | – | ○ |  |  | ● | ● | ○ | ● |
| W22 | Einzelnes Dokument weitergeben | beides | 21 | ○ |  |  | ● | ● | ● | ● |
| W23 | Sammel-Weitergabe | Computer | – |  |  | ○ |  | ● | ● | ● |
| W24 | Auswertung und Summen | Computer | – |  |  | ○ |  | ● | ● | ○ |
| W25 | Export für Prüfung und Umzug | Computer | – |  |  | ○ |  |  | ● | ● |
| W26 | Erste Einrichtung | Computer | vor 23 | ● |  | ● | ● | ● | ● | ● |
| W27 | Personen einladen, Rollen | Computer | – | ● |  | ● | ● |  | ○ | ● |
| W28 | App verbinden *(geplant)* | beides | 23, 24 | ● | ● | ● | ● | ● | ● | ● |
| W29 | Mappentypen und Ansichten bauen | Computer | – |  |  | ● |  | ○ | ○ | ● |
| W30 | Berechtigungen und Testlauf | Computer | – |  |  | ● | ● |  | ○ | ● |
| W31 | Automatisierungen | Computer | – |  |  | ● |  |  | ○ | ○ |
| W32 | Sicherung und Wiederherstellen | Computer | 15 | ● |  | ● | ● | ● | ● | ● |
| W33 | Meldungen in der Werkbank | Computer | 15, 16 | ○ |  | ● |  |  | ○ | ● |
| W34 | Verwalten, Notfallzugang | Computer | 16, 17 | ○ |  | ● |  |  |  | ● |
| W35 | Datenschutz und Aufbewahrung | Computer | – |  |  | ○ |  |  | ● | ● |
| W36 | Updates und Systemzustand | Computer | – |  |  | ● |  |  |  | ● |
| W37 | Mein Konto | beides | Menü | ○ | ○ | ● | ○ | ○ | ○ | ○ |
| W38 | Mehrere Ablagen wechseln *(geplant)* | Computer | 22 |  |  | ● | ● | ○ | ● |  |

## Je Persona

**Lena** (Einsteigerin, Laptop und iPhone): Richtet einmal am Laptop ein (W26), verbindet die App (W28) und lädt Tom und Jonas ein (W27). Danach fotografiert sie mit der App, ordnet am Wochenende am Laptop in Ruhe zu (W7, W8) und arbeitet „Zu erledigen“ ab (W16). Die Werkbank sieht sie nur, wenn die Übersicht etwas meldet. *Prüffrage:* Kommt sie ohne Handbuch durch den Assistenten, und versteht sie die Sicherung?

**Jonas** (16, günstiges Android, keine App): Alles im Handy-Browser. Er fotografiert ein Zeugnis (W2), findet seine Mappen (W13, W15) und sieht nur, was für ihn freigegeben ist. *Prüffrage:* Ist die Handy-Ansicht so einfach, dass er sie ohne Erklärung nutzt – und sieht er wirklich nichts anderes?

**Markus** (technikaffin, Android, NAS): Baut am Computer Mappentypen, Rechte mit Testlauf und Automatisierungen (W29–W31), lässt den Scanner in den Eingangsordner legen (W3) und verfolgt den Lebenslauf der Heizung (W14). Unterwegs nutzt er den Handy-Browser. *Prüffrage:* Findet er die Lücke „Kaufbeleg fehlt“, und übersteht die Verwaltung seinen Spieltrieb ohne Schaden?

**Petra** (sorgt mit Jan und Tim für die Mutter, iPhone und iPad): Zwei Ablagen (W38), Aufgaben mit Frist an die Brüder (W17), Notiz mit Erwähnung an der Vollmacht (W19), den Arztbrief schwärzen, bevor sie ihn weitergibt (W9). Das iPad ist ihr Rechner. *Prüffrage:* Ist immer klar, in welcher Ablage sie gerade ist und wer eine Aufgabe hat?

**Herr Özdemir** (sechs Wohnungen, Windows-PC, Android): Legt über das Laufwerk im Explorer ab (W5), sucht mit der erweiterten Suche (W12), trägt Zählerstände im Keller im Handy-Browser ein (W10) und summiert die Nebenkosten (W24). *Prüffrage:* Reicht die Auswertung für die Nebenkostenabrechnung, oder kopiert er doch in eine Tabelle?

**Katrin** (Grafikerin, Mac, iPhone, Büro und Privat): Rechnungen über das Postfach (W4), einzeln mit Stempel weitergeben (W22), das Quartal gesammelt an die Steuerberatung (W23), Wechsel zwischen Büro und Privat (W38). *Prüffrage:* Schafft sie das Quartal in unter zehn Minuten?

**Tischlerei Brandt** (12 Mitarbeitende, Windows, Microsoft 365, robustes Android in der Werkstatt): Das Bürogerät scannt in den Eingangsordner (W3), die Werkstatt fotografiert im Handy-Browser an eine Auftragsmappe (W2), die Büroleitung verteilt und vertritt (W17, W18), der IT-Dienstleister betreibt (W32–W36). *Prüffrage:* Funktioniert die Arbeitsteilung, ohne dass jeder alles sieht?

## Werkbank am Handy

Umsetzung in [dms #1204](https://github.com/motom001/dms/issues/1204), [#1291](https://github.com/motom001/dms/issues/1291), [#1292](https://github.com/motom001/dms/issues/1292) und [#1252](https://github.com/motom001/dms/issues/1252).

- **Nichts gesperrt:** Am Handy setzt die Werkbank einen Schwerpunkt. Alle Bereiche bleiben unter „Alle Bereiche“ erreichbar.
- **Heikle Handlungen werden am Handy genauso geprüft wie am Rechner** (frische Anmeldung, bequem per Face ID oder Passkey).

**Am Handy voll bedienbar** (für alle Zielgruppen gleich)

| Was | Fälle |
|---|---|
| Nachsehen, ob alles läuft: Übersicht, Systemzustand mit Auslastung, letzte Sicherung, gemeldete Fehler | W33, W36 |
| Auf eine Meldung reagieren („Sicherung fehlgeschlagen“ → erneut versuchen) | W32, W33 |
| Sofort-Aktionen: Sicherung jetzt, Postfach jetzt abrufen, Wartungsmodus an/aus | W32, W36 |
| Benutzer anlegen („auf Zuruf“), sperren (Handy verloren), Sitzungen beenden, Link zum Passwort | W27 |
| Notfall: Notfallzugang, Verwaltung bestätigen | W34 |
| Pakete aus dem Katalog installieren | W26 |

**Erreichbar, aber am Rechner oder Tablet bequemer:** Pakete einstellen, Mappentypen und Ansichten (W29), Berechtigungen (W30), Automatisierungen (W31), Datenschutz (W35), Stempel.

**Nicht Werkbank:** eine Mappe aus dem Papierkorb holen (W39) gehört zur Ablage und geht am Handy schon.

## Barrierefreiheit prüfen

Barrierefreiheit ist kein eigener Fall, sondern eine Prüfung quer über die Fälle:

- automatisch: axe-core (WCAG 2 A/AA) bei jedem Schritt der Fälle
- Tastatur: jeden Fall einmal nur mit Tab, Enter und Esc
- Zoom 200 % am Computer für drei Kernfälle (W7, W16, W22)
- 10 Minuten VoiceOver am iPhone für W11 und W16
