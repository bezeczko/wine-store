from pydantic import BaseModel

from typing import List, Optional

class ItemBase(BaseModel):
    name: str
    description: str
    price: float
    country: str
    region: str
    color: str
    style: str

class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    status: str

class OrderCreate(OrderBase):
    owner_id = int
    items_ids: List[int]

class Order(OrderBase):
    id: int
    items: List[Item] = []
    
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    orders: List[Order] = []

    class Config:
        orm_mode = True

class BasketBase(BaseModel):
    pass

class BasketCreate(BasketBase):
    item_id: int

class Basket(BasketBase):
    owner_id: int
    item: List[Item] = []
    amount: int

    class Config:
        orm_mode = True

class AuthDetails(BaseModel):
    username: str
    password: str