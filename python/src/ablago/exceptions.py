"""Fehler des Ablago-Clients.

Alle Fehler erben von :class:`AblagoError`. So fängt ein Aufrufer mit einer Zeile alles ab, was aus der Verbindung
zu Ablago kommt, und unterscheidet bei Bedarf genauer – Home Assistant braucht genau diese Unterscheidung, um
„Schlüssel neu eingeben“ von „später noch einmal versuchen“ zu trennen.
"""

from __future__ import annotations


class AblagoError(Exception):
    """Gemeinsame Oberklasse für alle Fehler dieses Clients."""

    def __init__(self, message: str, *, status: int | None = None) -> None:
        super().__init__(message)
        #: HTTP-Status der Antwort, wenn es eine gab.
        self.status = status


class AblagoAuthError(AblagoError):
    """Der API-Schlüssel ist falsch, abgelaufen, widerrufen oder hat für diese Abfrage kein Recht (401/403).

    Erneut versuchen hilft nicht – der Schlüssel muss ersetzt werden.
    """


class AblagoConnectionError(AblagoError):
    """Ablago ist nicht erreichbar: falsche Adresse, Netz weg, Zeitüberschreitung oder Ablago antwortet mit 5xx.

    Meist vorübergehend – später noch einmal versuchen.
    """


class AblagoSSLError(AblagoConnectionError):
    """Das Zertifikat von Ablago passt nicht (abgelaufen, selbst signiert, anderer Name).

    Erbt von :class:`AblagoConnectionError`, damit ein Aufrufer, der nur „nicht erreichbar“ unterscheidet,
    auch diesen Fall abfängt.
    """
