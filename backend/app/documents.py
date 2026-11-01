import os
import re
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


def retrieve_chunks(db, question: str, document_ids: list[int] | None = None, limit: int = 5):
    statement = select(DocumentChunk, SourceDocument).join(SourceDocument)
    if document_ids:
        statement = statement.where(SourceDocument.id.in_(document_ids))
    rows = db.execute(statement).all()
    terms = {term.lower() for term in re.findall(r"[a-zA-Z0-9]{3,}", question)}
    scored = []
    for chunk, document in rows:
        words = re.findall(r"[a-zA-Z0-9]{3,}", chunk.text.lower())
        score = sum(words.count(term) for term in terms)
        if score:
            scored.append((score, chunk, document))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [
        {"citation_id": f"S{index + 1}", "document_id": document.id,
         "filename": document.filename, "chunk_id": chunk.id, "text": chunk.text,
         "score": score}
        for index, (score, chunk, document) in enumerate(scored[:limit])
    ]
