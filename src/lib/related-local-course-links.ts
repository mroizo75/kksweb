import { db } from "@/lib/db";
import { locationConfig, supportedLocationSlugs, type LocationSlug } from "@/lib/locations";
import { getSessionLocationKeywords } from "@/lib/location-matching";

export interface RelatedLocalCourseLink {
  courseSlug: string;
  courseTitle: string;
  href: string;
}

export interface RelatedLocalCourseLinkGroup {
  locationSlug: LocationSlug;
  locationName: string;
  links: RelatedLocalCourseLink[];
}

interface GetRelatedLocalCourseLinkGroupsInput {
  currentCourseId: string;
  category: string;
  preferredLocationSlug?: string;
  maxLocations?: number;
  maxLinksPerLocation?: number;
}

export async function getRelatedLocalCourseLinkGroups(
  input: GetRelatedLocalCourseLinkGroupsInput
): Promise<RelatedLocalCourseLinkGroup[]> {
  const maxLocations = input.maxLocations ?? 6;
  const maxLinksPerLocation = input.maxLinksPerLocation ?? 3;

  const sessions = await db.courseSession.findMany({
    where: {
      startsAt: { gte: new Date() },
      status: "OPEN",
      course: {
        published: true,
        category: input.category,
        NOT: { id: input.currentCourseId },
      },
    },
    select: {
      location: true,
      startsAt: true,
      course: {
        select: {
          slug: true,
          title: true,
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: 400,
  });

  const buckets = new Map<
    LocationSlug,
    { locationName: string; linksBySlug: Map<string, RelatedLocalCourseLink> }
  >();

  for (const locationSlug of supportedLocationSlugs) {
    buckets.set(locationSlug, {
      locationName: locationConfig[locationSlug].name,
      linksBySlug: new Map<string, RelatedLocalCourseLink>(),
    });
  }

  for (const session of sessions) {
    const sessionLocation = session.location.toLowerCase();

    for (const locationSlug of supportedLocationSlugs) {
      const keywords = getSessionLocationKeywords(locationSlug);
      const isLocationMatch = keywords.some((keyword) =>
        sessionLocation.includes(keyword)
      );
      if (!isLocationMatch) {
        continue;
      }

      const bucket = buckets.get(locationSlug);
      if (!bucket) {
        continue;
      }

      if (bucket.linksBySlug.size >= maxLinksPerLocation) {
        continue;
      }

      if (!bucket.linksBySlug.has(session.course.slug)) {
        bucket.linksBySlug.set(session.course.slug, {
          courseSlug: session.course.slug,
          courseTitle: session.course.title,
          href: `/lokasjon/${locationSlug}/${session.course.slug}`,
        });
      }
    }
  }

  const groups = Array.from(buckets.entries())
    .map(([locationSlug, bucket]) => ({
      locationSlug,
      locationName: bucket.locationName,
      links: Array.from(bucket.linksBySlug.values()),
    }))
    .filter((group) => group.links.length > 0)
    .sort((a, b) => {
      if (input.preferredLocationSlug) {
        if (a.locationSlug === input.preferredLocationSlug) return -1;
        if (b.locationSlug === input.preferredLocationSlug) return 1;
      }

      if (b.links.length !== a.links.length) {
        return b.links.length - a.links.length;
      }

      return a.locationName.localeCompare(b.locationName, "nb-NO");
    })
    .slice(0, maxLocations);

  return groups;
}
