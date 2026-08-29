import { db } from "@/db/client";
import { Business } from "@/types/creator";

export class BusinessService {
  public static async getBusinesses(query?: string, category?: string): Promise<Business[]> {
    let all = await db.listBusinesses();

    if (query?.trim()) {
      const q = query.toLowerCase();
      all = all.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    if (category && category !== "all") {
      all = all.filter((b) => b.category.toLowerCase() === category.toLowerCase());
    }

    return all;
  }

  public static async getBusinessBySlug(slug: string): Promise<Business | null> {
    return db.findBusinessBySlug(slug);
  }

  public static async onboardBusiness(data: {
    name: string;
    category: string;
    location: string;
    website: string;
    tagline: string;
    description: string;
  }): Promise<Business> {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const newBusiness: Business = {
      id: slug,
      slug,
      name: data.name,
      logo: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=120&auto=format&fit=crop&q=80",
      category: data.category,
      location: data.location,
      tagline: data.tagline,
      description: data.description,
      website: data.website,
      isSponsored: false,
      activeCampaignsCount: 1,
      productsOrServices: ["Custom Partnerships", "Creator Retainers"],
      openOpportunities: [
        {
          title: "Creator Brand Ambassador Program",
          budget: "$500 – $1,200 / month",
          deliverables: "Monthly Dedicated Content + Event Gifting",
          category: data.category as any,
        },
      ],
      contactEmail: `partnerships@${slug}.example.com`,
      joinedDate: "August 2026",
    };

    return db.createBusiness(newBusiness);
  }
}
