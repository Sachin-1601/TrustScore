import { MOCK_CREATORS } from "@/data/mockCreators";
import { MOCK_BUSINESSES } from "@/data/mockBusinesses";
import { MOCK_SPONSORED_ADS, MOCK_AD_PACKAGES } from "@/data/mockAdvertisements";
import { MOCK_COLLABORATION_REQUESTS } from "@/data/mockCollaborations";

export interface SeedUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "CREATOR" | "BUSINESS" | "AGENCY" | "ADMIN";
  avatar: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: "user-sarah-business",
    email: "sarah@acmebrand.com",
    passwordHash: "pbkdf2_sha256$mockhash$sarah123",
    name: "Sarah Jenkins",
    role: "BUSINESS",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "user-alex-creator",
    email: "alex@fitness.example.com",
    passwordHash: "pbkdf2_sha256$mockhash$alex123",
    name: "Alex Rivera",
    role: "CREATOR",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "user-david-agency",
    email: "david@apexagency.com",
    passwordHash: "pbkdf2_sha256$mockhash$david123",
    name: "David Kim",
    role: "AGENCY",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "user-admin",
    email: "admin@trustscore.io",
    passwordHash: "pbkdf2_sha256$mockhash$admin123",
    name: "TrustScore Admin",
    role: "ADMIN",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
  },
];

export const SEED_CREATORS = MOCK_CREATORS;
export const SEED_BUSINESSES = MOCK_BUSINESSES;
export const SEED_ADS = MOCK_SPONSORED_ADS;
export const SEED_COLLABORATIONS = MOCK_COLLABORATION_REQUESTS;
export const SEED_PACKAGES = MOCK_AD_PACKAGES;
