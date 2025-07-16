from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    kyc_status: str
    created_at: datetime.datetime
    class Config:
        orm_mode = True

class BetBase(BaseModel):
    market: str
    amount: float
    direction: str

class BetCreate(BetBase):
    pass

class BetOut(BetBase):
    id: int
    user_id: int
    status: str
    created_at: datetime.datetime
    class Config:
        orm_mode = True

class TransactionBase(BaseModel):
    type: str
    amount: float

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    user_id: int
    status: str
    created_at: datetime.datetime
    class Config:
        orm_mode = True

class KYCBase(BaseModel):
    document_type: str
    document_number: str

class KYCCreate(KYCBase):
    pass

class KYCOut(KYCBase):
    id: int
    user_id: int
    status: str
    submitted_at: datetime.datetime
    class Config:
        orm_mode = True

class IPOBase(BaseModel):
    name: str
    price: float
    available_shares: int

class IPOCreate(IPOBase):
    pass

class IPOOut(IPOBase):
    id: int
    created_at: datetime.datetime
    class Config:
        orm_mode = True

class PortfolioBase(BaseModel):
    holdings: str

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioOut(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    class Config:
        orm_mode = True

class MarketDataBase(BaseModel):
    symbol: str
    price: float

class MarketDataOut(MarketDataBase):
    id: int
    timestamp: datetime.datetime
    class Config:
        orm_mode = True 