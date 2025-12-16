import { Visitor } from '@babel/core'
import * as types from '@babel/types'
import type { JSXElement } from '@babel/types'
import { JsxElementParentInjectOption, NodePath, Options, PluginState } from '../types'
import { getJsxElementName } from '../utils'
import template from '@babel/template'

export const injectJsxElementParentVisitor: Visitor = {
  JSXElement: (jsxElementNodePath: NodePath<JSXElement>, state: PluginState) => {
    const { opts } = state

    const { jsxElementParentInject = [] } = opts as Options

    if (jsxElementNodePath._processed) return

    jsxElementNodePath._processed = true

    jsxElementParentInject.forEach((jsxElementParentInjectOption:JsxElementParentInjectOption) => {
      const { targetMatch, templateCode, dependRequire = [] } = jsxElementParentInjectOption

      // 获取元素名称
      const elementName = getJsxElementName(jsxElementNodePath.node)

      // 生成模版代码Ast
      const templateCodeAst = (() => {
        const isTemplateCodeStr = typeof templateCode === 'string'
        const tempTemplateCode = isTemplateCodeStr ? templateCode : templateCode(jsxElementNodePath, state)
        if (typeof tempTemplateCode === 'string') return template.expression(templateCode as string, { plugins: ['jsx'] })() as JSXElement
        if (types.isNode(tempTemplateCode)) return tempTemplateCode
      })()

      // 若模版代码字符串为空则跳过
      if (!templateCodeAst) return

      // 若父节点已经是目标节点则跳过
      const isProcessed = (() => {
        const { node: parentNode } = jsxElementNodePath.parentPath
        if (!types.isJSXElement(parentNode)) return false
        const curParentElementName = getJsxElementName(parentNode)
        const nextParentElementName = getJsxElementName(templateCodeAst)
        return curParentElementName === nextParentElementName
      })()

      // 判断元素是否匹配
      const isTargetMatch = (() => {
        if (targetMatch instanceof RegExp) return targetMatch.test(elementName)
        if (typeof targetMatch === 'string') return targetMatch === elementName
        return targetMatch(jsxElementNodePath, state)
      })()

      if (isProcessed || !isTargetMatch) return

      // 将目标节点作为插入节点的字节点
      templateCodeAst.children = [jsxElementNodePath.node]

      // 替换节点
      jsxElementNodePath.replaceWith(templateCodeAst)

      // 若依赖源不存在则初始化
      if (!state.dependRequire) state.dependRequire = new Set()

      // 设置依赖源
      dependRequire.forEach((item) => state.dependRequire.add(item))
    })
  }
}
