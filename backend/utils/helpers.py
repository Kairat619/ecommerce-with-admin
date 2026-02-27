"""Utility helpers."""
import re
from unidecode import unidecode


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    # Convert to ASCII
    text = unidecode(text)
    # Lowercase
    text = text.lower()
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text)
    # Remove special characters
    text = re.sub(r'[^a-z0-9\-]', '', text)
    # Remove multiple hyphens
    text = re.sub(r'-+', '-', text)
    # Strip leading/trailing hyphens
    text = text.strip('-')
    return text
