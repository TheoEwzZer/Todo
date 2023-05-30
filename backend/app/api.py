from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins: list[str] = ["http://localhost:3000", "localhost:3000"]

app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["DELETE", "POST", "GET", "PUT"],
    allow_headers=["*"],
)

todos: list[dict[str, str]] = [
    {
        "id": "1",
        "title": "Todo 1",
        "description": "Do something",
        "created_at": "2021-08-01 12:00:00",
        "due_time": "2021-08-01 12:00:00",
        "status": "not started"
    }
]


@app.get(path="/", tags=["root"])
async def read_root() -> dict[str, str]:
    return {"message": "Welcome to your todo list."}


@app.get(path="/todos", tags=["todos"], status_code=200)
async def view_all_todos() -> list[dict[str, str]]:
    return todos


@app.get(path="/todo/{id}", tags=["todos"], status_code=200)
async def view_todo(id: str) -> dict[str, str]:
    try:
        int(id)
    except ValueError:
        return {"msg": "Bad parameter"}
    todo: dict[str, str] | None = next(
        (todo for todo in todos if todo["id"] == id), None)
    if todo is None:
        raise HTTPException(status_code=404, detail="Not found")
    return todo


@app.post(path="/todos", tags=["todos"], status_code=201)
async def create_todo(todo: dict) -> dict[str, str]:
    todos.append(todo)
    return todo


@app.put(path="/todos/{id}", tags=["todos"], status_code=200)
async def update_todo(id: str, body: dict) -> dict[str, str]:
    try:
        int(id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Bad parameter") from e
    todo: dict[str, str] | None = next(
        (todo for todo in todos if todo["id"] == id), None)
    if todo is None:
        raise HTTPException(status_code=404, detail="Not Found")
    todo_return: dict[str, str] = {}
    for key, value in body.items():
        if key != "id":
            todo[key] = value
            todo_return[key] = value
    return todo_return


@app.delete(path="/todos/{id}", tags=["todos"], status_code=200)
async def delete_todo(id: str) -> dict[str, str]:
    try:
        int(id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Bad parameter") from e
    todo: dict[str, str] | None = next(
        (todo for todo in todos if todo["id"] == id), None)
    if todo is None:
        raise HTTPException(status_code=404, detail="Not found")
    todos.remove(todo)
    return {"msg": f"Successfully deleted record number : {id}"}
