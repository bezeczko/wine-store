from os import stat
from fastapi import FastAPI, Depends, HTTPException
from auth import AuthHandler
from schemas import AuthDetails
from databases import Database

database = Database("sqlite:///store.db")

app = FastAPI()

@app.on_event("startup")
async def database_connect():
    await database.connect()

@app.on_event("shutdown")
async def database_disconnect():
    await database.disconnect()

auth_handler = AuthHandler()

async def get_user(username):
    query = "SELECT * FROM users WHERE email = :username"
    user = await database.fetch_one(query=query, values={"username": username})
    return user

async def add_user(username, hashed_password):
    query = "INSERT INTO users(email, password) VALUES (:username, :hashedpassword)"
    values = [ 
        {"username": username, "hashedpassword": hashed_password}
    ]
    await database.execute_many(query=query, values=values)

@app.post('/register')
async def register(auth_details: AuthDetails):
    user = await get_user(auth_details.username)
    if user is not None:
        raise HTTPException(status_code=400, detail='Username is taken')
    hashed_password = auth_handler.get_password_hash(auth_details.password)
    await add_user(auth_details.username, hashed_password)
    return

@app.post('/login')
async def login(auth_details: AuthDetails):
    user = await get_user(auth_details.username)

    if (user is None) or (not auth_handler.verify_password(auth_details.password, user['password'])):
        raise HTTPException(status_code=401, detail='Invalid username and/or password')
        
    token = auth_handler.encode_token(user['email'])
    
    return {'token': token}

@app.get('/unprotected')
def unprotected():
    return {'hello': 'world'}

@app.get('/protected')
def protected(username = Depends(auth_handler.auth_wrapper)):
    return { 'name': username }

@app.get("/getallusers")
async def getallusers():
    query = "SELECT * FROM users"
    results = await database.fetch_all(query=query)
    return results