"""Python-Client für Ablago, die selbst gehostete Dokumentenablage für zu Hause und kleine Betriebe.

Einstieg::

    from ablago import AblagoClient

Die vollständige API steht im erzeugten Teil ``ablago.api`` (Zusatz ``pip install "ablago[api]"``).
"""

from __future__ import annotations

from importlib.metadata import PackageNotFoundError, version

from .client import AblagoClient
from .exceptions import AblagoAuthError, AblagoConnectionError, AblagoError, AblagoSSLError
from .models import Gesundheit, Zaehlerstand

try:
    __version__ = version("ablago")
except PackageNotFoundError:  # nicht installiert, z. B. direkt aus dem Quellordner
    __version__ = "0.0.0"

__all__ = [
    "AblagoAuthError",
    "AblagoClient",
    "AblagoConnectionError",
    "AblagoError",
    "AblagoSSLError",
    "Gesundheit",
    "Zaehlerstand",
    "__version__",
]
