export type EventType = 'CLICK' | 'EXPOSURE' | 'ERROR';

export interface EventConfig {
  eventType: EventType;
  eventName: string;
  originEventType?: EventType;
  originEventName?: string;
  relevanceKey?: string;
  canBePageReferrerEvent?: boolean
}

export interface TargetTrackConfig {
  eventClickConfig?: EventConfig;
  eventExposureConfig?: EventConfig;
  extendData?: Record<string, any>
}