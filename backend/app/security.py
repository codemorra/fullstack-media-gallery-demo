"""
This module provides functions for hashing and verifying passwords
using the pwdlib library. It defines a recommended password hashing algorithm and provides
utility functions for hashing and verifying passwords.
"""

from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
# Pre-computed hash for a dummy password to mitigate timing attacks
DUMMY_PASSWORD_HASH = password_hash.hash("dummy-password")


def hash_password(password: str) -> str:
    """Hash a password using the recommended password hashing algorithm."""
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password."""
    return password_hash.verify(plain_password, hashed_password)
