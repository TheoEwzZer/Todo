"""
This file contains the API endpoints for the todo list application.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import bcrypt
from app.auth.auth import decode_jwt, encode_jwt, get_email_from_token
from app.config.db import get_db
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mysql.connector.connection import MySQLConnection
from mysql.connector.cursor import MySQLCursor
from mysql.connector.pooling import PooledMySQLConnection
from validate_email import validate_email

app = FastAPI()

ORIGINS: list[str] = ["http://localhost:3000", "localhost:3000"]

app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["DELETE", "POST", "GET", "PUT"],
    allow_headers=["*"],
)

db: PooledMySQLConnection | MySQLConnection | Any = get_db()


@app.get(path="/", tags=["root"])
async def read_root() -> Dict[str, str]:
    """
    Returns a dictionary with a welcome message for the todo list application.

    Return:
        Dict[str, str]: A dictionary with a welcome message.
    """
    return {"message": "Welcome to your todo list."}


@app.get(path="/todos", tags=["todos"], status_code=200, dependencies=[Depends(dependency=decode_jwt)])
async def view_all_todos() -> List[Dict[str, str]]:
    """
    View all the todos

    Returns:
        List[Dict[str, str]]: A list of dictionaries containing the todos.
    """
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


@app.post(path="/todos", tags=["todos"], status_code=201, dependencies=[Depends(dependency=decode_jwt)])
async def create_todo(todo: Dict[str, str]) -> Dict[str, str]:
    """
    Creates a todo

    Args:
        todo (Dict[str, str]): A dictionary containing the information for the new todo.

    Returns:
        Dict[str, str]: A dictionary containing the information for the newly created todo.
    """
    cursor: MySQLCursor = db.cursor()
    query = "INSERT INTO todo (title, description, due_time, status, user_id) VALUES (%s, %s, %s, %s, %s)"
    values: Tuple[str, str, str, str, str] = (
        todo["title"], todo["description"], todo["due_time"], todo["status"], todo["user_id"])
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


@app.put(path="/todos/{id}", tags=["todos"], status_code=200, dependencies=[Depends(dependency=decode_jwt)])
async def update_todo(id: str, body: Dict) -> Dict[str, str]:
    """
    Update a todo

    Args:
        id (str): A string representing the id of the todo to update.
        bod (Dict): A dictionary containing the updated information for the todo.

    Returns:
        Dict[str, str]:A dictionary containing the updated information for the todo.
    """
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


@app.delete(path="/todos/{id}", tags=["todos"], status_code=200, dependencies=[Depends(dependency=decode_jwt)])
async def delete_todo(id: str) -> Dict[str, str]:
    """
    Delete a todo

    Args:
        id (str): A string representing the id of the todo to delete.

    Returns:
        Dict[str, str]: A dictionary containing a message indicating that the todo was successfully deleted.
    """
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


@app.get(path="/user", tags=["users"], status_code=200, dependencies=[Depends(dependency=decode_jwt)])
async def view_all_users() -> List[Dict[str, str]]:
    """
    View all user information

    Returns:
        List[Dict[str, str]]: A list of dictionaries containing information about each user.
    """
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


@app.get(path="/user/id", tags=["users"], status_code=200)
async def view_user_id(email: Optional[str] = Depends(dependency=get_email_from_token)) -> str:
    """
    View user ID

    Args:
        email (Optional[str]): Optional email address of the user.

    Raises:
        HTTPException: If the user is not found.

    Returns:
        str: A string representing the user ID.
    """
    cursor: MySQLCursor = db.cursor()
    query = "SELECT id FROM user WHERE email = %s"
    cursor.execute(query, (email,))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Not Found")
    user_id: str = str(object=result[0])
    return user_id


@app.get(path="/user/todos", tags=["users"], status_code=200)
async def view_all_user_todos(email: Optional[str] = Depends(dependency=get_email_from_token)) -> List[Dict[str, str]]:
    """
    View all user todos

    Args:
        email (Optional[str]): Optional email address of the user.

    Raises:
        HTTPException: If the user is not found.

    Returns:
        List[Dict[str, str]]: A list of dictionaries representing the todos for the user.
    """
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


@app.put(path="/users/{id}", tags=["users"], status_code=200, dependencies=[Depends(dependency=decode_jwt)])
async def update_user(id: str, body: Dict) -> Dict[str, str]:
    """
    Update user information

    Args:
        id (str): The ID of the user to update.
        body (Dict): A dictionary containing the updated user information.

    Raises:
        HTTPException: If the ID is not an integer or if the user is not found.

    Returns:
        Dict[str, str]: A dictionary containing the updated user information.
    """
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
    query = "UPDATE user SET email = %s, password = %s, name = %s, firstname = %s WHERE id = %s"
    values: Tuple[str, str, str, str, str] = (
        body["email"], body["password"], body["name"], body["firstname"], id)
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
    """
    Register a new user

    Args:
        user (Dict[str, str]): A dictionary containing the user information.

    Raises:
        HTTPException: If the user already exists.

    Returns:
        Dict[str, str]: A dictionary containing the encoded JWT token.
    """
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM user WHERE email = %s"
    cursor.execute(query, (user["email"],))
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is not None:
        raise HTTPException(status_code=409, detail="Account already exists")
    if not validate_email(email=user["email"]):
        raise HTTPException(
            status_code=400, detail="Invalid email address. Please correct and try again")
    if user["password"] is None or len(user["password"]) < 6:
        raise HTTPException(
            status_code=400, detail="Minimum 6 characters required")
    password: str = user["password"]
    password_bytes: bytes = password.encode(encoding="utf-8")
    salt: bytes = bcrypt.gensalt()
    hashed_password: bytes = bcrypt.hashpw(password=password_bytes, salt=salt)
    values: Tuple[str, str, str, bytes] = (
        user["email"], user["name"], user["firstname"], hashed_password)
    query = "INSERT INTO user (email, name, firstname, password) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, values)
    db.commit()
    return encode_jwt(email=user["email"])


@app.post(path="/login", tags=["users"], status_code=200)
async def login_user(user: Dict[str, str]) -> Dict[str, str]:
    """
    Connect a user

    Args:
        user (Dict[str, str]): A dictionary containing the user's email and password.

    Raises:
        HTTPException: If the email and password combination is invalid.

    Returns:
        Dict[str, str]: A dictionary containing the encoded JWT token.
    """
    cursor: MySQLCursor = db.cursor()
    query = "SELECT * FROM user WHERE email = %s"
    values: Tuple[str] = (user["email"],)
    cursor.execute(query, values)
    result: Any | Tuple[str] | None = cursor.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="Invalid Credentials")
    hashed_password_first: str = str(object=result[2])
    hashed_password: bytes = hashed_password_first.encode(encoding="utf-8")
    password: str = user["password"]
    password_bytes: bytes = password.encode(encoding="utf-8")
    if not bcrypt.checkpw(password=password_bytes, hashed_password=hashed_password):
        raise HTTPException(status_code=404, detail="Invalid Credentials")
    return encode_jwt(email=user["email"])


@app.delete(path="/users/{id}", tags=["users"], status_code=200, dependencies=[Depends(dependency=decode_jwt)])
async def delete_user(id: str) -> Dict[str, str]:
    """
    Delete a user

    Args:
        id (str): The ID of the user to delete.

    Raises:
        HTTPException: If the ID is not a valid integer or if the user is not found.

    Returns:
        Dict[str, str]: A dictionary containing a success message.
    """
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


@app.get(path="/check_token", tags=["users"], status_code=200, dependencies=[Depends(dependency=decode_jwt)])
async def check_token() -> Dict[str, str]:
    """
    Check if the token is valid.

    Returns:
        Dict[str, str]: A dictionary containing a success message.
    """
    return {"msg": "Token is valid"}
