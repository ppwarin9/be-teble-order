CREATE UNIQUE INDEX "table_session_dining_table_id_open_idx" 
ON "table_session" ("dining_table_id") 
WHERE status = 'OPEN';