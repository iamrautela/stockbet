from fastapi import FastAPI
from .routers import users, bets, banking, ipo, portfolio, market

app = FastAPI()

app.include_router(users.router)
app.include_router(bets.router)
app.include_router(banking.router)
app.include_router(ipo.router)
app.include_router(portfolio.router)
app.include_router(market.router)

@app.get("/")
def read_root():
    return {"message": "StockBet Backend API is running"} 