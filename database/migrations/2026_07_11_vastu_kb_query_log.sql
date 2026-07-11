-- Vastu Knowledge Engine — search query log for the zero-hit report.
-- Idempotent (CREATE TABLE IF NOT EXISTS), additive-only, named vastu_kb_*
-- per the module's existing safety rails.
--
-- Deliberately NO requester identity (no IP, no user id, no session token):
-- this is aggregate "what are people asking that we don't have a good
-- answer for" data, not per-user tracking.

CREATE TABLE IF NOT EXISTS vastu_kb_query_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  query_text VARCHAR(512) NOT NULL,
  -- Comma-separated entry_ids actually returned (NULL when zero results),
  -- kept simple rather than a join table since this is a log, not a
  -- queryable relation.
  matched_entry_ids VARCHAR(512) NULL,
  result_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  matched_top_score SMALLINT NOT NULL DEFAULT 0,
  -- true when result_count = 0 OR matched_top_score is below the same
  -- score-30 cutoff the search ranking already uses to decide a match is
  -- worth showing (see VastuKbService::LOW_CONFIDENCE_SCORE_THRESHOLD).
  low_confidence TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_low_confidence_created (low_confidence, created_at),
  KEY idx_query_text (query_text(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
