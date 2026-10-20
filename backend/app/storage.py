"""
Resolve image files from local upload storage or the existing demo collection.
Uploaded files are kept outside the frontend's public directory.
"""

from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
SAMPLE_DIR = BACKEND_DIR.parent / "frontend" / "public"
SAMPLE_FILES = {f"sample_{index:03d}.webp" for index in range(1, 7)}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def get_media_file_path(file_path: str) -> Path:
    """Resolve a stored image filename within its permitted directory.

    Args:
        file_path: The relative image filename stored in the media record.

    Returns:
        The absolute path of an existing image file.

    Raises:
        ValueError: If the filename contains a directory, has an unsupported
            extension, or resolves outside its permitted directory.
        FileNotFoundError: If the image file does not exist.
    """
    filename = Path(file_path)
    if filename.name != file_path or "\\" in file_path:
        raise ValueError("Image paths must contain only a filename.")
    if filename.suffix.lower() not in IMAGE_EXTENSIONS:
        raise ValueError("Unsupported image file extension.")

    # Only the six known seed files may be read from the frontend's public folder.
    directory = SAMPLE_DIR if file_path in SAMPLE_FILES else UPLOAD_DIR
    directory = directory.resolve()
    resolved_path = (directory / file_path).resolve()

    # Resolving first also prevents symbolic links from escaping the storage directory.
    if not resolved_path.is_relative_to(directory):
        raise ValueError("Image path is outside its permitted directory.")
    if not resolved_path.is_file():
        raise FileNotFoundError("Image file not found.")

    return resolved_path
