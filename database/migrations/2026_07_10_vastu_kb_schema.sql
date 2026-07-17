-- Vastu Knowledge Engine schema — Vastu Griha module.
-- Safe-by-construction: every object name starts with vastu_kb_, nothing
-- here touches an existing table. Idempotent (CREATE TABLE IF NOT EXISTS)
-- so re-running this file is always safe; seeding is a separate UPSERT
-- step (backend/scripts/seed_vastu_kb.php), not done here.
--
-- Design note: the source dataset is intentionally heterogeneous — some
-- entries use best/avoid as arrays, some as free-text strings, some are
-- nested matrices (RZ-01) or per-zone/per-room color maps (CO-01/CO-02),
-- and the entry set is expected to grow with new shapes over time. Rather
-- than force every variant into rigid columns (which risks silently
-- dropping a field a future entry happens to use), each entry's complete
-- original JSON is preserved in `raw_json`. The normalized columns below
-- exist for querying/ranking/severity display — they are a queryable
-- projection of raw_json, not a replacement for it.

CREATE TABLE IF NOT EXISTS vastu_kb_entries (
  entry_id VARCHAR(20) NOT NULL,
  category VARCHAR(64) NOT NULL,
  topic VARCHAR(128) NOT NULL,
  entry_type VARCHAR(32) NOT NULL DEFAULT 'rule',
  location_confidence TINYINT UNSIGNED NULL,
  effect_confidence TINYINT UNSIGNED NULL,
  reasoning TEXT NULL,
  disagreement TEXT NULL,
  remedy TEXT NULL,
  severity_default VARCHAR(32) NULL,
  raw_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (entry_id),
  KEY idx_category (category),
  KEY idx_topic (topic)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vastu_kb_aliases (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  entry_id VARCHAR(20) NOT NULL,
  alias VARCHAR(255) NOT NULL,
  -- 'devanagari' when the alias is written in the Devanagari script,
  -- 'latin' for everything else (English or Hinglish transliteration —
  -- the two aren't reliably distinguishable by a simple heuristic, so
  -- this doesn't pretend to split them; search matches both either way).
  lang VARCHAR(16) NOT NULL DEFAULT 'latin',
  PRIMARY KEY (id),
  UNIQUE KEY uniq_entry_alias (entry_id, alias),
  KEY idx_alias (alias),
  CONSTRAINT fk_vastu_kb_alias_entry FOREIGN KEY (entry_id)
    REFERENCES vastu_kb_entries (entry_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vastu_kb_sources (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  entry_id VARCHAR(20) NOT NULL,
  source_key VARCHAR(128) NOT NULL,
  url VARCHAR(512) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_entry_source (entry_id, source_key),
  CONSTRAINT fk_vastu_kb_source_entry FOREIGN KEY (entry_id)
    REFERENCES vastu_kb_entries (entry_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vastu_kb_severity_overrides (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  entry_id VARCHAR(20) NOT NULL,
  direction VARCHAR(64) NOT NULL,
  level VARCHAR(32) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_entry_direction (entry_id, direction),
  CONSTRAINT fk_vastu_kb_severity_entry FOREIGN KEY (entry_id)
    REFERENCES vastu_kb_entries (entry_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CO-01 (by_zone) and CO-02 (by_room) both nest recommended/avoid lists
-- under a set of keys (zone codes or room names) — same shape, different
-- scope, so one table covers both via scope_type.
CREATE TABLE IF NOT EXISTS vastu_kb_color_rules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  entry_id VARCHAR(20) NOT NULL,
  scope_type ENUM('zone', 'room') NOT NULL,
  scope_key VARCHAR(64) NOT NULL,
  recommended JSON NULL,
  avoid JSON NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_entry_scope (entry_id, scope_type, scope_key),
  CONSTRAINT fk_vastu_kb_color_entry FOREIGN KEY (entry_id)
    REFERENCES vastu_kb_entries (entry_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
