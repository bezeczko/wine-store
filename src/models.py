from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Table
from sqlalchemy.orm import relationship

from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)

    orders = relationship("Order")

OrderItemRelation = Table('orderitemrelation', Base.metadata,
    Column('order_id', Integer, ForeignKey("orders.id")),
    Column('item_id', Integer, ForeignKey('items.id'))    
)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    items = relationship("Item", secondary=OrderItemRelation)
    status = Column(String, index=True)

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

# class Link(Base):
#     __tablename__ = "link"
#     order_id = Column(Integer, ForeignKey("orders.id"), primary_key=True)
#     item_id = Column(Integer, ForeignKey("items.id"), primary_key=True)

