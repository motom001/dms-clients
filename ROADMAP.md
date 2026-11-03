# Fahrplan (Roadmap)

Wie wir entscheiden, welche Clients als Nächstes kommen – und wo du den aktuellen Stand siehst.

**Clients folgen dem DMS:** Ein Client braucht oft erst eine Schnittstelle im DMS (zum Beispiel den Zähler-Endpunkt für die Hausautomatisierung). Was das DMS als Nächstes bekommt, steht in den [Meilensteinen von motom001/dms](https://github.com/motom001/dms/milestones?direction=asc&sort=title&state=open). Die Arbeit an den Clients selbst steht in den [Meilensteinen dieses Repositorys](https://github.com/motom001/dms-clients/milestones?direction=asc&sort=title&state=open) – beide nutzen dieselben Nummern (Clients sind **Etappe 09**). Diese Seite erklärt nur, wie man sie liest; sie wird nicht bei jeder Änderung angepasst.

## Etappen statt Einzelstücke

Zusammengehörige Wünsche werden zu einer **Etappe** gebündelt. Jede Etappe ist ein **Meilenstein** auf GitHub. Sie hat ein klares Ziel, aber keine feste Dauer: Sie ist fertig, wenn alle ihre Issues erledigt sind.

## So liest du die Meilensteine

- **Nummer = Reihenfolge.** `Etappe 09 · …` kommt vor `Etappe 10 · …`. Was weiter hinten steht, ist geplant, aber nicht versprochen.
- **„Später“** sammelt gute Ideen ohne festen Platz in der Reihenfolge.
- **„Zurückgestellt“** sammelt, was bewusst geparkt ist. Die Begründung steht im jeweiligen Issue.
- **Geschlossene Meilensteine** sind erledigt; was eine Version eines Clients enthält, steht in seinem `CHANGELOG.md`.

## Eine Etappe nach der anderen

- Umgesetzt wird nur, was der Maintainer mit dem Label **`freigegeben`** versieht – in der Regel die Issues der aktuellen Etappe.
- Die nächste Etappe ist schon beschrieben und sortiert, wird aber erst freigegeben, wenn die aktuelle fertig ist.
- Korrekturen an einem bestehenden Client (neue Patch-Version) gehen jederzeit dazwischen.

## Wünsche einbringen

Wünsche sind willkommen – als [Issue](https://github.com/motom001/dms-clients/issues/new/choose) im Format einer User Story mit Akzeptanzkriterien. Neue Wünsche werden bewertet und einer Etappe zugeordnet, unter „Später“ einsortiert oder bewusst zurückgestellt. Wünsche an das DMS selbst gehören ins [DMS-Repository](https://github.com/motom001/dms/issues/new/choose).
