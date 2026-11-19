-- Enforce one claim per student for each reported item.
-- Pre-migration duplicate check must return no rows.

ALTER TABLE claims
    DROP INDEX idx_claims_item_claimant,
    ADD UNIQUE KEY uq_claims_item_claimant
        (item_report_id, claimant_id);