"""
This module contains functions for encoding and decoding JWT tokens, as well as extracting the email address from a token.

The following functions are available:

- encode_jwt(email: str) -> Dict[str, str]: Encodes a JWT token with the given email and expiration time.
- decode_jwt(token: str = Header(description="JWT authorization header")) -> Dict[str, str]: Decodes a JWT token and returns the decoded payload.
- get_email_from_token(token: str = Header()) -> Optional[str]: Decodes a JWT token and returns the email address from the decoded payload.

The module uses the following global variables:

- JWT_SECRET_KEY: The secret key used for encoding and decoding JWT tokens.
- JWT_ALGORITHM: The algorithm used for encoding and decoding JWT tokens.
"""

import os
from typing import Any, Dict, Optional

import jwt
from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

JWT_SECRET_KEY: str | None = os.getenv(key="SECRET")
JWT_ALGORITHM = "HS256"


def encode_jwt(email: str) -> Dict[str, str]:
    """
    Encodes a JWT token with the given email and expiration time.

    Args:
        email (str): The email to include in the JWT payload.

    Returns:
        Dict[str, str]: A dictionary containing the encoded JWT token.
    """
    payload: dict[str, str] = {
        "email": email
    }
    token: str = jwt.encode(payload=payload, key=JWT_SECRET_KEY,
                            algorithm=JWT_ALGORITHM)
    return {"token": token}


async def decode_jwt(token: str = Header(description="JWT authorization header")) -> Dict[str, str]:
    """
    Decodes a JWT token and returns the decoded payload.

    Args:
        token (str): The JWT token to decode.

    Raises:
        HTTPException: If the token is not valid.

    Returns:
        Dict[str, str]: The decoded payload of the JWT token.
    """
    try:
        return jwt.decode(jwt=token, key=JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=401, detail="Token is not valid"
        ) from e


async def get_email_from_token(token: str = Header()) -> Optional[str]:
    """
    Decodes a JWT token and returns the email address from the decoded payload.

    Args:
        token (str): The JWT token to decode.

    Raises:
        HTTPException: If the token is not valid or does not contain an email address.

    Returns:
        Optional[str]: The email address from the decoded payload of the JWT token.
    """
    try:
        decoded_token: dict[str, Any] = jwt.decode(
            jwt=token, key=JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM]
        )
        if email := decoded_token.get("email"):
            return email
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e
