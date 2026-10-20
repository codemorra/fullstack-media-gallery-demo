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
    """Hash a password using pwdlib's recommended Argon2 settings.

    Args:
        password: The plain-text password received during registration or seeding.

    Returns:
        An encoded hash including the salt and hashing parameters for storage.
    """
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a login password against a stored hash.

    Args:
        plain_password: The password supplied during login.
        hashed_password: The stored user hash or the dummy hash for unknown users.

    Returns:
        Whether the password matches the supplied hash.
    """
    return password_hash.verify(plain_password, hashed_password)
