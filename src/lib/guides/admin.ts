import "server-only";
import type { GuideDefinition } from "@/types/guides";
import { createGuideIndex } from "./navigation";
import { ADMIN_GETTING_STARTED } from "./admin/getting-started";
import { ADMIN_BRANCHES } from "./admin/branches";
import { ADMIN_PROGRAMS } from "./admin/programs";
import { ADMIN_SHIFTS } from "./admin/shifts";
import { ADMIN_TEACHERS } from "./admin/teachers";
import { ADMIN_STUDENTS } from "./admin/students";
import { ADMIN_SCHEDULING } from "./admin/scheduling";
import { ADMIN_BILLING } from "./admin/billing";
import { ADMIN_PAYROLL } from "./admin/payroll";
import { ADMIN_WEBSITE_BASIC } from "./admin/website-basic";
import { ADMIN_WEBSITE_MEDIA } from "./admin/website-media";

export const ADMIN_GUIDE = {
  role: "admin",
  title: "Panduan Admin",
  description: "Langkah kerja operasional, aturan sistem, dan bantuan untuk pengelola Uzma Course.",
  defaultTopic: "mulai",
  chapters: [
    ADMIN_GETTING_STARTED,
    ADMIN_BRANCHES,
    ADMIN_PROGRAMS,
    ADMIN_SHIFTS,
    ADMIN_TEACHERS,
    ADMIN_STUDENTS,
    ADMIN_SCHEDULING,
    ADMIN_BILLING,
    ADMIN_PAYROLL,
    ADMIN_WEBSITE_BASIC,
    ADMIN_WEBSITE_MEDIA,
  ],
} as const satisfies GuideDefinition;

export const ADMIN_GUIDE_INDEX = createGuideIndex(ADMIN_GUIDE);
