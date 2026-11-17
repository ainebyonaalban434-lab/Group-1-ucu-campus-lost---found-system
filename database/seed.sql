USE ucu_lost_found_db;

INSERT INTO users (full_name, email, password_hash, role) VALUES
  ('Maya Nsubuga', 'student.ucu@example.com', '$2b$10$bMVh0YoQVl6bRybWpjVxVO55GKaFXR9KSPmNrRSc.YDped8v5TyqS', 'STUDENT'),
  ('Rita Kasozi', 'admin.ucu@example.com', '$2b$10$8QX64yyPJBGVGw/gUA2jEeCDaamODoXzlGiNjOgH1Pax1S3MUm9Y6', 'ADMIN'),
  ('Joel Ainomugisha', 'joel.ucu@example.com', '$2b$10$QfCFX4gP97iK2tW4W3h9W.b2VQ0D7rIrqjzolAHwWJ4QC2g6v9n7a', 'STUDENT');

INSERT INTO item_reports (reporter_id, item_type, title, category, public_description, private_details, item_date, campus_location, image_url, status) VALUES
  (1, 'FOUND', 'Blue water bottle', 'Personal accessories', 'Found a blue bottle with a university sticker near the library study hall.', 'Bottle contains a name label with the initials M.N. and a telephone number on a paper tag.', '2026-11-10', 'Main Library', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80', 'OPEN'),
  (1, 'LOST', 'Black laptop charger', 'Electronics', 'Lost a black charger while moving between the computer lab and the cafeteria.', 'The charger has a red tape wrap and a university ID tag.', '2026-11-08', 'Computer Lab', NULL, 'OPEN');

INSERT INTO claims (item_report_id, claimant_id, evidence, status, admin_response, reviewed_by) VALUES
  (1, 3, 'I am the owner of the blue bottle. It has my initials M.N. and the same sticker pattern described in the private details.', 'PENDING', NULL, NULL);
