# LexSphere – Hybrid RAG Retrieval Pipeline

Retrieves the most relevant passages from the legal judgment PDFs for a user's question.
The Ollama / LLM layer passes these passages to the model as context.

This module handles **retrieval only**. It does not generate answers, and it has no UI or chat.

```
PDFs in public/documents/judgments/
  → PDF text extraction (PyMuPDF, page by page)
  → Text cleaning (keeps citations, sections, articles)
  → Legal chunking (700–900 words, 100–150 word overlap)
  → Metadata (case name, citation, court, date, pages)
  → Embeddings (sentence-transformers/all-mpnet-base-v2)
  → FAISS vector index   +   BM25 keyword index
  → Hybrid retrieval (top 10 dense + top 10 BM25)
  → Reciprocal Rank Fusion (k = 60)
  → Cross-encoder reranking (cross-encoder/ms-marco-MiniLM-L-6-v2)
  → Final top 5 legal chunks
```

Everything runs locally and is free. You need internet only once, to download the two models (~500 MB) from Hugging Face.

---

## Installation

You need Python 3.10 or newer. Run these commands from the `backend/` folder.

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

If you use [uv](https://docs.astral.sh/uv/), this does the same thing:

```bash
uv venv --python 3.11 .venv
uv pip install --python .venv -r requirements.txt
```

The first run downloads the embedding model and the reranker into the Hugging Face cache (`~/.cache/huggingface`). After that, everything works offline.

---

## Running the pipeline

### From Python (for integration with the LLM layer)

```python
from rag import HybridRAGPipeline

pipeline = HybridRAGPipeline()          # loads the index, or builds it if PDFs changed
results = pipeline.retrieve("Explain Article 21 judgement")

for r in results:
    print(r["case_name"], r["document"], r["page_number"], r["retrieval_score"])

# Ready-made, numbered context with citations for the LLM prompt
context = HybridRAGPipeline.format_context(results)
```

Each result is a plain dict:

| Field | Meaning |
|---|---|
| `chunk_id` | Stable ID, e.g. `mohd_muslim_vs_state_nct_delhi::chunk_000` |
| `document` | PDF file name (relative to the corpus folder) |
| `case_name` | e.g. `Mohd. Muslim @ Hussain v. State (NCT of Delhi)` |
| `page_number` / `page_end` | Pages where the chunk starts and ends |
| `text` | The chunk's text |
| `retrieval_score` | Cross-encoder relevance score. Higher is better. Above 0 usually means relevant. Strongly negative means the corpus probably doesn't cover the question. |
| `rrf_score` | Reciprocal Rank Fusion score |
| `dense_rank`, `sparse_rank` | Position in the FAISS and BM25 result lists (`null` if the chunk wasn't in that list) |
| `citation`, `court`, `judgment_date` | Document metadata, when it could be found |

Optional arguments:
- `pipeline.retrieve(query, top_k=5, min_score=None)` — set `min_score=0.0` to drop weak matches so the LLM doesn't answer from irrelevant text.
- `HybridRAGPipeline(config=RAGConfig(...))` — overrides any setting in [`rag/config.py`](rag/config.py).

### From the command line

```bash
python -m rag.pipeline query "Explain Article 21 judgement"
python -m rag.pipeline query "Section 7 IBC admission" --top-k 3 --json
python -m rag.pipeline query "Right to speedy trial" --min-score 0
```

---

## Adding new legal PDFs

1. Copy the PDF(s) into `public/documents/judgments/`. Sub-folders work too.
2. That's all. You don't need to change any code.

When `HybridRAGPipeline()` starts, it compares the PDFs on disk against `data/indexes/manifest.json`, using each file's SHA-256 hash. If a PDF was added, removed or changed, or a chunking or embedding setting in `config.py` changed, the whole index is rebuilt automatically.

The case name is taken from the judgment's cause title ("X versus Y"). If that fails, it falls back to the file name, so `12_state_vs_ram_kumar_2021.pdf` becomes `State v. Ram Kumar`.

Scanned PDFs (images with no text layer) need OCR first. The pipeline logs a warning and skips them.

To read PDFs from a different folder, set an environment variable:

```bash
LEXSPHERE_CORPUS_DIR=/path/to/pdfs python -m rag.pipeline build
```

`LEXSPHERE_INDEX_DIR` and `LEXSPHERE_PROCESSED_DIR` override the output folders in the same way.

---

## Creating embeddings / rebuilding the index

```bash
python -m rag.pipeline build           # builds only if the corpus changed
python -m rag.pipeline build --force   # always rebuilds
```

A build writes:

| File | Contents |
|---|---|
| `data/indexes/faiss.index` | FAISS `IndexFlatIP` of normalised chunk embeddings (cosine similarity) |
| `data/indexes/chunks.json` | Chunk metadata. Row *i* here is vector *i* in FAISS and document *i* in BM25. |
| `data/indexes/bm25.pkl` | BM25Okapi index |
| `data/indexes/bm25_tokenized_corpus.json` | Tokenised corpus. If the pickle is missing, BM25 is rebuilt from this. |
| `data/indexes/manifest.json` | Hashes of the indexed PDFs, the settings used, and the build time |
| `data/processed/pages.json` | Cleaned text of every page (for debugging) |
| `data/processed/documents.json` | Per-document metadata and chunk counts |

These files are generated, so they're git-ignored. Each teammate builds their own copy with the command above, and it takes under a minute on CPU for the current corpus.

---

## Testing retrieval

```bash
pytest tests/test_rag.py -s     # 15 tests; -s prints the retrieved chunks
python tests/test_rag.py        # builds the real index and prints sample queries
```

The tests use the real PDFs in `public/documents/judgments/`, and they build their indexes in a temporary folder so your `data/indexes/` isn't touched. They check:
- PDF discovery and page numbering
- Citation-safe text cleaning
- Chunk size and overlap
- The RRF formula
- Index consistency and reloading
- Automatic rebuild when a PDF is added
- End-to-end queries, including *"Explain Article 21 judgement"*, where the Article 21 judgment must rank first

---

## Folder structure

```
backend/
├── rag/
│   ├── __init__.py          exports HybridRAGPipeline, RAGConfig
│   ├── config.py            paths, model names, chunk sizes, top-k values
│   ├── pdf_loader.py        finds PDFs recursively; extracts text page by page
│   ├── text_cleaner.py      removes page numbers, signature stamps, repeated headers
│   ├── chunker.py           sentence-aware 700–900 word chunks with overlap
│   ├── metadata.py          case name / citation / court / date extraction
│   ├── embeddings.py        all-mpnet-base-v2 wrapper (windowed chunk embeddings)
│   ├── vector_store.py      FAISS index build / save / load / search
│   ├── bm25_retriever.py    BM25 with legal-aware tokenisation
│   ├── hybrid_retriever.py  dense + sparse retrieval and Reciprocal Rank Fusion
│   ├── reranker.py          cross-encoder reranking
│   ├── pipeline.py          HybridRAGPipeline + CLI
│   └── schemas.py           dataclasses: PageText, Chunk, RetrievedChunk, …
├── data/
│   ├── processed/           cleaned pages and document metadata (generated)
│   └── indexes/             FAISS, BM25, chunk metadata, manifest (generated)
├── tests/
│   └── test_rag.py
├── requirements.txt
└── README.md
```

---

## Design notes

- **Cleaning preserves legal references.** The cleaner never changes digits, brackets or capitalisation, so `Section 302 IPC`, `Article 21`, `AIR 1978 SC 597`, `(2024) SCC` and `2023 INSC 308` survive as written. It removes only page numbers that sit at a page edge, the Supreme Court's digital-signature stamp, headers repeated on most pages, letter-spaced headings (`J U D G M E N T` → `JUDGMENT`) and words hyphenated across lines.
- **Chunking.** Chunks are built from whole sentences, and the splitter knows legal abbreviations (`v.`, `Sec.`, `No.`, `J.`, `Ors.`, initials), so a chunk never ends mid-sentence. The final chunk of a long judgment borrows earlier sentences if needed, so it still reaches 700 words.
- **Long chunks and short model limits.** `all-mpnet-base-v2` reads only ~384 tokens, so each chunk is embedded as the average of overlapping ~200-word windows. The cross-encoder reads 512 tokens, so it scores ~300-word windows and keeps the best one. Without this, most of a 900-word chunk would be ignored.
- **Case name in the searchable text.** Embeddings and BM25 index `"<case name>. <chunk text>"`, so a question that names a case can match any chunk from it.
- **BM25 tokens for provisions.** "Section 302", "Article 21" and "Order 7 Rule 11" also produce tokens like `section_302` and `article_21`. A chunk citing that exact provision then outranks chunks that only contain the number.
- **Why RRF.** BM25 scores and cosine similarities are on different scales. RRF combines the two lists by rank, `1 / (60 + rank)`, so neither needs rescaling.
