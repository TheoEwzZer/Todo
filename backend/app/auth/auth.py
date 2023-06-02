import time
from typing import Dict, Optional

from fastapi import HTTPException, Header
import jwt


JWT_SECRET_KEY = "secret"
JWT_ALGORITHM = "HS256"


def encodeJWT(email: str) -> Dict[str, str]:
    payload = {
        "email": email,
        "expires": time.time() + 600
    }
    token = jwt.encode(payload=payload, key=JWT_SECRET_KEY,
                       algorithm=JWT_ALGORITHM)
    return {"token": token}


async def decodeJWT(token: str = Header(description="JWT authorization header")):
    try:
        return jwt.decode(jwt=token, key=JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=401, detail="Token is not valid"
        ) from e


async def get_email_from_token(token: str = Header()) -> Optional[str]:
    try:
        decoded_token = jwt.decode(
            jwt=token, key=JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM]
        )
        if email := decoded_token.get("email"):
            return email
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e
