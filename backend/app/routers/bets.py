from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth
from ..dependencies import get_db

router = APIRouter(prefix="/bets", tags=["bets"])

@router.post("/place", response_model=schemas.BetOut)
def place_bet(bet: schemas.BetCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    db_bet = models.Bet(user_id=user.id, **bet.dict())
    db.add(db_bet)
    db.commit()
    db.refresh(db_bet)
    return db_bet

@router.get("/active", response_model=list[schemas.BetOut])
def get_active_bets(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    return db.query(models.Bet).filter(models.Bet.user_id == user.id, models.Bet.status == "active").all() 