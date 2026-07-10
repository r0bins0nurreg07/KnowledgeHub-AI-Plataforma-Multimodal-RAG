from pathlib import Path
from uuid import UUID, uuid4

from app.core.config import BASE_DIR

UPLOAD_DIR = BASE_DIR / "uploads"


def build_stored_filename(original_filename: str) -> str:

    extension = Path(original_filename).suffix

    return f"{uuid4().hex}{extension}"


def save_file(workspace_id: UUID, stored_filename: str, content: bytes) -> str:

    workspace_dir = UPLOAD_DIR / str(workspace_id)

    workspace_dir.mkdir(parents=True, exist_ok=True)

    file_path = workspace_dir / stored_filename

    file_path.write_bytes(content)

    return str(file_path)


def delete_file(file_path: str) -> None:

    path = Path(file_path)

    if path.exists():
        path.unlink()
