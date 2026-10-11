ALTER TABLE support_tickets ADD COLUMN request_key VARCHAR(36);
CREATE UNIQUE INDEX support_ticket_request_key ON support_tickets(user_id, request_key);
