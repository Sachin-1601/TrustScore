import { db } from "@/db/client";
import { UserSession, UserRole } from "@/types/schema";

export class AuthService {
  /**
   * Authenticate with email & password
   */
  public static async login(email: string, passwordPlain: string): Promise<{ session: UserSession | null; error?: string }> {
    const user = await db.findUserByEmail(email);
    if (!user) {
      return { session: null, error: "Invalid email or password" };
    }

    // In production with real DB, use bcrypt.compare(passwordPlain, user.passwordHash)
    // For demo/seed accounts:
    const session: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      businessProfileId: user.role === "BUSINESS" ? "gymfuel" : undefined,
      creatorProfileId: user.role === "CREATOR" ? "alexfitness" : undefined,
    };

    return { session };
  }

  /**
   * Register a new user
   */
  public static async signup(data: {
    email: string;
    passwordPlain: string;
    name: string;
    role: UserRole;
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
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`,
    });

    const session: UserSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
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
