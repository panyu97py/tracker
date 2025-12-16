import { Visitor } from '@babel/core'
import { ExportDefaultDeclaration } from '@babel/types'
import { NodePath, Options, PluginState } from '../types'
import template from '@babel/template'
import * as types from '@babel/types'
import { getCallExpressionName } from '../utils'

export const injectExportDefaultWrapVisitor: Visitor = {
  ExportDefaultDeclaration: (exportDefaultDeclarationNodePath: NodePath<ExportDefaultDeclaration>, state: PluginState) => {
    const { opts } = state
    const { exportDefaultWrapInject = [] } = opts as Options

    if (exportDefaultDeclarationNodePath._processed) return

    exportDefaultDeclarationNodePath._processed = true

    exportDefaultWrapInject.forEach(exportDefaultWrapInjectOption => {
      const {
        targetMatch,
        templateCode,
        dependRequire = []
      } = exportDefaultWrapInjectOption

      // 生成模版代码Ast
      const templateCodeAst = (() => {
        const isTemplateCodeStr = typeof templateCode === 'string'
        const tempTemplateCode = isTemplateCodeStr ? templateCode : templateCode(exportDefaultDeclarationNodePath, state)
        if (typeof tempTemplateCode === 'string') return template.expression(templateCode as string, { plugins: ['jsx'] })()
        if (types.isNode(tempTemplateCode)) return tempTemplateCode
      })()

      // 若模版代码Ast为空则跳过
      if (!templateCodeAst) return

      // 若父节点已经是目标节点则跳过
      const isProcessed = (() => {
        const { declaration } = exportDefaultDeclarationNodePath.node
        if (!types.isCallExpression(declaration)) return false
        const curCallExpressionName = getCallExpressionName(declaration)
        const nextCallExpressionName = getCallExpressionName(templateCodeAst)
        return curCallExpressionName === nextCallExpressionName
      })()

      // 判断元素是否匹配
      const isTargetMatch = targetMatch(exportDefaultDeclarationNodePath, state)

      if (isProcessed || !isTargetMatch) return

      // 将模版代码转为 ast
      exportDefaultDeclarationNodePath.node.declaration = templateCodeAst

      // 若依赖源不存在则初始化
      if (!state.dependRequire) state.dependRequire = new Set()

      // 设置依赖源
      dependRequire.forEach((item) => state.dependRequire.add(item))
    })
  }
}
