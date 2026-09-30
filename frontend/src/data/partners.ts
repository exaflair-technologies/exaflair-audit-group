export type Partner = {
  name: string;
  logoUrl: string; // file in public/partners/
  websiteUrl?: string;
  /** Square/stacked marks need more height than wide wordmarks to look the same size. */
  shape?: "wide" | "square";
};

/** Brands we've worked with, shown in the home-page logo strip in this order. The strip is hidden while this is empty. */
export const partners: Partner[] = [
  { name: "Propsearch", logoUrl: "/partners/propsearch.png" },
  { name: "QOX", logoUrl: "/partners/qox.png", shape: "square" },
  { name: "Soloyolo", logoUrl: "/partners/soloyolo.png" },
  { name: "Award", logoUrl: "/partners/award.png", shape: "square" },
  { name: "Paypledge", logoUrl: "/partners/paypledge.png" },
  { name: "G MX", logoUrl: "/partners/gmx.png", shape: "square" },
  { name: "Groundshaker Enterprises", logoUrl: "/partners/groundshaker.png" },
];
