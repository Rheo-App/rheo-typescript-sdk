// Domain system — typed mirror of the backend AssetDomain (rheo-market/src/models/items/domain.rs).
// Over the wire the domain is an internally-tagged union: the `domain` key is the discriminant
// (the canonical snake_case slug) and selects which attribute fields are valid. All attribute
// fields are optional — send only what you have.

/** The donor vehicle a part was dismantled from. */
export interface DonorVehicle {
  /** Manufacturer of the donor vehicle, e.g. "Kawasaki", "Volvo". */
  manufacturer?: string
  /** Model name of the donor vehicle, e.g. "ER-6F", "XC90". */
  model?: string
  /** Model year of the donor vehicle. */
  year?: number
  /** Vehicle category the part came from: "Bil"|"MC"|"Skoter"|"ATV"|"Husvagn"|"Moped"|"Traktor". */
  vehicleType?: string
}

/** The specific part being sold. */
export interface PartInfo {
  /** Human-readable part name, e.g. "Stötdämpare Bak". */
  name?: string
  /** OEM manufacturer part number, e.g. "31400452". Universally understood across systems. */
  oemNumber?: string
  /**
   * Part-type codes from external ERP/catalog systems. Key is the system name
   * (e.g. "recopart", "fen-sys", "tecdoc"), value is that system's code.
   * Add a new system by using a new key — no schema change required.
   */
  catalogCodes?: Record<string, string>
}

/** Auto parts and alternative vehicle parts (MC, snowmobile, ATV, caravan, etc.). */
export interface DomainObjectAutoParts {
  domain: 'auto_parts'
  /** The donor vehicle the part was pulled from. */
  vehicle?: DonorVehicle
  /** The part being sold. */
  part?: PartInfo
  /** Condition grade: "A*"|"A"|"B"|"C". */
  conditionGrade?: string
  /** Free-text condition note, e.g. "Smärrepig". */
  conditionNote?: string
}

/** Whole vehicles for sale — cars, motorcycles, boats, caravans. */
export interface DomainObjectVehicles {
  domain: 'vehicles'
  /** Swedish registration plate, e.g. "ABC123". Triggers a biluppgifter.se lookup. */
  registrationPlate?: string
  make?: string
  model?: string
  year?: number
  mileageKm?: number
  /** "petrol"|"diesel"|"electric"|"hybrid" */
  fuelType?: string
  color?: string
}

/** Consumer electronics, cameras, audio, phones. */
export interface DomainObjectElectronics {
  domain: 'electronics'
  serialNumber?: string
  memoryGb?: number
  /** Battery health (0–100). */
  batteryHealthPercentage?: number
}

/** PCs, laptops, tablets, and peripherals. Same attribute shape as electronics. */
export interface DomainObjectComputers {
  domain: 'computers'
  serialNumber?: string
  memoryGb?: number
  /** Battery health (0–100). Relevant for laptops. */
  batteryHealthPercentage?: number
}

/** Clothing, shoes, bags, and accessories. */
export interface DomainObjectFashion {
  domain: 'fashion'
  /** Free-form size label, e.g. "M", "42", "UK 8". */
  size?: string
  material?: string
  /** "mens"|"womens"|"unisex"|"kids" */
  gender?: string
}

/** Books, magazines, DVDs, and vinyl records. */
export interface DomainObjectBooks {
  domain: 'books'
  isbn?: string
  author?: string
  publisher?: string
  /** BCP 47 language code, e.g. "sv", "en". */
  language?: string
}

/** Wristwatches and pocket watches. */
export interface DomainObjectWatches {
  domain: 'watches'
  brand?: string
  modelReference?: string
  /** "automatic"|"quartz"|"manual" */
  movementType?: string
  caseSizeMm?: number
}

/** Slugs for unit domains — categories that carry no extra attributes. */
export type UnitDomainSlug =
  | 'home_garden'
  | 'art'
  | 'sports'
  | 'toys'
  | 'tools'
  | 'jewelry'
  | 'music'
  | 'collectibles'
  | 'beauty'
  | 'industrial'
  | 'other'

/** A unit domain carries only the discriminant — no attribute fields. */
export interface DomainObjectUnit {
  domain: UnitDomainSlug
}

/** Every canonical Rheo domain slug. */
export type AssetDomainSlug =
  | 'auto_parts'
  | 'vehicles'
  | 'electronics'
  | 'computers'
  | 'fashion'
  | 'books'
  | 'watches'
  | UnitDomainSlug

/**
 * The typed item classification, sent as the `domain` field on an item.
 * Discriminated on `domain` — narrow on it to access domain-specific attributes.
 */
export type DomainObject =
  | DomainObjectAutoParts
  | DomainObjectVehicles
  | DomainObjectElectronics
  | DomainObjectComputers
  | DomainObjectFashion
  | DomainObjectBooks
  | DomainObjectWatches
  | DomainObjectUnit

export type RheoItemStatus = 'draft' | 'active' | 'sold' | 'not_listed' | 'archived'

export type RheoItemType = 'item' | 'container'
