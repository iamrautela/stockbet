from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, models
from ..dependencies import get_db

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/data", response_model=list[schemas.MarketDataOut])
def get_market_data(db: Session = Depends(get_db)):
    return db.query(models.MarketData).all()

@router.post("/add", response_model=schemas.MarketDataOut)
def add_market_data(data: schemas.MarketDataBase, db: Session = Depends(get_db)):
    db_data = models.MarketData(**data.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data 