from sqlalchemy import Boolean, Column, Integer, String, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
import enum

from .database import Base


class RelationType(str, enum.Enum):
    amistad = "amistad"
    amistad_fuerte = "amistad_fuerte"


class Person(Base):
    __tablename__ = "personas"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    curso = Column(String, nullable=False)
    seccion = Column(String, nullable=True)
    foto_url = Column(String, nullable=True)


class Relationship(Base):
    __tablename__ = "relaciones"
    __table_args__ = (
        UniqueConstraint("persona_a_id", "persona_b_id", name="uq_relacion_par"),
    )

    id = Column(Integer, primary_key=True, index=True)
    persona_a_id = Column(Integer, nullable=False, index=True)
    persona_b_id = Column(Integer, nullable=False, index=True)
    tipo = Column(Enum(RelationType), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
