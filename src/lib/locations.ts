export const locationConfig = {
  oslo: {
    name: "Oslo",
    region: "Oslo og Akershus",
    description: "Profesjonell kursvirksomhet i hovedstaden",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs oslo, maskinførerkurs oslo, truckfører oslo, kranfører oslo, HMS kurs oslo",
    heroText: "Profesjonelle kurs i Oslo og Akershus",
    about:
      "KKS AS tilbyr et bredt spekter av profesjonelle kurs i Oslo-området. Med over 10 års erfaring og sertifiserte instruktører, er vi din foretrukne partner for truck-, kran-, stillas- og HMS-opplæring i hovedstaden. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Erfarne lokale instruktører",
      "Moderne utstyr og fasiliteter",
      "Fleksible kurstider og lokasjoner",
      "Spar tid - vi kommer til dere",
    ],
  },
  bergen: {
    name: "Bergen",
    region: "Bergen og Vestland",
    description: "Kurs og kompetanse på Vestlandet",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs bergen, maskinførerkurs bergen, truckfører bergen, kranfører bergen, HMS kurs bergen",
    heroText: "Profesjonelle kurs i Bergen og Vestland",
    about:
      "KKS AS er din lokale kursleverandør i Bergen og på Vestlandet. Vi tilbyr sertifisert opplæring innen truck, kran, stillas og HMS med fokus på sikkerhet og kvalitet. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Lokalkunnskap i Bergen-området",
      "Erfarne vestlandsinstruktører",
      "Fleksible kurstider og lokasjoner",
      "Spar tid - vi kommer til dere",
    ],
  },
  trondheim: {
    name: "Trondheim",
    region: "Trondheim og Trøndelag",
    description: "Kvalitetskurs i Midt-Norge",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs trondheim, maskinførerkurs trondheim, truckfører trondheim, kranfører trondheim",
    heroText: "Profesjonelle kurs i Trondheim og Trøndelag",
    about:
      "I Trondheim og Trøndelag tilbyr KKS AS komplett opplæring innen maskinføring, HMS og sikkerhet. Våre instruktører har lang erfaring fra regionen og kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Lokale instruktører fra Trøndelag",
      "Tilpasset lokale forhold",
      "Fleksible kurstider og lokasjoner",
      "Spar tid - vi kommer til dere",
    ],
  },
  stavanger: {
    name: "Stavanger",
    region: "Stavanger og Rogaland",
    description: "Profesjonell opplæring i Rogaland",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs stavanger, maskinførerkurs stavanger, truckfører stavanger, kranfører stavanger",
    heroText: "Profesjonelle kurs i Stavanger og Rogaland",
    about:
      "KKS AS leverer førsteklasses opplæring i Stavanger og Rogaland-området. Med spesialkompetanse innen offshore-relaterte kurs og tradisjonell maskinføring. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Erfaring med offshore-industrien",
      "Lokale instruktører",
      "Tilpasset Rogalands næringsliv",
      "Rask oppstart og fleksibilitet",
    ],
  },
  kristiansand: {
    name: "Kristiansand",
    region: "Kristiansand og Agder",
    description: "Kurs og HMS i Sørlandet",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs kristiansand, maskinførerkurs kristiansand, truckfører kristiansand",
    heroText: "Profesjonelle kurs i Kristiansand og Agder",
    about:
      "På Sørlandet tilbyr KKS AS komplett kursportefølje for bedrifter og privatpersoner. Sertifisert opplæring med fokus på sikkerhet. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Lokale instruktører fra Agder",
      "Moderne utstyr",
      "Fleksible kurstider og lokasjoner",
      "God oppfølging",
    ],
  },
  tromso: {
    name: "Tromsø",
    region: "Tromsø og Nord-Norge",
    description: "Nordnorsk kompetanse og kvalitet",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs tromsø, maskinførerkurs tromsø, truckfører tromsø, nord-norge",
    heroText: "Profesjonelle kurs i Tromsø og Nord-Norge",
    about:
      "KKS AS tilbyr profesjonell opplæring i Tromsø og Nord-Norge. Våre instruktører har erfaring med nordnorske forhold og værforhold. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Tilpasset nordnorske forhold",
      "Erfarne instruktører",
      "Vinteropplæring",
      "Fleksible kurstider og lokasjoner",
    ],
  },
} as const;

export type LocationSlug = keyof typeof locationConfig;
export const supportedLocationSlugs = Object.keys(locationConfig) as LocationSlug[];

