import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trustscore.io";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/creators", "/creators/*", "/businesses", "/businesses/*", "/leaderboard", "/for-businesses", "/for-creators", "/methodology", "/pricing", "/advertise"],
      disallow: ["/dashboard", "/dashboard/*", "/admin", "/admin/*", "/api/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
