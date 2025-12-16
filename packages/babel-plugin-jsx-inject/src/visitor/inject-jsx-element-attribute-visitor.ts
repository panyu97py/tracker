import { Visitor } from '@babel/core'
import { JsxElementAttributeInjectOption, Options, PluginState, NodePath } from '../types'
import { JSXOpeningElement } from '@babel/types'
import * as types from '@babel/types'
import { getJsxOpeningElementNodeName } from '../utils'

import template from '@babel/template'

export const injectJsxElementAttributeVisitor: Visitor = {
  JSXOpeningElement: (jsxOpeningElementNodePath: NodePath<JSXOpeningElement>, state: PluginState) => {
    const { opts } = state
    const { jsxElementAttributeInject = [] } = opts as Options

    if (jsxOpeningElementNodePath._processed) return

    jsxOpeningElementNodePath._processed = true

    jsxElementAttributeInject.forEach((jsxElementAttributeInjectOption: JsxElementAttributeInjectOption) => {
      const { targetMatch, attribute, templateCode, dependRequire = [] } = jsxElementAttributeInjectOption

      const { name, attributes: curAttributes = [] } = jsxOpeningElementNodePath.node

      // 获取元素名称
      const elementName = getJsxOpeningElementNodeName(name)

      // 判断元素是否匹配
      const isTargetMatch = (() => {
        if (targetMatch instanceof RegExp) return targetMatch.test(elementName)
        if (typeof targetMatch === 'string') return targetMatch === elementName
        return targetMatch(jsxOpeningElementNodePath, state)
      })()

      // 生成模版代码字符串
      const templateCodeAst = (() => {
        const isTemplateCodeStr = typeof templateCode === 'string'
        const tempTemplateCode = isTemplateCodeStr ? templateCode : templateCode(jsxOpeningElementNodePath, state)
        if (typeof tempTemplateCode === 'string') return types.jsxExpressionContainer(template.expression(templateCode as string, { plugins: ['jsx'] })())
        if (types.isNode(tempTemplateCode)) return tempTemplateCode
      })()

      // 若模版代码字符串为空或元素不匹配则返回
      if (!isTargetMatch || !templateCodeAst) return

      // 删除原有属性
      const attributes = curAttributes.filter(item => {
        return !types.isJSXAttribute(item) || item.name.name !== attribute
      })

      // 插入模版代码为属性值
      attributes.push(types.jsxAttribute(types.jsxIdentifier(attribute), templateCodeAst))

      jsxOpeningElementNodePath.node.attributes = attributes

      // 若依赖源不存在则初始化
      if (!state.dependRequire) state.dependRequire = new Set()

      // 设置依赖源
      dependRequire.forEach((item) => state.dependRequire.add(item))
    })
  }
}
