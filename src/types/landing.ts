export interface HeroContent {
  badgeText: string;
  title: string;
  subtitle: string;
  description: string;
  featurePills: string[];
  primaryCtaText: string;
  secondaryCtaText: string;
  secondaryCtaHref: string;
}

export interface ProgramLicenseInfo {
  provider: string;
  url?: string;
  description?: string;
}

export interface ProgramItem {
  id: string;
  initials: string;
  name: string;
  tagline: string;
  description: string;
  ageRange: string;
  icon: string;
  type: "franchise" | "original";
  logoUrl?: string;
  licenseInfo?: ProgramLicenseInfo;
  variants: { id: string; name: string; duration: number; system: number; }[];
  frequency: number;
  features: string[];
}

export interface ProgramsContent {
  title: string;
  subtitle: string;
  items: ProgramItem[];
}

export interface WhyUsItem {
  icon: string;
  title: string;
  description: string;
}

export interface WhyUsContent {
  title: string;
  subtitle: string;
  items: WhyUsItem[];
}

export interface FacilityItem {
  title: string;
  description: string;
  icon: string;
}

export interface FacilitiesContent {
  title: string;
  subtitle: string;
  items: FacilityItem[];
}

export interface TeamValueItem {
  title: string;
  description: string;
  icon: string;
}

export interface TeamContent {
  title: string;
  subtitle: string;
  teamPhotoUrl: string;
  teamPhotoAlt: string;
  teamBadge: string;
  teamHeading: string;
  teamDescription: string;
  founderName: string;
  founderRole: string;
  founderQuote: string;
  founderPhotoUrl?: string;
  founderPhotoAlt?: string;
  values: TeamValueItem[];
}

export interface GalleryImage {
  url: string;
  alt: string;
}

export interface GalleryGroup {
  label: string;
  images: GalleryImage[];
}

export interface GalleryContent {
  title: string;
  subtitle: string;
  groups: GalleryGroup[];
}

export interface TestimonialItem {
  quote: string;
  parentName: string;
  programLabel: string;
}

export interface TestimonialsContent {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface VideoItem {
  id: string;
  title: string;
  source: "youtube" | "tiktok";
  embedUrl: string;
}

export interface VideosContent {
  title: string;
  subtitle: string;
  items: VideoItem[];
}

export interface BranchItem {
  id: string;
  name: string;
  subName: string;
  address: string;
  mapUrl: string;
  gmapsUrl: string;
}

export interface LocationsContent {
  title: string;
  subtitle: string;
  items: BranchItem[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQContent {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

export interface CTAContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "whatsapp"
  | "x"
  | "telegram"
  | "linkedin"
  | "threads"
  | "website";

export interface SocialMediaItem {
  platform: SocialPlatform | string;
  url: string;
  label?: string;
}

export type FooterSocialLinks = SocialMediaItem[];

export interface FooterNavLink {
  label: string;
  href: string;
}

export interface FooterContent {
  tagline: string;
  socialLinks: SocialMediaItem[];
  contactPhone: string;
  contactWaDisplay: string;
  navLinks: FooterNavLink[];
}

export interface NavbarNavLink {
  label: string;
  href: string;
}

export interface NavbarContent {
  brandName: string;
  navLinks: NavbarNavLink[];
  ctaText: string;
}

export interface FloatingWaContent {
  isEnabled: boolean;
}

export type LandingSectionKey =
  | "hero"
  | "programs"
  | "why_us"
  | "facilities"
  | "team"
  | "gallery"
  | "testimonials"
  | "videos"
  | "locations"
  | "faq"
  | "cta"
  | "footer"
  | "navbar"
  | "floating_wa";

export interface AllLandingContent {
  hero: HeroContent;
  programs: ProgramsContent;
  why_us: WhyUsContent;
  facilities: FacilitiesContent;
  team: TeamContent;
  gallery: GalleryContent;
  testimonials: TestimonialsContent;
  videos: VideosContent;
  locations: LocationsContent;
  faq: FAQContent;
  cta: CTAContent;
  footer: FooterContent;
  navbar: NavbarContent;
  floating_wa: FloatingWaContent;
}
