"""
This module contains a function for getting a connection to a MySQL database using the mysql.connector module.

The following function is available:

- get_db() -> PooledMySQLConnection | MySQLConnection | Any: Returns a connection to the MySQL database.

The function uses the following parameters:

- host (str): The hostname or IP address of the MySQL server.
- user (str): The MySQL user to authenticate as.
- password (str): The password for the MySQL user.
- database (str): The name of the MySQL database to use.

The function returns a connection to the MySQL database, which can be used to execute SQL queries and transactions.
"""

import os
from typing import Any

import mysql.connector
from dotenv import load_dotenv
from mysql.connector.connection import MySQLConnection
from mysql.connector.pooling import PooledMySQLConnection

load_dotenv()


def get_db() -> PooledMySQLConnection | MySQLConnection | Any:
    """
    Returns a connection to the MySQL database using the mysql.connector module.

    Returns:
        PooledMySQLConnection | MySQLConnection | Any: A connection to the MySQL database.
    """
    return mysql.connector.connect(
        host=os.getenv(key="MYSQL_HOST"),
        user=os.getenv(key="MYSQL_USER"),
        password=os.getenv(key="MYSQL_ROOT_PASSWORD"),
        database=os.getenv(key="MYSQL_DATABASE"),
    )
