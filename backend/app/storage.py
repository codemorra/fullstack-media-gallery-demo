"""
Validate uploaded images and resolve files from local storage or the demo collection.
Uploaded files are kept outside the frontend's public directory.
"""

import warnings
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from PIL import Image, ImageOps, UnidentifiedImageError

BACKEND_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
SAMPLE_DIR = BACKEND_DIR.parent / "frontend" / "public"
SAMPLE_FILES = {f"sample_{index:03d}.webp" for index in range(1, 7)}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
UPLOAD_FORMATS = {"JPEG", "PNG", "WEBP"}


class ImageTooLargeError(ValueError):
    """Raised when an uploaded image exceeds the byte or pixel limit."""


def save_uploaded_image(contents: bytes) -> Path:
    """Validate an image and save a new WebP file without its original metadata.

    Args:
        contents: The uploaded file bytes, limited to 10 MiB.

    Returns:
        The absolute path of the newly created WebP file.

    Raises:
        ImageTooLargeError: If the image exceeds 10 MiB or 20 million pixels,
            or Pillow identifies a potential decompression bomb.
        ValueError: If the file is invalid, unsupported, or animated.
        OSError: If creating or writing the stored file fails.
    """
    if len(contents) > MAX_UPLOAD_BYTES:
        raise ImageTooLargeError("The image must not exceed 10 MiB.")

    # Detect the actual format from file contents, not the supplied name or MIME type.
    with warnings.catch_warnings():
        warnings.simplefilter("error", Image.DecompressionBombWarning)
        try:
            with Image.open(BytesIO(contents)) as source:
                if source.format not in UPLOAD_FORMATS:
                    raise ValueError("Only JPEG, PNG, and WebP images are supported.")
                if source.width * source.height > MAX_IMAGE_PIXELS:
                    raise ImageTooLargeError("The image must not exceed 20 million pixels.")
                if getattr(source, "is_animated", False):
                    raise ValueError("Animated images are not supported.")

                # Decode the image fully so corrupt pixel data is rejected before saving.
                source.load()
                with ImageOps.exif_transpose(source) as oriented:
                    mode = "RGBA" if "A" in oriented.getbands() or "transparency" in oriented.info else "RGB"
                    image = oriented.convert(mode)
        except (Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
            raise ImageTooLargeError("The image dimensions are too large.") from error
        except (UnidentifiedImageError, OSError, SyntaxError) as error:
            raise ValueError("The file must be a valid JPEG, PNG, or WebP image.") from error

    with image:
        UPLOAD_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
        image_path = UPLOAD_DIR / f"{uuid4().hex}.webp"
        # Exclusive creation prevents overwriting an existing file.
        output = image_path.open("xb")
        try:
            with output:
                image.save(output, format="WEBP", quality=85, exif=b"", xmp=b"")
        except Exception:
            image_path.unlink(missing_ok=True)
            raise

    return image_path


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
