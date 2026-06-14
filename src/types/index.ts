export interface PublicChannel {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  categoryId: string;
  featured: boolean;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  channels: PublicChannel[];
}

export interface StreamTokenResponse {
  token: string;
  expiresIn: number;
  playbackUrl: string;
}

export interface AdminChannel extends PublicChannel {
  streamUrl: string;
  enabled: boolean;
  sortOrder: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  sortOrder: number;
  channels: AdminChannel[];
}
