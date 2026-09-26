"""
Vector Store Module for LexSphere Citation Verification System.
Uses FAISS for high-performance vector indexing and semantic similarity search over legal judgment passages.
"""

import os
import sys
import site
import json
import numpy as np

user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

import faiss
from embedding_generator import get_embedding_model


class LegalVectorStore:
    """FAISS-backed Vector Store for legal document retrieval and verification."""

    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)
        self.metadata = []

    def create_index(self, embeddings: np.ndarray, metadata_list: list):
        """
        Build FAISS vector index from normalized embedding vectors and store associated metadata.
        """
        if embeddings.shape[0] == 0:
            print("Warning: Attempted to build index with 0 vectors.")
            return

        embeddings = embeddings.astype(np.float32)
        faiss.normalize_L2(embeddings)

        self.index = faiss.IndexFlatIP(self.dimension)
        self.index.add(embeddings)
        self.metadata = metadata_list
        print(f"Built FAISS index with {self.index.ntotal} vectors of dimension {self.dimension}.")

    def save(self, output_dir: str = None):
        """Save FAISS index and metadata JSON."""
        if output_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            output_dir = os.path.join(current_dir, "data", "embeddings")

        os.makedirs(output_dir, exist_ok=True)
        index_file = os.path.join(output_dir, "faiss_index.bin")
        meta_file = os.path.join(output_dir, "faiss_metadata.json")

        faiss.write_index(self.index, index_file)
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2, ensure_ascii=False)

        print(f"Saved FAISS index to {index_file} and metadata to {meta_file}")

    def load(self, output_dir: str = None) -> bool:
        """Load FAISS index and metadata JSON from disk."""
        if output_dir is None:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            output_dir = os.path.join(current_dir, "data", "embeddings")

        index_file = os.path.join(output_dir, "faiss_index.bin")
        meta_file = os.path.join(output_dir, "faiss_metadata.json")

        if not os.path.exists(index_file) or not os.path.exists(meta_file):
            print(f"Index or metadata file missing in {output_dir}")
            return False

        self.index = faiss.read_index(index_file)
        with open(meta_file, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        print(f"Successfully loaded FAISS index with {self.index.ntotal} vectors from {index_file}")
        return True

    def search_similar_chunks(self, query: str, top_k: int = 5) -> list:
        """
        Query vector store using text string. Returns list of top-k matching chunks with similarity score.
        """
        if self.index is None or self.index.ntotal == 0:
            print("Vector store is empty.")
            return []

        model = get_embedding_model()
        query_vec = model.encode([query], normalize_embeddings=True)
        query_vec = np.array(query_vec, dtype=np.float32)
        faiss.normalize_L2(query_vec)

        scores, indices = self.index.search(query_vec, min(top_k, self.index.ntotal))

        results = []
        for rank in range(len(indices[0])):
            idx = indices[0][rank]
            if idx < 0 or idx >= len(self.metadata):
                continue
            
            score = float(scores[0][rank])
            meta_item = dict(self.metadata[idx])
            meta_item["similarity_score"] = round(score, 4)
            results.append(meta_item)

        return results


_GLOBAL_VECTOR_STORE = None

def get_vector_store() -> LegalVectorStore:
    """Singleton getter for global LegalVectorStore instance."""
    global _GLOBAL_VECTOR_STORE
    if _GLOBAL_VECTOR_STORE is None:
        _GLOBAL_VECTOR_STORE = LegalVectorStore()
        _GLOBAL_VECTOR_STORE.load()
    return _GLOBAL_VECTOR_STORE
