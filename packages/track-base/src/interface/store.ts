import {EventData} from "./eventData";

export interface requestParams {

}

export type EventDataRequest = (params: requestParams) => void;

export interface EventStoreInterface {

    setCurrentPageKey(currentPageKey: string): void;

    setReferrerEventData(referrerEventData: EventData): void;

    get currentPageKey(): string;

    get referrerEventData(): EventData;
}

export interface ConfigStoreInterface {

    setEnableLog(enable: boolean | (() => boolean));

    setRequest(request: EventDataRequest)

    setBaseInfo(baseInfo: Record<string, any> | (() => Record<string, any>));

    setCommonInfo(commonInfo: Record<string, any> | (() => Record<string, any>));

    setEventQueueLimitNum(eventQueueLimitNum: number);

    setEventQueueMaxRetryTimes(eventQueueMaxRetryTimes: number);

    get enableLog(): boolean;

    get request(): EventDataRequest;

    get baseInfo(): Record<string, any>;

    get commonInfo(): Record<string, any>;

    get eventQueueLimitNum(): number;

    get eventQueueMaxRetryTimes(): number;

}
