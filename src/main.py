from os import name, stat

from fastapi import FastAPI, Depends, HTTPException, Request, Cookie
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse, FileResponse, JSONResponse, Response

from starlette.routing import request_response

from typing import List, Optional

from sqlalchemy import update
from sqlalchemy.orm import Session

from . import models, schemas
from .database import SessionLocal, engine
from .auth import AuthHandler

###
###
### App init
###
###


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/static", StaticFiles(directory="src/static"), name="static")
templates = Jinja2Templates(directory="src/templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

auth_handler = AuthHandler()

origins = [
    'http://localhost',
    'http://127.0.0.1'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

###
###
### CRUD functions
###
###

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth_handler.get_password_hash(user.password)
    db_user = models.User(username = user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_wine(db: Session, wine: schemas.ItemBase):
    db_wine = models.Item(name=wine.name, description=wine.description, price=wine.price, 
                          country=wine.country, region=wine.region, color=wine.color, style=wine.style)
    db.add(db_wine)
    db.commit()
    db.refresh(db_wine)
    return db_wine

def create_order(db: Session, user: schemas.User, order: schemas.OrderCreate):

    db_order = models.Order(status="Złożone", owner_id=user.id, city=order.city, street=order.street, building_number=order.building_number, contact_number=order.contact_number)
    
    for item in order.items:
          a = models.OrderItemRelation(amount = item.amount)  
          a.item = get_item_by_id(db, item.item)
          db_order.items.append(a)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def cancel_order(db: Session, id: int):
    order = get_order_by_id(db, id)
    order.status = "Anulowano"
    db.commit()
    db.refresh(order)

    return order

def get_order_by_id(db: Session, id: int):
    return db.query(models.Order).filter(models.Order.id == id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.username == email).first()

def get_all_wines(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Item).offset(skip).limit(limit).all()

def get_item_by_id(db: Session, id: int):
    return db.query(models.Item).filter(models.Item.id == id).first()

def get_users_basket_items(db: Session, id: int):
    return db.query(models.Basket).filter(models.Basket.owner_id == id).all()

def add_item_to_basket(db: Session, user: schemas.User, basket: schemas.BasketCreate):
    
    user_baskets = get_users_basket_items(db, user.id)
    db_item = get_item_by_id(db, basket.item_id)
    
    item_found = False

    for b in user_baskets:
        if b.item[0].id == db_item.id:
            b.amount = b.amount + 1
            db_basket = b
            item_found = True
            break

    if not item_found:
        db_basket = models.Basket(owner_id = user.id, amount=1)
        db_basket.item.append(db_item)
        db.add(db_basket)
        db.commit()
        db.refresh(db_basket)
        return db_basket
    else:
        db.commit()
        db.refresh(db_basket)
        return db_basket
    
def delete_item_from_basket(db: Session, user: schemas.User, basket: schemas.BasketCreate):

    db_item = get_item_by_id(db, basket.item_id)
    db_basket = db.query(models.Basket).filter(models.Basket.owner_id == user.id).filter(models.Basket.item.contains(db_item)).first()

    if db_basket.amount > 1:
        db_basket.amount -= 1
        db.commit()
        return 
    else:
        db.query(models.Basket).filter(models.Basket.id == db_basket.id).delete()
        db.commit()
        return

def get_user_orders_db(db: Session, user: schemas.User):
    return db.query(models.Order).filter(models.Order.owner_id == user.id).all()

# def update_basket()

###
###
### Utility
###
###

@app.get('/favicon.ico')
async def favicon():
    favicon_path = 'src/static/favicon.png'
    return FileResponse(path=favicon_path)

###
###
### Logging and registering
###
###

@app.post("/register", response_model=schemas.User)
def user_create(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db=db, user=user)

@app.post('/login/')
def login(auth_details: schemas.AuthDetails, db: Session = Depends(get_db)):
    user = get_user_by_email(db, auth_details.username)
    # return user
    if (user is None) or (not auth_handler.verify_password(auth_details.password, user.hashed_password)):
        raise HTTPException(status_code=401, detail='Invalid username and/or password')
    token = auth_handler.encode_token(user.username) 
    content = { "message": "Successfuly authenticated", "token": token }
    return content

###
###
### User functions
###
###

@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse("index.html", { "request": request, "id": id })

@app.get("/wines/", response_model=List[schemas.Item])
def get_wines(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    wines = get_all_wines(db, skip=skip, limit=limit)
    return wines

@app.get("/showwine/{id}", response_class=HTMLResponse)
async def winepage(request: Request):
    return templates.TemplateResponse("wine.html", { "request": request, "id": id })

@app.get("/wine/{id}", response_model=schemas.Item)
def get_wine(id: int, db: Session = Depends(get_db)):
    wine = get_item_by_id(db, id)
    if (wine is None):
        raise HTTPException(status_code=404, detail="No wine of ID " + str(id) + " found")    
    return wine

@app.get("/orders/", response_model=List[schemas.Order])
def get_user_orders(db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    user = get_user_by_email(db, username)
    return get_user_orders_db(db, user)

@app.post("/order/", response_model=schemas.Order)
def place_order(order: schemas.OrderCreate, db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    user = get_user_by_email(db, username)
    
    placed_order = create_order(db, user, order)

    processed_order = schemas.Order(id=placed_order.id, status=placed_order.status, owner_id=placed_order.owner_id, items=placed_order.items, city=placed_order.city, street=placed_order.street, building_number=placed_order.building_number, contact_number=placed_order.contact_number)
    
    return processed_order

@app.put("/cancelorder/", response_model=schemas.Order)
def cancel_order_endpoint(id: int, db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    user = get_user_by_email(db, username)
    order = get_order_by_id(db, id)

    if user.id != order.owner_id:
        raise HTTPException(status_code=403, detail='User does not have sufficient privileges')
    
    return cancel_order(db, id)

@app.get("/checkorder/{id}", response_model=schemas.Order)
def check_order_endpoint(id: int, db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    user = get_user_by_email(db, username)
    order = get_order_by_id(db, id)

    if user.id != order.owner_id:
        raise HTTPException(status_code=403, detail='User does not have sufficient privileges')   

    return get_order_by_id(db, id)

@app.get("/basket/", response_model=List[schemas.Basket])
def get_basket(db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    user = get_user_by_email(db, username)
    basket_items = get_users_basket_items(db, user.id)
    return basket_items

@app.post("/basket/", response_model=schemas.Basket)
def add_to_basket(item: schemas.BasketCreate, db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    user = get_user_by_email(db, username)
    return add_item_to_basket(db, user, item)

@app.delete("/basket/")
def clear_basket(item: schemas.BasketCreate, db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    user = get_user_by_email(db, username)
    delete_item_from_basket(db, user, item)
    return

###
###
### Admin stuff
###
###

@app.get("/admin/users/")
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    
    user = get_user_by_email(db, username)
    
    if user.is_admin != 1:
        raise HTTPException(status_code=403, detail='User does not have sufficient privileges')
    
    users = get_users(db, skip=skip, limit=limit)
    return users

@app.post("/wines/", response_model=schemas.Item)
def add_wine(wine: schemas.ItemBase, db: Session = Depends(get_db), username = Depends(auth_handler.auth_wrapper)):
    
    user = get_user_by_email(db, username)
    
    if user.is_admin != 1:
        raise HTTPException(status_code=403, detail='User does not have sufficient privileges')

    return create_wine(db, wine)