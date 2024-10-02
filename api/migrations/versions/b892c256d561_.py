"""empty message

Revision ID: b892c256d561
Revises: d979fbe60318
Create Date: 2024-06-17 16:57:33.575944

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'b892c256d561'
down_revision = 'd979fbe60318'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('invitations', schema=None) as batch_op:
        batch_op.add_column(sa.Column('expiration_date', sa.DateTime(timezone=True), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('invitations', schema=None) as batch_op:
        batch_op.drop_column('expiration_date')

    # ### end Alembic commands ###
