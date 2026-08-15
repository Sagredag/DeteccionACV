from __future__ import annotations


class InvalidPredictionInputError(ValueError):
    """El valor de una variable no corresponde al vocabulario que el modelo predictivo conoce."""
