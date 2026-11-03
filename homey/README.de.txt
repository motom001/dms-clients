Bringt die Zahlen aus Ablago, deiner selbst gehosteten Dokumentenablage für zu Hause und kleine Betriebe, auf den Homey Pro: neue Post, Zu erledigen, Fälliges in den nächsten 7 Tagen und Überfälliges. Nutze sie auf dem Dashboard und in Flows, zum Beispiel für eine Lampe, die bei neuer Post angeht, oder eine Mitteilung, wenn etwas bald fällig wird.

Nur Homey Pro: Die App spricht direkt mit Ablago in deinem Heimnetz. Homey Cloud erreicht Ablago im Heimnetz nicht.

Voraussetzung ist Ablago ab 0.148.0 und ein API-Schlüssel mit der Stufe „nur Zähler“. Den legst du in Ablago an: Klick oben rechts auf deinen Namen → Mein Konto → Sicherheit → API-Schlüssel. Dieser Schlüssel liest nur Zahlen, nie Titel, Absender oder Dokumente. Ein Schlüssel „nur lesen“ geht auch; einen Schlüssel, der schreiben darf, lehnt die App ab.

Homey fragt Ablago alle 5 Minuten (einstellbar). Hat sich nichts geändert, antwortet Ablago nur mit „nichts Neues“, und es werden keine Daten übertragen. Keine Telemetrie: Die App verbindet sich nur mit der Adresse von Ablago, die du einträgst.
