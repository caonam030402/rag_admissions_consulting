export type MediaType = "image" | "video" | "360";

export interface Media {
  id: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
}

export interface Major {
  name: string;
  description: string;
  highlightPoints?: string[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: "academic" | "facility" | "housing" | "recreation" | "admin";
  coordinates: { x: number; y: number };
  media: Media[];
  majors?: Major[];
  facilities?: string[];
  people?: {
    name: string;
    role: string;
    quote?: string;
    image?: string;
  }[];
}

export interface TourData {
  university: {
    name: string;
    description: string;
    logo: string;
  };
  locations: Location[];
  guides: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    personality: string;
    voiceId?: string;
  }[];
}

export interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onSelect: () => void;
}

export interface MediaViewerProps {
  media: Media[];
  onClose: () => void;
}

export interface TourGuideProps {
  currentLocation: Location | null;
  onClose: () => void;
}

export interface VirtualMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
}
