export const courseCategoryOptions = [
  { value: "digitale-kurs", label: "Digitale kurs" },
  { value: "truck", label: "Truck" },
  { value: "kran", label: "Kran" },
  { value: "stillas", label: "Stillas" },
  { value: "hms", label: "HMS" },
  { value: "vei", label: "Arbeid på vei" },
  { value: "bht", label: "BHT" },
  { value: "maskinforer", label: "Maskinfører" },
  { value: "personlofter", label: "Personløfter" },
  { value: "fallsikring", label: "Fallsikring" },
  { value: "brannvern", label: "Brannvern" },
  { value: "datasikkerhet", label: "Datasikkerhet" },
  { value: "annet", label: "Annet" },
] as const;

export const primaryCourseCategoryValues = [
  "digitale-kurs",
  "truck",
  "kran",
  "stillas",
  "hms",
  "vei",
  "bht",
] as const;

export function getCourseCategoryLabel(category: string): string {
  const normalizedCategory = category.trim().toLowerCase();
  const categoryOption = courseCategoryOptions.find((option) => option.value === normalizedCategory);
  if (categoryOption) {
    return categoryOption.label;
  }

  if (!normalizedCategory) {
    return "Ukjent kategori";
  }

  return normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1);
}

export function getCourseCategoryCourseTerm(category: string): string {
  const label = getCourseCategoryLabel(category);
  if (label.toLowerCase().includes("kurs")) {
    return label;
  }
  return `${label}-kurs`;
}

export function formatCourseCategoryList(categories: readonly string[]): string {
  const labels = categories.map((category) => getCourseCategoryLabel(category));
  if (labels.length === 0) {
    return "";
  }
  if (labels.length === 1) {
    return labels[0];
  }
  if (labels.length === 2) {
    return `${labels[0]} og ${labels[1]}`;
  }
  return `${labels.slice(0, -1).join(", ")} og ${labels[labels.length - 1]}`;
}

export const primaryCourseCategoryListText = formatCourseCategoryList(primaryCourseCategoryValues);
export const primaryCourseCategoryCourseTerms = primaryCourseCategoryValues.map((category) =>
  getCourseCategoryCourseTerm(category)
);
