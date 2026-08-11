from app.db.base import Base  # noqa: F401

# Import all model modules here so their tables register on Base.metadata.
# Used by Alembic autogenerate; do not import from app code that runs at request time.
from app.infrastructure.persistence.models.patient_model import PatientModel  # noqa: F401
from app.infrastructure.persistence.models.evaluation_model import EvaluationModel  # noqa: F401
