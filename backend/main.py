"""
This module contains the main function to run the backend server for the Todo app.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(app="app.api:app", host="0.0.0.0", port=8000, reload=True)
