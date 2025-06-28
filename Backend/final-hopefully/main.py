from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

api = FastAPI()

# Types/Formats
class CredentialsH(BaseModel):
    username: str
    password: str



# DB







# Authentication
'''

SECRET_KEY = "MOST-SECRET-KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(password, hashedPassword):
    return pwd_context.verify(password, hashedPassword)

def authenticate_user(username: str, password: str):
    # TODO: user in usernames?
    # ! FIXME: TEMPORARY HARDCODE
    user = {
        "username": "gaurav",
        "passwordHash": pwd_context.hash(username)
    } 
    if not user or not verify_password(password, user["passwordHash"]):
        return None
    return user

# ? Learning
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    # expire = datetime.now(datetime.timezone.utc) + (expires_delta or timedelta(minutes=15))
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

'''










# Routing

@api.post("/login")
def login(form_data: CredentialsH):
    return {"msg": "msg"}
    # user = authenticate_user(form_data.username, form_data.password)
    # if not user:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Incorrect username password"
    #     )
    # access_token = create_access_token(data={"sub": user["username"]})  # ? Learning
    # return {"access_token": access_token, "token_type": "bearer"}
