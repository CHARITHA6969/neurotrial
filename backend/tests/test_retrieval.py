from types import SimpleNamespace

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.documents import (
    Base,
    DocumentChunk,
    SourceDocument,
    _tokenize,
    retrieve_chunks,
    split_into_chunks,
)


class FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class FakeSession:
    def __init__(self, rows):
        self.rows = rows
        self.executed = False

    def execute(self, _statement):
        self.executed = True
        return FakeResult(self.rows)


def make_row(chunk_id: int, text: str, document_id: int = 1):
    document = SimpleNamespace(id=document_id, filename=f"source-{document_id}.txt")
    chunk = SimpleNamespace(
        id=chunk_id,
        document_id=document_id,
        chunk_index=chunk_id,
        text=text,
    )
    return chunk, document


def test_tokenizer_removes_common_stop_words_and_normalizes_case():
    assert _tokenize("WHAT Was the COGNITIVE endpoint?") == ["cognitive", "endpoint"]


def test_chunking_collapses_whitespace():
    assert split_into_chunks("Trial\n\nresults   showed improvement.") == [
        "Trial results showed improvement."
    ]


def test_bm25_retrieval_ranks_precise_shorter_match_first():
    precise = make_row(
        1,
        "Cognitive endpoint cognitive endpoint cognitive endpoint was measured.",
        document_id=1,
    )
    broad = make_row(
        2,
        "The cognitive endpoint was assessed during the trial alongside many other clinical "
        "measures, patient outcomes, safety observations, and exploratory analyses.",
        document_id=2,
    )
    db = FakeSession([broad, precise])

    results = retrieve_chunks(db, "What was the cognitive endpoint?", limit=2)

    assert db.executed is True
    assert len(results) == 2
    assert results[0]["document_id"] == 1
    assert results[0]["citation_id"] == "S1"
    assert results[1]["citation_id"] == "S2"
    assert results[0]["score"] > results[1]["score"]


def test_retrieval_returns_no_results_for_stop_word_only_query():
    db = FakeSession([make_row(1, "The study reported results.")])

    assert retrieve_chunks(db, "what is this and that") == []
    assert db.executed is False


def test_retrieval_honours_empty_document_filter_and_non_positive_limit():
    db = FakeSession([make_row(1, "cognitive endpoint")])

    assert retrieve_chunks(db, "cognitive endpoint", document_ids=[]) == []
    assert retrieve_chunks(db, "cognitive endpoint", limit=0) == []
    assert db.executed is False
