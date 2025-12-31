from sqlalchemy.orm import Session
from sqlalchemy import or_

from . import models, schemas


def get_people(db: Session, search: str | None = None):
    query = db.query(models.Person)
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(
            or_(
                models.Person.nombre.ilike(like),
                models.Person.external_id.ilike(like),
            )
        )
    return query.order_by(models.Person.nombre.asc()).all()


def upsert_person(db: Session, person: schemas.PersonCreate):
    existing = db.query(models.Person).filter_by(external_id=person.external_id).first()
    if existing:
        existing.nombre = person.nombre
        existing.curso = person.curso
        existing.seccion = person.seccion
        existing.foto_url = person.foto_url
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing
    new_person = models.Person(**person.model_dump())
    db.add(new_person)
    db.commit()
    db.refresh(new_person)
    return new_person


def normalize_pair(persona_a_id: int, persona_b_id: int) -> tuple[int, int]:
    if persona_a_id == persona_b_id:
        raise ValueError("No se permiten relaciones con la misma persona")
    return (persona_a_id, persona_b_id) if persona_a_id < persona_b_id else (persona_b_id, persona_a_id)


def upsert_relationship(db: Session, rel: schemas.RelationshipCreate):
    a_id, b_id = normalize_pair(rel.persona_a_id, rel.persona_b_id)
    existing = (
        db.query(models.Relationship)
        .filter_by(persona_a_id=a_id, persona_b_id=b_id)
        .first()
    )
    if existing:
        existing.tipo = rel.tipo
        existing.activo = True
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing
    new_rel = models.Relationship(
        persona_a_id=a_id,
        persona_b_id=b_id,
        tipo=rel.tipo,
        activo=True,
    )
    db.add(new_rel)
    db.commit()
    db.refresh(new_rel)
    return new_rel


def list_relationships_for_person(db: Session, person_id: int):
    return (
        db.query(models.Relationship)
        .filter(
            or_(
                models.Relationship.persona_a_id == person_id,
                models.Relationship.persona_b_id == person_id,
            )
        )
        .all()
    )
