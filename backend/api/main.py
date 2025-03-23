from typing import Union

from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/user/{user_id}")
def get_or_create_user(user_id: str) -> Union[str, dict]:
    return {"user_id": user_id}
