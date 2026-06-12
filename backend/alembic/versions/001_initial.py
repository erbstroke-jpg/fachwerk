"""initial schema (matches models.py: property_type, tg_message_id, source=web/admin)

Revision ID: 001
Revises: 
Create Date: 2026-06-11
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def enum_exists(name):
    result = op.get_bind().execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = :name"), {"name": name}
    )
    return result.fetchone() is not None


def upgrade():
    conn = op.get_bind()

    # Users
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT now()
        )
    """))

    # Enums (safe idempotent)
    if not enum_exists('propertytype'):
        conn.execute(sa.text("CREATE TYPE propertytype AS ENUM ('villa', 'cottage')"))
    if not enum_exists('bookingstatus'):
        conn.execute(sa.text("CREATE TYPE bookingstatus AS ENUM ('pending', 'confirmed', 'cancelled', 'blocked')"))
    if not enum_exists('bookingsource'):
        conn.execute(sa.text("CREATE TYPE bookingsource AS ENUM ('web', 'admin')"))

    # Bookings
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            property_type propertytype NOT NULL DEFAULT 'villa',
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            guests_count INTEGER NOT NULL,
            guest_name VARCHAR(200) NOT NULL,
            guest_phone VARCHAR(50) NOT NULL,
            arrival_time TIME,
            status bookingstatus NOT NULL DEFAULT 'pending',
            source bookingsource NOT NULL DEFAULT 'web',
            comment TEXT,
            tg_message_id INTEGER,
            created_at TIMESTAMP NOT NULL DEFAULT now(),
            updated_at TIMESTAMP NOT NULL DEFAULT now()
        )
    """))

    # Indexes
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_bookings_check_in ON bookings(check_in)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_bookings_check_out ON bookings(check_out)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_bookings_status ON bookings(status)"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS ix_users_email ON users(email)"))


def downgrade():
    op.drop_table('bookings')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS bookingstatus')
    op.execute('DROP TYPE IF EXISTS bookingsource')
    op.execute('DROP TYPE IF EXISTS propertytype')
