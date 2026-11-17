export type ProductCompanion = {
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  suitableFor: string[];
  professionalUse: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  size: string;
  category: string;
  description: string;
  image: string;
  gallery: string[];
  hairTypes: string[];
  concerns: string[];
  ingredients: string[];
  benefits: string[];
  suitableFor: string[];
  featured?: boolean;
  highlights?: string[];
  categories?: string[];
  heroBadge?: string;
  tagline?: string;
  ingredientDescriptions?: Record<string, string>;
  productDetails?: { label: string; value: string }[];
  brandLine?: string;
  companionProduct?: ProductCompanion;
  copyRevision?: number;
  copyFields?: ("name" | "size" | "description" | "hairTypes" | "concerns" | "ingredients" | "benefits" | "suitableFor")[];
};

// Approved AMREAL product photography supplied by the client.
export const products: Product[] = [
  {
    id: 1,
    name: "Permanent Hair Spa",
    slug: "permanent-hair-spa",
    size: "1000 ml / 300 ml",
    category: "Hair Care",
    heroBadge: "HERO PRODUCT • OUR FLAGSHIP RITUAL",
    tagline: "3–4 MONTHS OF LONGEVITY RETENTION, BLOW-DRIED LOOKS. ONE RITUAL. LONG-LASTING RESULTS.",
    description: "Our Hero salon ritual. Engineered for 3 to 4 months of longevity retention, smoother hair, effortless blow-dried looks, and deep fibre conditioning in just one professional ritual.",
    image: "/assets/permanent-spa-hair-ritual-1000ml.jpg",
    gallery: ["/assets/permanent-spa-hair-ritual-1000ml.jpg", "/assets/permanent-spa-hair-ritual-300ml.jpg", "/assets/permanent-spa-before-front.jpg", "/assets/permanent-spa-after-front.jpg", "/assets/permanent-spa-2-months-after.jpg", "/assets/permanent-spa-hair-ritual-pouring-bowl.jpg"],
    hairTypes: [
      "Suitable for All Hair Types",
      "Curly Hair",
      "Wavy Hair",
      "Coarse Hair",
      "Frizzy / Unruly Hair",
      "Dry Hair",
      "Dull / Rough Hair",
      "Colored / Dye-Treated Hair",
      "Henna-Treated Hair",
      "Chemically Treated Hair"
    ],
    concerns: [
      "Frizz & Flyaways",
      "Unmanageable Hair",
      "Dryness & Roughness",
      "Dullness & Lack of Shine",
      "Coarse / Unruly Texture",
      "Weakness & Breakage",
      "Hair Spa Longevity"
    ],
    ingredients: [
      "01 — Collagen Proteins — Fibre Conditioning",
      "02 — Hydrolyzed Keratin — Smoothness & Manageability",
      "03 — Argan Oil — Nourishment & Shine",
      "04 — Pro-Vitamin B5 — Softness & Conditioning"
    ],
    benefits: [
      "3–4 months of longevity retention, blow-dried looks",
      "More than a Hair SPA: 3–5 months of smoother, more manageable hair",
      "Effortless blow-dry: Less frizz, better manageability, faster styling",
      "One single ritual delivers long-lasting results",
      "Personalized according to hair texture, condition & treatment history",
      "Formaldehyde-free, odor-free, smoke-free, toxin-free, sulfate-free, paraben-free"
    ],
    suitableFor: [
      "Suitable for All Hair Types",
      "Personalized according to hair texture, condition & treatment history",
      "Professional Salons & Luxury Spas"
    ],
    featured: true,
    highlights: ["Hydrolyzed Wheat Protein", "Pro-Vitamin B5", "Collagen Plex", "Argan Oil", "0% Formaldehyde", "1000 ml", "300 ml"],
  },
  {
    id: 2,
    name: "Silk Protein Collagen Therapy",
    slug: "silk-protein-collagen-therapy",
    size: "1000 ml / 300 ml",
    category: "Hair Care",
    heroBadge: "PROFESSIONAL THERAPY",
    tagline: "PROFESSIONAL RESULTS CUSTOMIZED ACCORDING TO HAIR TEXTURE, CONDITION & CHEMICAL HISTORY.",
    description: "AMREAL Silk Protein Collagen Therapy repairs damaged hair, reduces frizz, and enhances shine. Delivers up to 100% straight results with smooth, sleek, manageable hair.",
    image: "/assets/silk-protein-1000ml.jpg",
    gallery: ["/assets/silk-protein-1000ml.jpg", "/assets/silk-protein-salon-application-1.jpg", "/assets/silk-protein-salon-application-2.jpg", "/assets/silk-protein-300ml-pending.svg"],
    hairTypes: ["Curly", "Wavy", "Frizzy / Unruly", "Coarse", "Dry", "Dull / Rough", "Colored / Dye-Treated", "Henna-Treated"],
    concerns: [
      "Frizz & Flyaways",
      "Unmanageable Hair",
      "Dryness & Roughness",
      "Dullness & Lack of Shine",
      "Coarse / Unruly Texture",
      "Weakness & Breakage"
    ],
    ingredients: [
      "Hydrolyzed Silk Protein — SILKY FEEL & SOFTNESS — Helps smooth the hair surface, improve softness and enhance shine for silky, manageable hair.",
      "Collagen Proteins & Plex — FIBRE CONDITIONING & STRENGTH — Helps condition damaged hair, improve flexibility and enhance the appearance of strength and elasticity.",
      "Hydrolyzed Keratin — Helps improve the feel, strength and manageability of damaged-looking hair",
      "Amino Acids + Cysteine — Support the hair fibre and contribute to a smoother, more manageable finish",
      "Argan Oil — Nourishes the hair and helps enhance softness and shine"
    ],
    benefits: [
      "Professional results customized according to hair texture, condition & chemical history",
      "Helps improve softness, smoothness and the silky feel of the hair fibre",
      "Provides deep conditioning and fibre-supporting care",
      "Helps improve the feel, strength and manageability of damaged-looking hair",
      "Amino Acids + Cysteine support the hair fibre for a smoother, more manageable finish",
      "Argan Oil nourishes the hair and helps enhance softness and radiant shine"
    ],
    suitableFor: [
      "Curly Hair",
      "Wavy Hair",
      "Frizzy / Unruly Hair",
      "Coarse Hair",
      "Dry Hair",
      "Dull / Rough Hair",
      "Colored / Dye-Treated Hair",
      "Henna-Treated Hair"
    ],
    featured: true,
    highlights: ["0% Formaldehyde", "Collagen Plex", "Hydrolyzed Silk Protein", "Cysteine", "1000 ml / 300 ml"],
  },
  {
    id: 3,
    name: "Coffee Scalp Scrub No.2",
    slug: "amreal-coffee-scalp-scrub-no-2",
    size: "200 ml",
    category: "Scalp Care",
    heroBadge: "PROFESSIONAL SCALP EXFOLIATION",
    tagline: "RESET THE SCALP. REFRESH THE ROOTS.",
    description: "A refined scalp-exfoliating treatment designed to lift surface flakes, excess buildup and impurities, leaving the scalp feeling refreshed, clean and balanced.",
    image: "/assets/coffee-scalp-scrub-jar.jpg",
    gallery: ["/assets/coffee-scalp-scrub-jar.jpg", "/assets/coffee-scalp-scrub-salon-wash.jpg", "/assets/coffee-scalp-scrub-before-after.jpg"],
    hairTypes: ["All Hair Types", "Oily Scalp", "Flaky Scalp", "Congested Scalp", "Normal Scalp"],
    concerns: ["Visible Flakes", "Scalp Buildup", "Product Residue", "Oily/Heavy Scalp Feel", "Dull, Congested Scalp", "Uneven Scalp Cleansing", "Scalp Requiring Exfoliation"],
    ingredients: [
      "Coffee Extract — Scalp Revitalisation & Antioxidant Care",
      "Salicylic Acid — Helps Loosen Flakes & Surface Buildup",
      "Lactic Acid — Gentle Exfoliation & Smoother Scalp Feel",
      "Pro-Vitamin B5 (D-Panthenol) — Conditioning & Moisture Support",
      "Vitamin E — Antioxidant & Nourishing Care"
    ],
    benefits: [
      "Helps remove visible scalp flakes and persistent buildup",
      "Gently exfoliates the scalp surface without stripping natural oils",
      "Helps lift excess residue, impurities and sebum",
      "Leaves the scalp feeling supremely fresh, balanced and thoroughly cleansed",
      "Prepares roots and follicles for optimal treatment absorption"
    ],
    suitableFor: ["Buildup-Prone", "Flaky", "Oily", "Congested", "Dull", "Normal Scalp"],
    featured: true
  },
  {
    id: 4,
    name: "NANOPLASTIA",
    slug: "amreal-nanoplastia-1000",
    size: "1000 ml / 300 ml",
    category: "Hair Care",
    heroBadge: "REALIGNMENT SYSTEM",
    tagline: "No foul smell. Smoke-free application. Up to 100% straight.",
    description: "A high-performance professional nanoplastia smoothing treatment formulated with Coconut Oil, Argan Oil, Cysteine and Glycolic Acid to deliver lasting sleekness, frizz control and mirror gloss.",
    image: "/assets/nanoplastia-photo-pending.svg",
    gallery: ["/assets/nanoplastia-photo-pending.svg", "/assets/nanoplastia-before-after-pending.svg"],
    hairTypes: ["Frizzy", "Coarse", "Dry", "Rough", "Unmanageable", "Dull Hair"],
    concerns: ["Frizz & Flyaways", "Coarse, Unmanageable Hair", "Dryness & Roughness", "Difficult-to-Manage Hair", "Uneven Hair Texture"],
    ingredients: [
      "Coconut Oil — Deep Nourishment, Lipid Replenishment & Radiant Shine",
      "Argan Oil — Softness, Conditioning & High Gloss",
      "Cysteine & Amino Acids — Hair Fibre Care & Long-Lasting Smoothness",
      "Glycolic Acid — Helps Support Smoother, More Manageable Hair",
      "Hydrolyzed Proteins — Fibre Conditioning & Strength Support",
      "Pro-Vitamin B5 — Moisture & Conditioning Support"
    ],
    benefits: [
      "Helps create a smoother, more polished hair surface",
      "Helps reduce the appearance of frizz and flyaways",
      "Creates a sleek, more controlled finish with natural bounce",
      "Helps maintain smoother-looking hair for an extended period"
    ],
    suitableFor: ["Frizzy", "Coarse", "Dry", "Rough", "Unmanageable", "Dull Hair", "Salons"],
    featured: true,
    highlights: ["0% Formaldehyde", "Coconut Oil", "Amino Cysteine", "1000 ml", "300 ml", "Argan Oil"],
  },
  {
    id: 5,
    name: "AMREAL Anti-Hairfall Scalp Tonic",
    slug: "anti-hairfall-scalp-tonic",
    size: "50 ml",
    category: "Scalp Care",
    heroBadge: "DHT-PATHWAY SUPPORT",
    tagline: "CLINICAL-GRADE FOLLICLE VITALITY & DENSITY",
    description: "A lightweight leave-on scalp tonic engineered with 3% Redensyl, 4% Anagain, Caffeine, Niacinamide, Biotin, B2 Complex and Guava Leaf Extract for targeted scalp care around DHT pathways and thinning-looking hair.",
    image: "/assets/anti-hairfall-tonic-marble.jpg",
    gallery: ["/assets/anti-hairfall-tonic-marble.jpg", "/assets/anti-hairfall-tonic-fur.jpg", "/assets/anti-hairfall-tonic-before-after.jpg"],
    hairTypes: ["Normal Scalp", "Oily Scalp", "Dry Scalp", "Combination Scalp", "Thinning Hair", "Weak Roots"],
    concerns: [
      "Excessive Hair Shedding",
      "Thinning-Looking Hair",
      "Reduced Hair Density",
      "Weak / Fragile-Looking Hair",
      "Loss of Fuller Appearance",
      "Hair That Looks Less Dense Over Time"
    ],
    ingredients: ["3% Redensyl", "4% Anagain", "B2 Complex", "Caffeine", "Niacinamide", "Biotin", "Guava Leaf Extract"],
    benefits: [
      "Supports Scalp Vitality: Helps maintain a healthy-looking scalp environment",
      "Supports Fuller-Looking Hair: Designed to help maintain the appearance of thicker, fuller, stronger-looking hair",
      "Scalp & DHT-Pathway Support: Formulated for targeted scalp care around DHT-pathway-related concerns",
      "Lightweight Leave-On Care: A lightweight scalp tonic designed for regular use without a heavy, oily feel",
      "Daily Scalp Support: Suitable as part of a consistent scalp-care routine"
    ],
    suitableFor: [
      "Normal Scalp",
      "Oily Scalp",
      "Dry Scalp",
      "Combination Scalp",
      "Ideal for people experiencing Hair Shedding, Thinning-Looking Hair, Reduced Density & Weak-Looking Hair"
    ],
    featured: true,
    categories: ["Scalp Care", "Home Care"],
  },
  {
    id: 6,
    name: "AMREAL Collagen Plex Biotin Masque",
    slug: "collagen-plex-biotin-masque-500",
    copyRevision: 1,
    copyFields: ["name"],
    size: "500 ml / 250 ml",
    category: "Home Care",
    heroBadge: "FIBRE RECOVERY",
    tagline: "INTENSIVE BOND RECOVERY & NOURISHMENT",
    description: "Big 500 ml professional format. Restorative intensive masque engineered to replenish dry, chemically stressed and damaged hair, rebuilding fibre elasticity and softness.",
    image: "/assets/collagen-plex-masque-marble.jpg",
    gallery: ["/assets/collagen-plex-masque-marble.jpg", "/assets/collagen-plex-masque-fur.jpg"],
    hairTypes: [
      "Dry Hair",
      "Weak Hair",
      "Damaged Hair",
      "Chemically Treated Hair",
      "Colored Hair",
      "Frizzy Hair",
      "Rough Hair"
    ],
    concerns: [
      "Dryness",
      "Weakness",
      "Hair Breakage",
      "Chemically Stressed Hair",
      "Roughness",
      "Loss of Softness",
      "Loss of Shine",
      "Damaged-Looking Hair",
      "Unmanageable Hair"
    ],
    ingredients: [
      "Collagen Plex — Intensive Fibre Rebuilding & Elasticity Support",
      "Biotin — Strengthens Hair Shaft & Fights Breakage",
      "Pro-Vitamin B5 — Deep Moisture Retention & Softness",
      "Argan Oil — Nourishment & Radiant Mirror Shine"
    ],
    benefits: [
      "Replenishes dry and weakened hair",
      "Strengthens the hair fibre",
      "Smoothens rough, stressed hair",
      "Helps improve softness & manageability",
      "Helps enhance shine",
      "Provides conditioning and nourishment",
      "Helps support hair after chemical treatments",
      "Helps improve the feel of damaged-looking hair"
    ],
    suitableFor: [
      "Dry, Weak, Damaged Hair",
      "Chemically Treated & Colored Hair",
      "Frizzy & Rough Hair",
      "Especially suitable for hair requiring intensive conditioning, replenishment and fibre care",
    ],
    featured: true
  },
  {
    id: 7,
    name: "AMREAL Collagen Plex Biotin Masque",
    slug: "collagen-plex-biotin-masque-250",
    copyRevision: 1,
    copyFields: ["name"],
    size: "500 ml / 250 ml",
    category: "Home Care",
    description: "Small 250 ml compact format for targeted salon routines and home maintenance prescription.",
    image: "/assets/collagen-plex-masque-fur.jpg",
    gallery: ["/assets/collagen-plex-masque-fur.jpg", "/assets/collagen-plex-masque-marble.jpg"],
    hairTypes: [
      "Dry Hair",
      "Weak Hair",
      "Damaged Hair",
      "Chemically Treated Hair",
      "Colored Hair",
      "Frizzy Hair",
      "Rough Hair"
    ],
    concerns: [
      "Dryness",
      "Weakness",
      "Hair Breakage",
      "Chemically Stressed Hair",
      "Roughness",
      "Loss of Softness",
      "Loss of Shine",
      "Damaged-Looking Hair",
      "Unmanageable Hair"
    ],
    ingredients: [
      "Collagen Plex — Intensive Fibre Rebuilding & Elasticity Support",
      "Biotin — Strengthens Hair Shaft & Fights Breakage",
      "Pro-Vitamin B5 — Deep Moisture Retention & Softness",
      "Argan Oil — Nourishment & Radiant Mirror Shine"
    ],
    benefits: [
      "Replenishes dry and weakened hair",
      "Strengthens the hair fibre",
      "Smoothens rough, stressed hair",
      "Helps improve softness & manageability",
      "Helps enhance shine",
      "Provides conditioning and nourishment",
      "Helps support hair after chemical treatments",
      "Helps improve the feel of damaged-looking hair"
    ],
    suitableFor: [
      "Dry, Weak, Damaged Hair",
      "Chemically Treated & Colored Hair",
      "Frizzy & Rough Hair",
      "Especially suitable for hair requiring intensive conditioning, replenishment and fibre care"
    ],
    featured: false
  },
  {
    id: 8,
    name: "NANOPLASTIA",
    slug: "amreal-nanoplastia-300",
    size: "300 ml",
    category: "Hair Care",
    description: "Compact 300 ml professional nanoplastia format for trial and bespoke salon applications.",
    image: "/assets/nanoplastia-photo-pending.svg",
    gallery: ["/assets/nanoplastia-photo-pending.svg", "/assets/nanoplastia-before-after-pending.svg"],
    hairTypes: ["Frizzy", "Coarse", "Dry", "Rough", "Unmanageable"],
    concerns: ["Frizz", "Smoothing", "Damage"],
    ingredients: [
      "Coconut Oil — Nourishment & Radiant Shine",
      "Argan Oil — Softness & Gloss",
      "Cysteine & Amino Acids — Fibre Alignment",
      "Glycolic Acid — Smoothing Support"
    ],
    benefits: [
      "Same full-strength Nanoplastia formulation in a 300 ml format",
      "Sleek, controlled finish and extended frizz elimination"
    ],
    suitableFor: ["Salons", "Hair Professionals"],
    featured: false
  },
  {
    id: 9,
    name: "Silk Protein Collagen Therapy",
    slug: "silk-protein-sample",
    size: "1000 ml / 300 ml",
    category: "Hair Care",
    description: "AMREAL Silk Protein Collagen Therapy repairs damaged hair, reduces frizz, and enhances shine. Delivers up to 100% straight results with smooth, sleek, manageable hair.",
    image: "/assets/silk-protein-1000ml.jpg",
    gallery: ["/assets/silk-protein-1000ml.jpg", "/assets/silk-protein-salon-application-1.jpg", "/assets/silk-protein-salon-application-2.jpg", "/assets/silk-protein-300ml-pending.svg"],
    hairTypes: ["Curly", "Wavy", "Frizzy", "Coarse", "Dry", "Coloured"],
    concerns: ["Frizz", "Smoothing", "Damage"],
    ingredients: [
      "Hydrolyzed Silk Protein — Silky feel and smoothness",
      "Hydrolyzed Collagen — Fibre conditioning care",
      "Argan Oil — Nourishment and shine"
    ],
    benefits: ["Discovery format for salon trials", "Complete Silk Protein formulation"],
    suitableFor: ["Beauty Professionals", "Salons"],
    featured: false
  },
  {
    id: 10,
    name: "Anti-Dandruff Shampoo",
    slug: "amreal-scalp-detox-shampoo-1000",
    copyRevision: 1,
    size: "1000 ml",
    category: "Scalp Care",
    tagline: "Targeted Scalp Care | Flake Control | Balanced Cleansing",
    description: "A professional scalp-care shampoo formulated to help remove visible flakes, loosen scalp buildup and cleanse excess oil. Powered by Salicylic Acid (BHA), Climbazole, Piroctone Olamine and Tea Tree Oil, its targeted formula supports dandruff-prone scalp care while Pro-Vitamin B5 helps maintain hair softness and manageability.",
    image: "/assets/scalp-detox-anti-dandruff-shampoo-1000ml.jpg",
    gallery: ["/assets/scalp-detox-anti-dandruff-shampoo-1000ml.jpg"],
    hairTypes: ["Dandruff-prone", "Flaky", "Oily scalp"],
    concerns: ["Visible Flakes", "Scalp Buildup", "Excess Oil", "Dandruff-prone Scalp"],
    ingredients: ["Salicylic Acid (BHA)", "Climbazole", "Piroctone Olamine", "Tea Tree Oil", "Pro-Vitamin B5"],
    ingredientDescriptions: {
      "Salicylic Acid (BHA)": "",
      "Climbazole": "",
      "Piroctone Olamine": "",
      "Tea Tree Oil": "",
      "Pro-Vitamin B5": "Helps maintain hair softness and manageability."
    },
    benefits: ["Helps reduce visible flakes", "Cleanses excess oil and scalp buildup", "Supports dandruff-prone scalp care", "Helps maintain hair softness and manageability"],
    suitableFor: ["Dandruff-prone", "Flaky", "Oily scalp"],
    companionProduct: {
      name: "Anti-Dandruff Scalp Mask",
      tagline: "Scalp Purification | Flake Care | Refreshing Comfort",
      description: "A professional scalp mask designed to complement an anti-dandruff cleansing routine. It helps remove residual buildup, refresh the scalp and leave hair feeling clean and manageable.",
      benefits: ["Helps loosen residual scalp buildup", "Supports a clean, refreshed scalp", "Complements an anti-dandruff hair-care routine", "Leaves hair feeling soft and manageable"],
      suitableFor: ["Dandruff-prone", "Oily", "Buildup-prone scalp"],
      professionalUse: "Use according to the product’s directions and avoid application to irritated or broken skin."
    },
    featured: false,
    categories: ["Scalp Care", "Home Care"],
  },
  {
    id: 11,
    name: "Collagen Plex Maintenance Shampoo",
    slug: "maintenance-shampoo",
    copyRevision: 1,
    size: "1000 ml",
    category: "Home Care",
    tagline: "Colour Protection | Strength | Smoothness",
    description: "A professional maintenance shampoo formulated with Quinoa Protein and a Biotin Complex to cleanse the hair while supporting softness, strength and manageability. Designed to complement salon hair treatments, it helps maintain smooth-looking hair, enhance shine and preserve the appearance of colour-treated hair.",
    image: "/assets/maintenance-shampoo-1000ml.jpg",
    gallery: ["/assets/maintenance-shampoo-1000ml.jpg", "/assets/maintenance-shampoo-300ml.jpg"],
    hairTypes: ["Dry", "Frizzy", "Coloured", "Chemically Treated", "Treated Hair"],
    concerns: ["Dryness", "Frizz", "Colour Protection", "Smoothness", "Manageability"],
    ingredients: ["Quinoa Protein", "Biotin Complex", "Collagen Plex"],
    ingredientDescriptions: {
      "Quinoa Protein": "Helps condition hair and improve its smooth feel.",
      "Biotin Complex": "Supports the product’s hair-care positioning.",
      "Collagen Plex": "Designed for a smooth, manageable finish."
    },
    benefits: ["Helps maintain hair strength and smoothness", "Supports softness and manageability", "Helps preserve colour vibrancy", "Complements salon hair treatments", "Sulphate-free and paraben-free formula"],
    suitableFor: ["Dry", "Frizzy", "Coloured", "Chemically Treated", "Treated Hair"],
    productDetails: [
      { label: "Category", value: "Professional Hair Care" },
      { label: "Available Size", value: "1000 ml" },
      { label: "Usage", value: "Regular maintenance after salon hair treatments, as directed." }
    ],
    brandLine: "AMREAL PROFESSIONAL — Rebuild • Strengthen • Smooth.",
    featured: true
  },
{
  "id": 12,
  "name": "Pure Proteins",
  "slug": "pure-proteins",
  "size": "Enquire for sizes",
  "category": "Hair Care",
  "description": "Contact AMREAL for Pure Proteins product details and availability.",
  "image": "/assets/pure-proteins-photo-pending.svg",
  "gallery": [
    "/assets/pure-proteins-photo-pending.svg"
  ],
  "hairTypes": [],
  "concerns": [],
  "ingredients": [],
  "benefits": [],
  "suitableFor": []
}
];

