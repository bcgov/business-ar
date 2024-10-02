"""empty message

Revision ID: 5bb17da90971
Revises: a1b2bfd77f2d
Create Date: 2024-04-23 20:50:57.431431

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "5bb17da90971"
down_revision = "a1b2bfd77f2d"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "filing",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("fiscal_year", sa.Integer(), nullable=False),
        sa.Column(
            "filing_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True
        ),
        sa.Column(
            "filing_date",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("completion_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("invoice_id", sa.Integer(), nullable=True),
        sa.Column("payment_status_code", sa.String(length=50), nullable=True),
        sa.Column("payment_completion_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("business_id", sa.Integer(), nullable=True),
        sa.Column("submitter_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["business_id"],
            ["business.id"],
        ),
        sa.ForeignKeyConstraint(
            ["submitter_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("filing")
    # ### end Alembic commands ###
