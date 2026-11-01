# Data provenance and research integrity

## Purpose

The records in `src/data/sampleTrials.js` are synthetic demonstration scenarios. They exist only to exercise the interface and prompt flows.

## What the records are not

- They are not real clinical-trial records.
- Their identifiers are not ClinicalTrials.gov identifiers.
- Their interventions, endpoints, sample sizes, outcomes, and safety descriptions are fictional.
- They are not evidence for clinical, scientific, investment, or treatment decisions.
- They must not be cited as publications or registry data.

## Requirements before adding real evidence

Every real record should carry, at minimum:

1. A stable source identifier (for example, a verified registry ID or DOI).
2. A canonical source URL and retrieval date.
3. The exact source document or structured registry fields used.
4. A provenance note identifying whether content is verbatim, normalized, or derived.
5. Field-level uncertainty for missing, ambiguous, or conflicting information.

Do not label an AI-generated extraction as source fact until a reviewer has checked it against the cited source. Preserve the original source text and distinguish extracted facts from analyst interpretation.

## Safe extension

A future ingestion pipeline should validate source identifiers, retain immutable source snapshots or hashes, record parser/model versions, and attach evidence references to every extracted claim. The current prototype does not implement those controls.