export const categories = [
  { name: "Hair Care", description: "Permanent Hair Spa (Hair Ritual), Silk Protein, Nanoplastia & Pure Proteins.", image: "/assets/permanent-spa-hair-ritual-1000ml.jpg" },
  { name: "Scalp Care", description: "Anti Dandruff Shampoo, Scalp Scrub & Anti Hair Fall Tonic.", image: "/assets/coffee-scalp-scrub-jar.jpg" },
  { name: "Home Care", description: "Maintenance Shampoo, Anti Dandruff Shampoo, Hair Mask & Hair Fall Serum.", image: "/assets/maintenance-shampoo-1000ml.jpg" }
];

export const hairTypes = [
  { name: "COLOURED", text: "Protect colour vibrancy, prevent fade and maintain silkiness.", image: "/assets/hair-type-coloured.jpg" },
  { name: "CURLY & WAVY", text: "Tame unruliness, boost elasticity and define smooth texture.", image: "/assets/hair-type-curly-wavy.jpg" },
  { name: "COARSE & FRIZZY", text: "Deep fibre realignment for 3–5 months of smooth manageability.", image: "/assets/hair-type-coarse-frizzy.jpg" },
  { name: "DAMAGED & WEAK", text: "Bond rebuilding with Collagen Plex and Biotin infrastructure.", image: "/assets/hair-type-damaged-weak.jpg" }
];

