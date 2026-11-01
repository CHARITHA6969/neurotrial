import math
import os
import re
from collections import Counter
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

DATABASE_URL = os.getenv("NEUROTRIAL_DATABASE_URL", "sqlite:///./neurotrial.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


class SourceDocument(Base):
    __tablename__ = "source_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        back_populates="document", cascade="all, delete-orphan", order_by="DocumentChunk.chunk_index"
    )


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("source_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    document: Mapped[SourceDocument] = relationship(back_populates="chunks")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def split_into_chunks(text: str, size: int = 1200, overlap: int = 180) -> list[str]:
    normalized = re.sub(r"\s+", " ", text).strip()
    if not normalized:
        return []
    chunks = []
    start = 0
    while start < len(normalized):
        end = min(start + size, len(normalized))
        if end < len(normalized):
            boundary = normalized.rfind(" ", start + size // 2, end)
            if boundary > start:
                end = boundary
        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(normalized):
            break
        start = max(end - overlap, start + 1)
    return chunks


# A compact stop-word list keeps frequent grammatical words from dominating retrieval.
_STOP_WORDS = {
    "about", "after", "again", "against", "also", "are", "because", "been", "before",
    "being", "between", "both", "but", "can", "could", "did", "does", "doing", "down",
    "during", "each", "few", "for", "from", "further", "had", "has", "have", "having",
    "her", "here", "hers", "him", "his", "how", "into", "its", "itself", "just", "more",
    "most", "must", "not", "now", "off", "once", "only", "other", "our", "out", "over",
    "same", "she", "should", "some", "such", "than", "that", "their", "theirs", "them",
    "then", "there", "these", "they", "this", "those", "through", "too", "under", "until",
    "very", "was", "were", "what", "when", "where", "which", "while", "who", "whom",
    "why", "will", "with", "would", "you", "your",
}
_TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9]{3,}")


def _tokenize(text: str) -> list[str]:
    return [
        token.lower()
        for token in _TOKEN_PATTERN.findall(text)
        if token.lower() not in _STOP_WORDS
    ]


def retrieve_chunks(
    db,
    question: str,
    document_ids: list[int] | None = None,
    limit: int = 5,
):
    """Rank chunks with a small BM25-style lexical retriever.

    This is a transparent local baseline, not a semantic embedding search engine.
    """
    if limit <= 0:
        return []

    query_terms = set(_tokenize(question))
    if not query_terms:
        return []

    statement = select(DocumentChunk, SourceDocument).join(SourceDocument)
    if document_ids is not None:
        if not document_ids:
            return []
        statement = statement.where(SourceDocument.id.in_(document_ids))

    rows = db.execute(statement).all()
    if not rows:
        return []

    tokenized_rows = []
    document_frequency: Counter[str] = Counter()
    total_length = 0

    for chunk, document in rows:
        tokens = _tokenize(chunk.text)
        frequencies = Counter(tokens)
        tokenized_rows.append((chunk, document, frequencies, len(tokens)))
        document_frequency.update(set(frequencies))
        total_length += len(tokens)

    corpus_size = len(tokenized_rows)
    average_length = total_length / corpus_size if corpus_size else 0
    if average_length <= 0:
        return []

    # Standard BM25 tuning defaults; kept fixed for reproducible baseline behaviour.
    k1 = 1.5
    b = 0.75
    scored = []

    for chunk, document, frequencies, document_length in tokenized_rows:
        score = 0.0
        for term in query_terms:
            term_frequency = frequencies.get(term, 0)
            if not term_frequency:
                continue
            doc_frequency = document_frequency[term]
            inverse_document_frequency = math.log(
                1 + (corpus_size - doc_frequency + 0.5) / (doc_frequency + 0.5)
            )
            denominator = term_frequency + k1 * (
                1 - b + b * document_length / average_length
            )
            score += inverse_document_frequency * (
                term_frequency * (k1 + 1) / denominator
            )

        if score > 0:
            scored.append((score, chunk, document))

    scored.sort(
        key=lambda item: (
            -item[0],
            item[1].document_id,
            item[1].chunk_index,
        )
    )
    return [
        {
            "citation_id": f"S{index + 1}",
            "document_id": document.id,
            "filename": document.filename,
            "chunk_id": chunk.id,
            "text": chunk.text,
            "score": score,
        }
        for index, (score, chunk, document) in enumerate(scored[:limit])
    ]
