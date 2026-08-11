"""create patients table

Revision ID: e2664c4d1557
Revises:
Create Date: 2026-08-10 00:09:57.990183

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e2664c4d1557'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'patients',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('nombres', sa.String(length=150), nullable=False),
        sa.Column('apellidos', sa.String(length=150), nullable=False),
        sa.Column('dni', sa.String(length=12), nullable=False),
        sa.Column('sexo', sa.Enum('masculino', 'femenino', 'otro', name='patient_sex', native_enum=False, length=20), nullable=False),
        sa.Column('fecha_nacimiento', sa.Date(), nullable=False),
        sa.Column('telefono', sa.String(length=20), nullable=False),
        sa.Column('correo', sa.String(length=255), nullable=False),
        sa.Column('direccion', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_patients_dni'), 'patients', ['dni'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_patients_dni'), table_name='patients')
    op.drop_table('patients')
