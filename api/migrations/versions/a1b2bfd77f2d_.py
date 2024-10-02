"""empty message

Revision ID: a1b2bfd77f2d
Revises: 6abbcc70e44c
Create Date: 2024-04-19 01:49:42.423576

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "a1b2bfd77f2d"
down_revision = "6abbcc70e44c"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "business",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("legal_name", sa.String(length=1000), nullable=True),
        sa.Column("legal_type", sa.String(length=10), nullable=True),
        sa.Column("identifier", sa.String(length=10), nullable=True),
        sa.Column("tax_id", sa.String(length=15), nullable=True),
        sa.Column("nano_id", sa.String(length=25), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("business", schema=None) as batch_op:
        batch_op.create_index(
            batch_op.f("ix_business_identifier"), ["identifier"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_business_legal_name"), ["legal_name"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_business_nano_id"), ["nano_id"], unique=False
        )
        batch_op.create_index(
            batch_op.f("ix_business_tax_id"), ["tax_id"], unique=False
        )

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("business", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_business_tax_id"))
        batch_op.drop_index(batch_op.f("ix_business_nano_id"))
        batch_op.drop_index(batch_op.f("ix_business_legal_name"))
        batch_op.drop_index(batch_op.f("ix_business_identifier"))

    op.drop_table("business")
    # ### end Alembic commands ###