export const concerns = [
  "Hair Spa",
  "Frizz",
  "Smoothing",
  "Scalp",
  "Hair Fall",
  "Visible Flakes",
  "Dryness",
  "Damage",
  "Weakness"
];

export const heroSlides = [
  {
    eyebrow: "AMREAL PROFESSIONAL",
    title: "BEAUTIFUL HAIR. HAPPIER YOU.",
    text: "Discover our science-led salon formulations engineered for every hair texture — straight, wavy, curly, coarse and chemically treated.",
    image: "/assets/amreal-catalog-girls-cover.png",
    badge: "Official Catalog Lookbook",
    link: "/products",
    category: "Lookbook",
    highlights: ["4 Hair Textures", "Science-Backed", "Salon Grade"]
  },
  {
    eyebrow: "OUR HERO SALON RITUAL",
    title: "PERMANENT HAIR SPA.",
    text: "More than a SPA, up to 4 months of more manageable hair.",
    image: "/assets/permanent-spa-hair-ritual-1000ml.jpg",
    badge: "Hero Product • Flagship Ritual",
    link: "/products/permanent-hair-spa",
    category: "Hero Ritual",
    highlights: ["Up to 4 Months", "Effortless Blow-Dry", "Formaldehyde-Free"]
  },
  {
    eyebrow: "ADVANCED FIBRE SMOOTHING",
    title: "SILK PROTEIN COLLAGEN THERAPY.",
    text: "AMREAL Silk Protein Collagen Therapy repairs damaged hair, reduces frizz, and enhances shine. Delivers up to 100% straight results with smooth, sleek, manageable hair.",
    image: "/assets/silk-protein-1000ml.jpg",
    badge: "Silk & Collagen Therapy",
    link: "/products/silk-protein-collagen-therapy",
    category: "Smoothing System",
    highlights: ["Hydrolyzed Silk", "Cysteine Rebuilding", "Frizz & Flyaway Defense"]
  },
  {
    eyebrow: "MOLECULAR REALIGNMENT",
    title: "NANOPLASTIA",
    text: "Intense cuticle realignment and long-lasting frizz elimination with Coconut Oil, Argan Oil, Cysteine and Glycolic Acid.",
    image: "/assets/nanoplastia-photo-pending.svg",
    badge: "Realignment System",
    link: "/products/amreal-nanoplastia-1000",
    category: "Realignment",
    highlights: ["No foul smell", "Smoke-free application", "Up to 100% straight"]
  },
  {
    eyebrow: "TARGETED SCALP CARE",
    title: "Anti-Dandruff Shampoo",
    text: "A professional scalp-care shampoo formulated to help remove visible flakes, loosen scalp buildup and cleanse excess oil.",
    image: "/assets/scalp-detox-anti-dandruff-shampoo-1000ml.jpg",
    badge: "Nº1.1 Professional Shampoo • 1000 ml",
    link: "/products/amreal-scalp-detox-shampoo-1000",
    category: "Purifying",
    highlights: ["Flake Control", "Balanced Cleansing", "Scalp Care"]
  }
,
  { eyebrow: "HOME CARE", title: "COLLAGEN PLEX BIOTIN MASQUE", text: "Intensive conditioning for dry, weak and chemically stressed hair. Available in 500 ml and 250 ml.", image: "/assets/collagen-plex-masque-marble.jpg", badge: "Collagen Plex Hair Mask", link: "/products/collagen-plex-biotin-masque-500", category: "Masque", highlights: ["Conditioning", "Softness", "Manageability"] }
];
