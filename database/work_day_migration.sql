CREATE TABLE IF NOT EXISTS boxoffice_days (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    work_date DATE NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

ALTER TABLE boxoffice_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select boxoffice_days"
ON boxoffice_days
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow insert boxoffice_days"
ON boxoffice_days
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow update boxoffice_days"
ON boxoffice_days
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

ALTER TABLE boxoffice_reports
ADD COLUMN IF NOT EXISTS day_id BIGINT;

ALTER TABLE boxoffice_reports
ADD CONSTRAINT fk_boxoffice_day
FOREIGN KEY (day_id)
REFERENCES boxoffice_days(id)
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_boxoffice_reports_day_id
ON boxoffice_reports(day_id);