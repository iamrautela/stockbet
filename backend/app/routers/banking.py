from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth
from ..dependencies import get_db

router = APIRouter(prefix="/banking", tags=["banking"])

@router.post("/kyc", response_model=schemas.KYCOut)
def submit_kyc(kyc: schemas.KYCCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    db_kyc = models.KYC(user_id=user.id, **kyc.dict())
    db.add(db_kyc)
    db.commit()
    db.refresh(db_kyc)
    return db_kyc

@router.get("/transactions", response_model=list[schemas.TransactionOut])
def get_transactions(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    return db.query(models.Transaction).filter(models.Transaction.user_id == user.id).all() 