CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  -- 'admin', 'editor', 'user'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE building_editors (
  id SERIAL PRIMARY KEY,
  building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'editor' -- 'editor', 'viewer', etc.
);

CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  building_id INT REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  -- teatre, sala, espai obert...
  description JSONB,
  -- traduïble: { "ca": "...", "en": "...", ... }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venue_editors (
  id SERIAL PRIMARY KEY,
  venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'editor'
);

CREATE TABLE venue_details (
  id SERIAL PRIMARY KEY,
  venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
  detail_key VARCHAR(100),
  -- ex: 'escenari', 'il·luminació'
  content JSONB,
  -- traduïble o formatat: { "ca": "<b>Contingut</b>", ... }
  is_rich_text BOOLEAN DEFAULT TRUE
);

CREATE TABLE venue_files (
  id SERIAL PRIMARY KEY,
  venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
  filename VARCHAR(255),
  file_type VARCHAR(100),
  -- pdf, plànol, mvr, foto...
  language VARCHAR(10),
  -- {
  --   "ca": "Sala gran amb prosceni",
  --   "es": "Sala grande con proscenio",
  --   "en": "Main hall with proscenium"
  -- }
  file_url TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venue_ratings (
  id SERIAL PRIMARY KEY,
  venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (
    rating BETWEEN 1
    AND 5
  ),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERT
-- Inserim un usuari editor
INSERT INTO
  users (name, email, password_hash)
VALUES
  ('Maria Vila', 'maria@example.com', 'hash123');

-- Inserim un edifici
INSERT INTO
  buildings (
    name,
    address,
    city,
    country,
    latitude,
    longitude,
    created_by
  )
VALUES
  (
    'Teatre Nacional de Catalunya',
    'Plaça de les Arts, 1',
    'Barcelona',
    'Espanya',
    41.4064,
    2.1896,
    1 -- l'ID de la Maria
  );

-- Inserim una sala dins l'edifici amb descripció traduïda
INSERT INTO
  venues (building_id, name, type, description)
VALUES
  (
    1,
    'Sala Gran',
    'teatre',
    '{
    "ca": "Sala gran amb aforament per a més de 800 persones.",
    "en": "Main hall with capacity for over 800 people.",
    "es": "Sala grande con aforo para más de 800 personas."
  }'
  );

--select
SELECT
  v.id,
  v.name,
  v.type,
  JSON_UNQUOTE(JSON_EXTRACT(v.description, '$.ca')) AS descripcio_ca
FROM venues v
WHERE v.id = 1;
