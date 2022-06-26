import {injectable, inject} from 'inversify'
import {EventCenter} from "./EventCenter";
import {TrackEventDataProcess} from "./TrackEventDataProcess";
import {TrackEventQueueManager} from './TrackEventQueueManager';
import {SERVICE_IDENTIFIER, DEFAULT_EVENT_CONFIG, EVENT_DATA_PROCESS_TYPE} from "../constants";
import type {PageLifecycleTrackInstance, TargetTrackConfig} from "../interface";
import {EventDataProcessType} from "../interface";
import {ConfigStore} from "../store";

@injectable()
export class PageLifecycleTrack implements PageLifecycleTrackInstance {

    @inject(SERVICE_IDENTIFIER.TRACK_EVENT_DATA_PROCESS)
    private _trackEventDataProcess: TrackEventDataProcess;

    @inject(SERVICE_IDENTIFIER.TRACK_EVENT_QUEUE_MANAGER)
    private _trackEventQueueManager: TrackEventQueueManager;

    @inject(SERVICE_IDENTIFIER.EVENT_CENTER)
    private _eventCenter: EventCenter

    @inject(SERVICE_IDENTIFIER.CONFIG_STORE)
    private _config: ConfigStore;

    private _pageKey: string

    pageOnShow(pageKey: string): void {

        if (!this._config.enableLog) return

        this._pageKey = pageKey

        this._trackEventDataProcess.targetBeginExposure(DEFAULT_EVENT_CONFIG.PAGE_EXPOSURE_CONFIG)

        this._eventCenter.on(this._pageKey, (trackConfig: TargetTrackConfig, type: EventDataProcessType) => {

            switch (type) {

                case EVENT_DATA_PROCESS_TYPE.CLICK:
                    return this._trackEventDataProcess.targetClick(trackConfig)

                case EVENT_DATA_PROCESS_TYPE.BEGIN_EXPOSURE:
                    return this._trackEventDataProcess.targetBeginExposure(trackConfig)

                case EVENT_DATA_PROCESS_TYPE.END_EXPOSURE:
                    return this._trackEventDataProcess.targetEndExposure(trackConfig)
            }

        })
    }

    pageOnHide(): void {
        if (!this._config.enableLog) return

        this._eventCenter.off(this._pageKey)

        this._trackEventDataProcess.targetEndExposure(DEFAULT_EVENT_CONFIG.PAGE_EXPOSURE_CONFIG)

        this._trackEventQueueManager.submitEventsQueue()
    }
}