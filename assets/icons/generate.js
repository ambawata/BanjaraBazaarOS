#!/usr/bin/env node
/**
 * Track A icon/diagram generator — BanjaraBazaarOS Design Asset Library.
 *
 * Generates ~130 simple, code-drawn monoline SVG icons (NOT the painterly
 * furniture illustrations — those are a separate track). Re-run this file
 * any time an icon needs tweaking or a new one is added: edit the relevant
 * entry in one of the CATEGORY arrays below, then `node assets/icons/generate.js`.
 * See .claude/skills/icon-library-style/SKILL.md for the locked style recipe.
 */
'use strict';
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Locked palette + stroke
// ---------------------------------------------------------------------------
const PURPLE = '#5A1FB3';
const AMBER = '#D97706';
const RED = '#DC2626';
const STROKE = 2;

const ROOT = __dirname;

function svgWrap(size, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none" stroke="${PURPLE}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">\n${inner}\n</svg>\n`;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------------------------------------------------------------------------
// Shared drawing helpers
// ---------------------------------------------------------------------------

/** 8-point compass-rose zone diagram: house dot at center, direction ticks colored by best/avoid. Used by every Vastu "…Zone" icon so they're all built the same way, differing only in which directions light up. */
function compassZone(cx, cy, r, best = [], avoid = []) {
  const dirs = { N: -90, NE: -45, E: 0, SE: 45, S: 90, SW: 135, W: 180, NW: 225 };
  let out = `<circle cx="${cx}" cy="${cy}" r="${r}" stroke-dasharray="2 3" opacity="0.45"/>`;
  out += `<text x="${cx}" y="${cy - r - 9}" font-size="7" fill="${PURPLE}" stroke="none" text-anchor="middle" font-family="sans-serif" font-weight="700">N</text>`;
  for (const [d, angle] of Object.entries(dirs)) {
    const rad = (angle * Math.PI) / 180;
    const x = (cx + Math.cos(rad) * r).toFixed(1);
    const y = (cy + Math.sin(rad) * r).toFixed(1);
    const isBest = best.includes(d);
    const isAvoid = !isBest && avoid.includes(d);
    if (isBest) {
      out += `<circle cx="${x}" cy="${y}" r="4.2" fill="${PURPLE}" stroke="none"/>`;
    } else if (isAvoid) {
      out += `<circle cx="${x}" cy="${y}" r="3.6" fill="${RED}" stroke="none" opacity="0.65"/>`;
    } else {
      out += `<circle cx="${x}" cy="${y}" r="2.6" fill="none"/>`;
    }
  }
  out += `<circle cx="${cx}" cy="${cy}" r="3" fill="${PURPLE}" stroke="none"/>`;
  return out;
}

/** N×N line grid with optional filled highlight cells [row, col]. */
function grid(x, y, size, n, highlight = [], highlightColor = PURPLE) {
  const cell = size / n;
  let out = '';
  for (const [r, c] of highlight) {
    out += `<rect x="${(x + c * cell).toFixed(1)}" y="${(y + r * cell).toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" fill="${highlightColor}" opacity="0.32" stroke="none"/>`;
  }
  for (let i = 0; i <= n; i++) {
    out += `<line x1="${(x + i * cell).toFixed(1)}" y1="${y}" x2="${(x + i * cell).toFixed(1)}" y2="${y + size}"/>`;
    out += `<line x1="${x}" y1="${(y + i * cell).toFixed(1)}" x2="${x + size}" y2="${(y + i * cell).toFixed(1)}"/>`;
  }
  return out;
}

function badgeShell(cx, cy, r, color = PURPLE) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${color}"/>`;
}

// Simple room-pictogram shell: rounded rect "room" outline with a glyph
// dropped in via `inner`. Every ROOMS icon shares this frame so the set
// reads as one family, differing only in the furniture glyph inside.
function roomShell(inner) {
  return `<rect x="8" y="10" width="48" height="44" rx="4"/>\n${inner}`;
}

module.exports = {
  PURPLE, AMBER, RED, STROKE, ROOT,
  svgWrap, slugify, compassZone, grid, badgeShell, roomShell,
};
