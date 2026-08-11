from __future__ import annotations

from uuid import UUID


class EvaluationNotFoundError(Exception):
    def __init__(self, evaluation_id: UUID) -> None:
        self.evaluation_id = evaluation_id
        super().__init__(f'Evaluación {evaluation_id} no encontrada')
