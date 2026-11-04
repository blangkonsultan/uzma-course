-- scripts/sql/financial-contract-fixtures.sql
-- Setup temporary tables for financial contract tests
CREATE TEMP TABLE IF NOT EXISTS qa_financial_ids (
    key TEXT PRIMARY KEY,
    id UUID NOT NULL
) ON COMMIT PRESERVE ROWS;
