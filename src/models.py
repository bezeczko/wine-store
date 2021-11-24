from operator import index
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Table
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

class OrderItemRelation(Base): 
    __tablename__ = 'orderitemrelation'
    order_id = Column(ForeignKey("orders.id"), primary_key=True)
    item_id = Column(ForeignKey('items.id'), primary_key=True)
    amount = Column(String)
    item = relationship("Item")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    items = relationship("OrderItemRelation")
    status = Column(String, index=True)
    city = Column(String, index=True)
    street = Column(String, index=True)
    building_number = Column(String, index=True)
    contact_number = Column(String, index=True)

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, index=True)
    price = Column(Float, index=True)
    country = Column(String, index=True)
    region = Column(String, index=True)
    color = Column(String, index=True)
    style = Column(String, index=True)

BasketItemRelation = Table('basketitemrelation', Base.metadata,
    Column('basket_id', Integer, ForeignKey("baskets.id")),
    Column('item_id', Integer, ForeignKey('items.id'))    
)

class Basket(Base):
    __tablename__ = "baskets"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    item = relationship("Item", secondary=BasketItemRelation)
    amount = Column(Integer, index=True)

# class Link(Base):
#     __tablename__ = "link"
#     order_id = Column(Integer, ForeignKey("orders.id"), primary_key=True)
#     item_id = Column(Integer, ForeignKey("items.id"), primary_key=True)

