from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth
from ..dependencies import get_db

router = APIRouter(prefix="/ipo", tags=["ipo"])

@router.post("/bid", response_model=schemas.IPOOut)
def bid_ipo(ipo: schemas.IPOCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    db_ipo = models.IPO(**ipo.dict())
    db.add(db_ipo)
    db.commit()
    db.refresh(db_ipo)
    return db_ipo

@router.get("/list", response_model=list[schemas.IPOOut])
def list_ipos(db: Session = Depends(get_db)):
    return db.query(models.IPO).all() 