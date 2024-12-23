import React from 'react'
import { TrackWrapContext, useTrackWrapContext } from '../context'
import { useCalcTargetExposure } from '../hooks'
import { createSelectorQuery } from '../utils'
import { DomInfo } from '../types'

interface ChildProps extends Record<string, any>{
  selfSelector:string
}

interface TrackTargetContainerWrapProps {
  calcTrigger?: string | string[]
  children: React.ReactElement<ChildProps>;
}

export const TrackContainerWrap: React.FC<TrackTargetContainerWrapProps> = (props) => {
  const { children, calcTrigger = [] } = props

  const { props: childProps } = children

  // 获取目标元素的 referrerInfo
  const { referrerInfo = {} } = useTrackWrapContext()

  // 计算元素曝光
  const { registerTrackTarget, calcTriggerProxy, unregisterTrackTarget } = useCalcTargetExposure(async () => {
    const selectorQuery = createSelectorQuery()
    return new Promise<DomInfo>(resolve => {
      const opt = { dataset: true, rect: true, size: true }
      selectorQuery?.select(childProps.selfSelector).fields(opt, resolve).exec()
    })
  }, referrerInfo)

  // 元素曝光计算触发器
  const finalCalcTrigger = Array.isArray(calcTrigger) ? calcTrigger : [calcTrigger]

  // 元素曝光计算触发器事件代理
  const proxyEvents = finalCalcTrigger.reduce((result, item) => {
    return { ...result, [item]: calcTriggerProxy(childProps[item]) }
  }, {})

  const contextValue = { referrerInfo, registerTrackTarget, unregisterTrackTarget }

  return (
    <TrackWrapContext.Provider value={contextValue}>
      {React.cloneElement(children, proxyEvents)}
    </TrackWrapContext.Provider>
  )
}
