export interface gdtfFixtures {
  id: number;
  rid: number;
  name: string;
  manufacturer: string;
  revision?: string;
  creation_date?: number; // Timestamp in UNIX
  last_modified?: number; // Timestamp in UNIX
  uploader?: string;
  rating?: number; // Decimal with one decimal place
  version?: string;
  creator?: string;
  uuid?: string; // UUID format
  filesize?: number; // File size in bytes
  thumbnail?: string | null; // URL or path to the thumbnail image
  modes?: gdtfMode[]; // Array of modes associated with this GDTF database entry
}

export interface gdtfMode {
  id: number;
  fixture_id: number; // Foreign key to gdtf_fixtures
  name: string; // Name of the mode
  description?: string; // Optional description of the mode
  dmx_footprint: number; // Number of physical channels in this mode
  channels?: gdtfChannels[]; // Array of channels associated with this mode
}

export interface gdtfChannels {
  id: number;
  mode_id: number; // Foreign key to gdtf_modes
  channel_number: number; // Channel number in the mode
  name: string; // Name of the channel
  attribute: string; // Type of channel, e.g., 'DIMMER', 'PAN'
}
