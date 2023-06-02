from datetime import datetime
from fastapi import Depends, FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from mysql.connector.connection import MySQLConnection
from mysql.connector.cursor import MySQLCursor
from mysql.connector.pooling import PooledMySQLConnection
from typing import Any, Dict, List, Optional, Tuple
import mysql.connector

from app.auth.auth import encodeJWT, decodeJWT, get_email_from_token

app = FastAPI()

origins: list[str] = ["http://localhost:3000", "localhost:3000"]

app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["DELETE", "POST", "GET", "PUT"],
    allow_headers=["*"],
)

db: PooledMySQLConnection | MySQLConnection | Any = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="todo"
)


@app.get(path="/", tags=["root"])
async def read_root() -> Dict[str, str]:
    return {"message": "Welcome to your todo list."}


@app.get(path="/todos", tags=["todos"], status_code=200, dependencies=[Depends(dependency=decodeJWT)])
async def view_all_todos() -> List[Dict[str, str]]:
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM todo"
    cursor.execute(query)
    result: Any | Tuple[str] | None = cursor.fetchall()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    todos: list[Dict[str, str]] = [
        {
            "id": str(object=todo[0]),
            "title": str(object=todo[1]),
            "description": str(object=todo[2]),
            "created_at": str(object=todo[3]),
            "due_time": str(object=todo[4]),
            "status": str(object=todo[5]),
            "user_id": str(object=todo[6]),
        }
        for todo in result
    ]
    return todos


