from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth
from ..dependencies import get_db

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

@router.get("/me", response_model=schemas.PortfolioOut)
def get_portfolio(db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    portfolio = db.query(models.Portfolio).filter(models.Portfolio.user_id == user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.post("/update", response_model=schemas.PortfolioOut)
def update_portfolio(portfolio: schemas.PortfolioCreate, db: Session = Depends(get_db), user=Depends(auth.get_current_user)):
    db_portfolio = db.query(models.Portfolio).filter(models.Portfolio.user_id == user.id).first()
    if db_portfolio:
        db_portfolio.holdings = portfolio.holdings
    else:
        db_portfolio = models.Portfolio(user_id=user.id, holdings=portfolio.holdings)
        db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio 