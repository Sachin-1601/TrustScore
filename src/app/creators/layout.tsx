import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Trusted Creators | TrustScore",
  description: "Discover verified creators using TrustScore authenticity intelligence, engagement quality, and creator insights.",
  openGraph: {
    title: "Discover Trusted Creators | TrustScore",
    description: "Discover verified creators using TrustScore authenticity intelligence, engagement quality, and creator insights.",
    type: "website",
  },
};

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
