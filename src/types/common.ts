export interface DomainObjectAutomotivePart {
  domain: 'automotive_part'
  oemCode?: string
  manufacturer?: string
  compatibleModels?: string[]
  donorVehicleYear?: number
  conditionGrade?: string
}

export interface DomainObjectElectronics {
  domain: 'electronics'
  brand?: string
  model?: string
  storageGb?: number
  condition?: string
}

export interface DomainObjectFashion {
  domain: 'fashion'
  brand?: string
  size?: string
  color?: string
  condition?: string
}

export type DomainObject =
  | DomainObjectAutomotivePart
  | DomainObjectElectronics
  | DomainObjectFashion

export type RheoItemStatus = 'draft' | 'active' | 'sold' | 'not_listed' | 'archived'

export type RheoItemType = 'item' | 'container'
