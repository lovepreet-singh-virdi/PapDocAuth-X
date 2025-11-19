-- ============================================================================
-- PERFORMANCE BENCHMARKS - ADT Project Evidence
-- ============================================================================
-- Purpose: Document before/after performance improvements from migrations
-- Author: Lovepreet Singh
-- Date: 2025-11-19
-- Database: PostgreSQL 18.1
-- ============================================================================

-- (Full benchmarks moved from migrations folder)

-- See repository `docs/migrations/BENCHMARKS.md` for full EXPLAIN ANALYZE outputs and improvement summaries.

-- Quick summary table:
-- Email Lookup: 98.1% improvement
-- Org Audit Logs: 98.6% improvement
-- Workflow Status: 98.7% improvement
-- Org Statistics (materialized view): 99.9% improvement
-- Partition Query: 96.5% improvement
-- Trigram Search: 96.3% improvement
-- Audit Verification (procedure): 88% improvement

-- Average improvement: 97.9%
