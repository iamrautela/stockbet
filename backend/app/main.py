from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, bets, banking, ipo, portfolio, market

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(bets.router)
app.include_router(banking.router)
app.include_router(ipo.router)
app.include_router(portfolio.router)
app.include_router(market.router)

@app.get("/")
def read_root():
    return {"message": "StockBet Backend API is running"} 