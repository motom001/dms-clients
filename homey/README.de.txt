Bringt die Zahlen aus deinem selbst gehosteten DMS (Dokumentenmanagement für Haushalte) auf den Homey Pro: neue Post, Zu erledigen, Fristen in den nächsten 7 Tagen und Überfälliges. Nutze sie auf dem Dashboard und in Flows, zum Beispiel für eine Lampe, die bei neuer Post angeht, oder eine Mitteilung, wenn eine Frist ansteht.

Nur Homey Pro: Die App spricht direkt mit dem DMS in deinem Heimnetz. Homey Cloud erreicht ein DMS im Heimnetz nicht.

Voraussetzung ist DMS ab 0.148.0 und ein API-Schlüssel der Stufe „nur Zähler“, den du im DMS unter Profil > Sicherheit > API-Schlüssel anlegst. Dieser Schlüssel liest nur Zahlen, nie Titel, Absender oder Dokumente. Ein Schlüssel „nur lesen“ geht auch; einen Schlüssel, der schreiben darf, lehnt die App ab.

Homey fragt das DMS alle 5 Minuten (einstellbar). Hat sich nichts geändert, antwortet das DMS nur mit „nichts Neues“, und es werden keine Daten übertragen. Keine Telemetrie: Die App verbindet sich nur mit der DMS-Adresse, die du einträgst.
