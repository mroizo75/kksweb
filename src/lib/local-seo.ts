import { getCourseCategoryLabel } from "@/lib/course-categories";

export const OSLO_LOCATION_NAME = "Oslo";
export const OSLO_REGION_NAME = "Oslo og Akershus";

export function buildOsloCourseKeywords(courseTitle: string, courseCategory: string, courseCode: string): string[] {
  const categoryLabel = getCourseCategoryLabel(courseCategory).toLowerCase();

  return [
    `${courseTitle} i Oslo`,
    `${courseTitle} kurs Oslo`,
    `${courseTitle} ${OSLO_LOCATION_NAME}`,
    `${categoryLabel} kurs Oslo`,
    `kurs ${OSLO_LOCATION_NAME.toLowerCase()}`,
    `bedriftskurs ${OSLO_LOCATION_NAME.toLowerCase()}`,
    `${OSLO_REGION_NAME.toLowerCase()} kurs`,
    courseCode,
  ];
}

