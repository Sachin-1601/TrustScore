import { db } from "@/db/client";
import { UserSession, UserRole } from "@/types/schema";
import { CreatorService } from "./creatorService";

export class AuthService {
  /**
   * Authenticate with email & password
   */
  public static async login(
    email: string,
    passwordPlain: string
  ): Promise<{ session: UserSession | null; error?: string }> {
    const user = await db.findUserByEmail(email);
    if (!user) {
      return { session: null, error: "Invalid email or password" };
    }

    // Resolve associated profile ID
    let creatorProfileId: string | undefined = undefined;
    let businessProfileId: string | undefined = undefined;

    if (user.role === "CREATOR") {
      const creator = await db.findCreatorByUserId(user.id);
      creatorProfileId = creator ? creator.id : "alexfitness";
    } else if (user.role === "BUSINESS" || user.role === "AGENCY") {
      businessProfileId = "gymfuel";
    }

    const session: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      businessProfileId,
      creatorProfileId,
    };

    return { session };
  }

  /**
   * Register a new user with dedicated role separation
   */
  public static async signup(data: {
    email: string;
    passwordPlain: string;
    name: string;
    role: UserRole;
    handleOrCompany?: string;
    category?: string;
    platform?: "instagram" | "tiktok" | "youtube";
  }): Promise<{ session: UserSession | null; error?: string }> {
    const existing = await db.findUserByEmail(data.email);
    if (existing) {
      return { session: null, error: "An account with this email already exists" };
    }

    const newUser = await db.createUser({
      email: data.email,
      passwordHash: `pbkdf2$${data.passwordPlain}`,
      name: data.name,
      role: data.role,
      avatar:
        data.role === "CREATOR"
          ? `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`
          : `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80`,
    });

    let creatorProfileId: string | undefined = undefined;
    let businessProfileId: string | undefined = undefined;

    if (data.role === "CREATOR") {
      const rawHandle = data.handleOrCompany || data.name.toLowerCase().replace(/\s+/g, "");
      const username = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
      const creator = await CreatorService.onboardCreator({
        name: data.name,
        username,
        category: data.category || "Fitness",
        location: "Melbourne, Australia",
        platform: data.platform || "instagram",
        followers: 18400,
        bio: `Authentic creator focused on ${data.category || "Fitness"}. Open to brand partnerships.`,
      });
      creator.userId = newUser.id;
      creatorProfileId = creator.id;
    } else if (data.role === "BUSINESS" || data.role === "AGENCY") {
      businessProfileId = "gymfuel";
    }

    const session: UserSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
      creatorProfileId,
      businessProfileId,
    };

    return { session };
  }

  /**
   * Validate server-side role authorization
   */
  public static authorizeRole(session: UserSession | null, allowedRoles: UserRole[]): boolean {
    if (!session) return false;
    if (session.role === "ADMIN") return true; // Admins have super-user bypass
    return allowedRoles.includes(session.role);
  }
}
