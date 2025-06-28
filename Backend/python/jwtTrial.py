from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

app = FastAPI()

SECRET_KEY = "MOST-SECRET-KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 5

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

user_db = {
    "gaurav": {
        "username": "gaurav",
        "passwordHsh": pwd_context.hash("gaurav")
    }
}

# user_db = {
#     "gaurav": {
#         "username": "gaurav",
#         "passwordHsh": pwd_context.hash("gaurav")
#     }
# }

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(username: str, password: str):
    user = user_db.get(username)
    if not user or not verify_password(password, user["passwordHsh"]):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

class SignUp(BaseModel):
    username: str
    password: str

@app.post("/token")
# def login(form_data: OAuth2PasswordRequestForm = Depends()):
def login(form_data: SignUp):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username password"
        )
    access_token = create_access_token(data={"sub": user["username"]}) # Hmmm?...
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/protected")
def read_protected(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
    return {"message": f"Hello, {username}"}