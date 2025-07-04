CREATE TABLE gdtf_fixtures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rid INT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  revision VARCHAR(100),
  creation_date BIGINT,
  last_modified BIGINT,
  uploader VARCHAR(255),
  rating DECIMAL(3, 1),
  version VARCHAR(50),
  creator VARCHAR(255),
  uuid VARCHAR(36),
  filesize INT,
  thumbnail VARCHAR(255) NULL DEFAULT NULL
);

CREATE TABLE gdtf_modes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fixture_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dmx_footprint INT NOT NULL,
  FOREIGN KEY (fixture_id) REFERENCES gdtf_fixtures(id) ON DELETE CASCADE,
  UNIQUE KEY (fixture_id, name)
);

CREATE TABLE gdtf_channels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mode_id INT NOT NULL,
  channel_number INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  attribute VARCHAR(100) NOT NULL,
  -- ex: 'DIMMER', 'PAN'
  FOREIGN KEY (mode_id) REFERENCES gdtf_modes(id) ON DELETE CASCADE,
  UNIQUE KEY (mode_id, channel_number)
);


-- EXEMPLE QUERY
-- 1. Find fixtures with dimmer on channel 1 and pan on channel 3:
SELECT
  DISTINCT f.*
FROM
  fixtures f
  JOIN modes m ON m.fixture_id = f.id
  JOIN channels c1 ON c1.mode_id = m.id
  JOIN channels c3 ON c3.mode_id = m.id
WHERE
  c1.channel_number = 1
  AND c1.attribute = 'DIMMER'
  AND c3.channel_number = 3
  AND c3.attribute = 'PAN';
