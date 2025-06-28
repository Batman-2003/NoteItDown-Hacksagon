from fastapi import FastAPI, Request
import json



api = FastAPI()


@api.post("/main")
async def mainHandler(request: Request):
    body = await request.body()
    print(request.headers)
    print("")
    print("")
    print("")
    print("")
    print(body.decode('UTF-8'))
    print("")
    print("")
    print("")
    print("")
    return json.loads(body.decode())