from fastapi import FastAPI
from pydantic import BaseModel

api = FastAPI()

class SignUp(BaseModel):
    name: str
    password: str


@api.post('/signup')
def signup(signUp: SignUp):
    return {
        "name": signUp.name,
        "pass": signUp.password
    }


@api.get('/')
def index():
    return {"data": "File in String format"}