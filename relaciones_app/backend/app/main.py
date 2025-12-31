from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import csv
from io import StringIO

from .database import SessionLocal, engine
from . import models, schemas, crud

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mapa de Relaciones")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"]
    ,
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/people", response_model=list[schemas.Person])
def list_people(search: str | None = None, db: Session = Depends(get_db)):
    return crud.get_people(db, search=search)


@app.post("/relationships", response_model=schemas.Relationship)
def create_relationship(rel: schemas.RelationshipCreate, db: Session = Depends(get_db)):
    try:
        return crud.upsert_relationship(db, rel)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/relationships", response_model=list[schemas.Relationship])
def list_relationships(person_id: int, db: Session = Depends(get_db)):
    return crud.list_relationships_for_person(db, person_id)


@app.post("/admin/import-csv")
def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(StringIO(content))
    required_fields = {"id", "nombre", "curso", "seccion", "foto_url"}
    if not required_fields.issubset(reader.fieldnames or []):
        raise HTTPException(
            status_code=400,
            detail=f"CSV debe contener columnas: {', '.join(sorted(required_fields))}",
        )

    created = 0
    updated = 0
    errors = []
    for idx, row in enumerate(reader, start=2):
        try:
            person = schemas.PersonCreate(
                external_id=row["id"].strip(),
                nombre=row["nombre"].strip(),
                curso=row["curso"].strip(),
                seccion=row.get("seccion", "").strip() or None,
                foto_url=row.get("foto_url", "").strip() or None,
            )
        except Exception as exc:
            errors.append({"row": idx, "error": str(exc)})
            continue
        existing = db.query(models.Person).filter_by(external_id=person.external_id).first()
        crud.upsert_person(db, person)
        if existing:
            updated += 1
        else:
            created += 1

    return {"created": created, "updated": updated, "errors": errors}
