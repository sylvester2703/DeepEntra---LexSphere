"""
Embedding Generator Module for LexSphere Citation Verification System.
Generates 384-dimensional vector embeddings for legal text chunks using sentence-transformers (all-MiniLM-L6-v2).
"""

import os
import sys
import site
import json
import numpy as np

# Ensure user site-packages are in sys.path
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

# Global model cache to avoid re-loading model repeatedly
_EMBEDDING_MODEL = None
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def get_embedding_model():
    """Lazy load SentenceTransformer model."""
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        try:
            from sentence_transformers import SentenceTransformer
            print(f"Loading embedding model: {MODEL_NAME}...")
            _EMBEDDING_MODEL = SentenceTransformer(MODEL_NAME)
        except Exception as e:
            print(f"Error loading SentenceTransformer ({e}).")
            raise e
    return _EMBEDDING_MODEL


def generate_embeddings_for_chunks(chunks: list) -> tuple:
    """
    Generate vector embeddings for a list of text chunk dictionaries.
    Returns: (numpy.ndarray of embeddings float32, list of chunks with metadata)
    """
    if not chunks:
        return np.empty((0, 384), dtype=np.float32), []

    texts = [c["text"] for c in chunks]
    model = get_embedding_model()

    print(f"Generating embeddings for {len(texts)} text chunks...")
    embeddings = model.encode(texts, batch_size=32, show_progress_bar=False, normalize_embeddings=True)
    embeddings = np.array(embeddings, dtype=np.float32)

    return embeddings, chunks


def save_embeddings(embeddings: np.ndarray, chunks: list, output_dir: str = None):
    """
    Save embeddings array and metadata list into data/embeddings directory.
    """
    if output_dir is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = os.path.join(current_dir, "data", "embeddings")

    os.makedirs(output_dir, exist_ok=True)

    emb_path = os.path.join(output_dir, "embeddings.npy")
    meta_path = os.path.join(output_dir, "chunks_metadata.json")

    np.save(emb_path, embeddings)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    print(f"Saved embeddings matrix {embeddings.shape} to {emb_path}")
    print(f"Saved chunk metadata ({len(chunks)} items) to {meta_path}")


def load_saved_embeddings(embeddings_dir: str = None):
    """
    Load saved embeddings array and chunk metadata.
    """
    if embeddings_dir is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        embeddings_dir = os.path.join(current_dir, "data", "embeddings")

    emb_path = os.path.join(embeddings_dir, "embeddings.npy")
    meta_path = os.path.join(embeddings_dir, "chunks_metadata.json")

    if not os.path.exists(emb_path) or not os.path.exists(meta_path):
        return None, None

    embeddings = np.load(emb_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    return embeddings, chunks


if __name__ == "__main__":
    sample_chunks = [
        {"chunk_id": "c1", "text": "Vidarbha Industries Power Limited vs Axis Bank Ltd (2022) 8 SCC 352", "document": "vidarbha.pdf", "page_number": 1, "case_name": "Vidarbha Industries"}
    ]
    embs, c_list = generate_embeddings_for_chunks(sample_chunks)
    save_embeddings(embs, c_list)
