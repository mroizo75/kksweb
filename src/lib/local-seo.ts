import { getCourseCategoryLabel } from "@/lib/course-categories";

export function buildLocalCourseKeywords(
  courseTitle: string,
  courseCategory: string,
  courseCode: string,
  locationName: string,
  regionName: string
): string[] {
  const categoryLabel = getCourseCategoryLabel(courseCategory).toLowerCase();
  const location = locationName.toLowerCase();
  const region = regionName.toLowerCase();

  return [
    `${courseTitle} i ${locationName}`,
    `${courseTitle} kurs ${locationName}`,
    `${courseTitle} ${locationName}`,
    `${categoryLabel} kurs ${locationName}`,
    `kurs ${location}`,
    `bedriftskurs ${location}`,
    `${region} kurs`,
    courseCode,
  ];
}

