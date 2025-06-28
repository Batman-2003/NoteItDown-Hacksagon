import sqlite3

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import json

api = FastAPI()

# Types/Formats
class CredentialsH(BaseModel):
    username: str
    password: str



# DB

def init_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            passHsh TEXT
        );
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS files(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            filename TEXT,
            timestamp TEXT,
            data TEXT
        );
    """)

    conn.commit()
    conn.close()

init_db()






# Authentication

SECRET_KEY = "MOST-SECRET-KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(password, hashedPassword):
    return pwd_context.verify(password, hashedPassword)

def authenticate_user(username: str, password: str):
    # TODO: user in users table -> pick username + passHash
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # TODO: Optimize {TRY ATLEAST !!!!!} ... will need to add some err handling before
    cursor.execute(f"""
            SELECT * FROM users;
    """)
    # conn.commit()

    rows = cursor.fetchall()
    conn.close()

    USERNAME_COLUMN_INDEX = 1
    passHsh = None
    if len(rows) > 0:
        for row in rows:
            if row[USERNAME_COLUMN_INDEX] == username:
                passHsh = row[USERNAME_COLUMN_INDEX+1]
                break

    else:
        return {"Error": "User not registered"}
    

    # user = {
    #     "username": username,
    #     "passwordHash": pwd_context.hash(username)
    # } 

    user = {
        "username": username,
        "passwordHash": passHsh
    }

    if not user or not verify_password(password, user["passwordHash"]):
        return None
    return user

# TODO: take the entire request and pull token from header and convert body to dict
# ? Learning
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    # expire = datetime.now(datetime.timezone.utc) + (expires_delta or timedelta(minutes=15))
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)











# Routing

@api.post('/signup')
# TODO: add graceful error handling for failing UNIQUE Constraint
def signup(signUp: CredentialsH):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # cursor.execute("INSERT INTO users (name, passHsh) VALUES (?, ?)", (signUp.username, str(bcrypt.hashpw(bytes(signUp.password, "UTF-8"), bcrypt.gensalt()))))
    cursor.execute("INSERT INTO users (username, passHsh) VALUES (?, ?)", (signUp.username, pwd_context.hash(signUp.password)))
    conn.commit()
    conn.close()

    return f"{signUp.username} Registered Successfully"

@api.post("/login")
def login(form_data: CredentialsH):
    # return {"msg": "msg"}
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username password"
        )
    access_token = create_access_token(data={"sub": user["username"]})  # ? Learning
    return {"access_token": access_token, "token_type": "bearer"}


class MyFileObject(BaseModel):
    fileId: int
    username: str
    filename: str
    filedata: str
    timestamp: str


# # TODO: "/application"
# @api.post("/application/{userName}")
# def read_protected(token: str = Depends(oauth2_scheme), userName: str = ""):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username = payload.get("sub")
#         if username is None:
#             raise HTTPException(status_code=401, detail="Invalid token")
#     except JWTError:
#             raise HTTPException(status_code=401, detail="Invalid token")
    
#     # TODO: Find all files of 
#     return {"message": f"Hello, {username} / {userName}. Thou are allowed to proceed!"}

# TODO: "/application"
@api.post("/application/{userName}")
async def read_protected(request: Request):
    # Reading Message Headers
    print((request.url.__str__()).split("/")[-1])
    token = request.headers.get("authorization").split()[1]
    

    # Reading Message Body
    body = await request.body()
    bodyDict = json.loads(body.decode())
    # TODO: get username, filedata, filename from body




    # JWT Decoding
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

'''
    # Update routine
    cursor.execute(f"""
        INSERT INTO files(filedata, filename, username) VALUES('{filedata}', '{filename}', '{username}');
    """)
    conn.close()
    return {"resp": "Updated Data"}
'''



    
'''
    # Update routine
    # TODO: get username, filedata, filename from body
    filedata = None
    cursor.execute(f"""
        UPDATE files SET filedata='{filedata}' WHERE username='{username}' AND filename='{filename}';
    """)
    conn.close()
    return {"resp": "Updated Data"}
'''


'''
    # Read routine
    cursor.execute(f"""
            SELECT * FROM files WHERE username='{username}';
    """)
    # conn.commit()

    files = cursor.fetchall()
    conn.close()

    FILENAME_COLUMN_INDEX = 2
    FILEDATA_COLUMN_INDEX = 4

    filenames, filedatas = [], []

    if len(files) > 0:
        for fileinfo in files:
            filenames.append(fileinfo[FILENAME_COLUMN_INDEX])
            filedatas.append(fileinfo[FILEDATA_COLUMN_INDEX])
    

    else:
        return {"Error": "No Files to read"}
    
    respObj = dict(zip(filenames, filedatas))

    # * Only for Read
    return {"data": respObj}

'''

    







# @api.post("/application")
# def read_protected(token: str = Depends(oauth2_scheme)):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username = payload.get("sub")
#         if username is None:
#             raise HTTPException(status_code=401, detail="Invalid token")
#     except JWTError:
#             raise HTTPException(status_code=401, detail="Invalid token")
    
#     # TODO: Find all files of 
#     return {"message": f"Hello, {username} . Thou are allowed to proceed!"}
