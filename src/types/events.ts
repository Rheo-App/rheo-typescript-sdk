interface BaseEvent {
  id: string
  timestamp: string
  apiVersion: string
}

export interface ItemCreatedEvent extends BaseEvent {
  type: 'item.created'
  data: { externalId: string }
}

export interface ItemImagesReadyEvent extends BaseEvent {
  type: 'item.images_ready'
  data: { externalId: string; imageCount: number }
}

export interface ItemAIPricedEvent extends BaseEvent {
  type: 'item.ai_priced'
  data: { externalId: string; aiPrice: number }
}

export interface ItemAIListedEvent extends BaseEvent {
  type: 'item.ai_listed'
  data: { externalId: string; title: string; description: string }
}

export interface ListingCreatedEvent extends BaseEvent {
  type: 'listing.created'
  data: {
    externalId: string
    platform: string
    platformAdId: string
    platformAdUrl?: string
  }
}

export interface ListingEndedEvent extends BaseEvent {
  type: 'listing.ended'
  data: { externalId: string; platform: string }
}

export interface ListingFailedEvent extends BaseEvent {
  type: 'listing.failed'
  data: { externalId: string; platform: string; reason: string }
}

export interface ItemSoldEvent extends BaseEvent {
  type: 'item.sold'
  data: {
    externalId: string
    salePrice: number
    platform: string
    buyerCountry?: string
  }
}

export interface ItemStatusChangedEvent extends BaseEvent {
  type: 'item.status_changed'
  data: { externalId: string; fromStatus: string; toStatus: string }
}

export interface WorkflowApprovalPendingEvent extends BaseEvent {
  type: 'workflow.approval_pending'
  data: {
    runId: string
    workflowId: string
    nodeId: string
    prompt: string
    subjectExternalId?: string
  }
}

export interface WorkflowStepCompletedEvent extends BaseEvent {
  type: 'workflow.step_completed'
  data: { runId: string; workflowId: string; nodeId: string; subjectExternalId?: string }
}

export interface WorkflowRunCompletedEvent extends BaseEvent {
  type: 'workflow.run_completed'
  data: {
    runId: string
    workflowId: string
    status: 'success' | 'failed' | 'cancelled'
    subjectExternalId?: string
  }
}

export type RheoEvent =
  | ItemCreatedEvent
  | ItemImagesReadyEvent
  | ItemAIPricedEvent
  | ItemAIListedEvent
  | ListingCreatedEvent
  | ListingEndedEvent
  | ListingFailedEvent
  | ItemSoldEvent
  | ItemStatusChangedEvent
  | WorkflowApprovalPendingEvent
  | WorkflowStepCompletedEvent
  | WorkflowRunCompletedEvent