@app.post(path="/todos", tags=["todos"], status_code=201, dependencies=[Depends(dependency=decodeJWT)])
async def create_todo(todo: Dict[str, str]) -> Dict[str, str]:
    cursor: MySQLCursor = db.cursor()
    query = "INSERT INTO todo (title, description, created_at, due_time, status, user_id) VALUES (%s, %s, %s, %s, %s, %s)"
    values: Tuple[str, str, str, str, str, str] = (
        todo["title"], todo["description"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"), todo["due_time"], todo["status"], todo["user_id"])
    cursor.execute(query, values)
    db.commit()
    todo_id: Any | int | None = cursor.lastrowid
    query = "SELECT * FROM todo WHERE id = %s"
    cursor.execute(query, (todo_id,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    return {
        "id": str(object=result[0]),
        "title": str(object=result[1]),
        "description": str(object=result[2]),
        "created_at": str(object=result[3]),
        "due_time": str(object=result[4]),
        "status": str(object=result[5]),
        "user_id": str(object=result[6]),
    }


@app.put(path="/todos/{id}", tags=["todos"], status_code=200, dependencies=[Depends(dependency=decodeJWT)])
async def update_todo(id: str, body: dict) -> Dict[str, str]:
    try:
        int(id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Bad parameter") from e
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM todo WHERE id = %s"
    cursor.execute(query, (id,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not found")
    query = "UPDATE todo SET title = %s, description = %s, due_time = %s, status = %s WHERE id = %s"
    values: Tuple[str, str, str, str, str] = (
        body["title"], body["description"], body["due_time"], body["status"], id)
    cursor.execute(query, values)
    db.commit()
    query = "SELECT * FROM todo WHERE id = %s"
    cursor.execute(query, (id,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    return {
        "id": str(object=result[0]),
        "title": str(object=result[1]),
        "description": str(object=result[2]),
        "created_at": str(object=result[3]),
        "due_time": str(object=result[4]),
        "status": str(object=result[5]),
    }


@app.delete(path="/todos/{id}", tags=["todos"], status_code=200, dependencies=[Depends(dependency=decodeJWT)])
async def delete_todo(id: str) -> Dict[str, str]:
    try:
        int(id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Bad parameter") from e
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM todo WHERE id = %s"
    cursor.execute(query, (id,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not found")
    query = "DELETE FROM todo WHERE id = %s"
    cursor.execute(query, (id,))
    db.commit()
    return {"msg": f"Successfully deleted record number : {id}"}


@app.get(path="/user", tags=["users"], status_code=200, dependencies=[Depends(dependency=decodeJWT)])
async def view_all_users() -> List[Dict[str, str]]:
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM user"
    cursor.execute(query)
    result: Any | Tuple[str] | None = cursor.fetchall()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    users: list[Dict[str, str]] = [
        {
            "id": str(object=user[0]),
            "email": str(object=user[1]),
            "password": str(object=user[2]),
            "name": str(object=user[3]),
            "firstname": str(object=user[4]),
            "created_at": str(object=user[5]),
        }
        for user in result
    ]
    return users


@app.get(path="/user/todos", tags=["users"], status_code=200)
async def view_all_user_todos(email: Optional[str] = Depends(dependency=get_email_from_token)) -> List[Dict[str, str]]:
    cursor: MySQLCursor = db.cursor()
    query = "SELECT id FROM user WHERE email = %s"
    cursor.execute(query, (email,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    user_id: str = str(object=result[0])
    query = "SELECT * FROM todo WHERE user_id = %s"
    cursor.execute(query, (user_id,))
    result: Any | Tuple[str] | None = cursor.fetchall()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    todos: list[Dict[str, str]] = [
        {
            "id": str(object=todo[0]),
            "title": str(object=todo[1]),
            "description": str(object=todo[2]),
            "created_at": str(object=todo[3]),
            "due_time": str(object=todo[4]),
            "status": str(object=todo[5]),
            "user_id": str(object=todo[6]),
        }
        for todo in result
    ]
    return todos


@app.put(path="/users/{id}", tags=["users"], status_code=200, dependencies=[Depends(dependency=decodeJWT)])
async def update_user(id: str, body: dict) -> Dict[str, str]:
    try:
        int(id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Bad parameter") from e
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM user WHERE id = %s"
    cursor.execute(query, (id,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not found")
    query = "UPDATE user SET email = %s, password = %s, name = %s, firstname = %s, created_at = %s WHERE id = %s"
    values: Tuple[str, str, str, str, str, str] = (
        body["email"], body["password"], body["name"], body["firstname"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"), id)
    cursor.execute(query, values)
    db.commit()
    query = "SELECT * FROM user WHERE id = %s"
    cursor.execute(query, (id,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    return {
        "email": str(object=result[1]),
        "password": str(object=result[2]),
        "name": str(object=result[3]),
        "firstname": str(object=result[4]),
    }


@app.post(path="/register", tags=["users"], status_code=201)
async def register_user(user: Dict[str, str]) -> Dict[str, str]:
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM user WHERE email = %s"
    cursor.execute(query, (user["email"],))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is not None:
        raise HTTPException(status_code=409, detail="Account already exists")
    values: Tuple[str, str, str, str, str] = (
        user["email"], user["name"], user["firstname"], user["password"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    query = "INSERT INTO user (email, name, firstname, password, created_at) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(query, values)
    db.commit()
    todo_id: Any | int | None = cursor.lastrowid
    query = "SELECT * FROM user WHERE id = %s"
    cursor.execute(query, (todo_id,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    return encodeJWT(email=user["email"])


@app.post(path="/login", tags=["users"], status_code=200)
async def login_user(user: Dict[str, str]) -> Dict[str, str]:
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM user WHERE email = %s AND password = %s"
    values: Tuple[str, str] = (user["email"], user["password"])
    cursor.execute(query, values)
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Invalid Credentials")
    return encodeJWT(email=user["email"])


@app.delete(path="/users/{id}", tags=["users"], status_code=200, dependencies=[Depends(dependency=decodeJWT)])
async def delete_user(id: str) -> Dict[str, str]:
    try:
        int(id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Bad parameter") from e
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM user WHERE id = %s"
    cursor.execute(query, (id,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not found")
    query = "DELETE FROM user WHERE id = %s"
    cursor.execute(query, (id,))
    db.commit()
    return {"msg": f"Successfully deleted record number : {id}"}


@app.get(path="/check_token", tags=["users"], status_code=200, dependencies=[Depends(dependency=decodeJWT)])
async def check_token() -> Dict[str, str]:
    return {"msg": "Token is valid"}
