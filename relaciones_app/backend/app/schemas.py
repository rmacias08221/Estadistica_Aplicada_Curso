from pydantic import BaseModel, HttpUrl
from typing import Optional, List


class PersonBase(BaseModel):
    external_id: str
    nombre: str
    curso: str
    seccion: Optional[str] = None
    foto_url: Optional[HttpUrl] = None


class PersonCreate(PersonBase):
    pass


class Person(PersonBase):
    id: int

    class Config:
        from_attributes = True


class RelationshipBase(BaseModel):
    persona_a_id: int
    persona_b_id: int
    tipo: str


class RelationshipCreate(RelationshipBase):
    pass


class Relationship(RelationshipBase):
    id: int
    activo: bool

    class Config:
        from_attributes = True


class RelationshipList(BaseModel):
    relaciones: List[Relationship]
