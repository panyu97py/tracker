import { NodePath as OriginNodePath, Node, PluginPass } from '@babel/core'
import { ExportDefaultDeclaration, JSXAttribute, JSXElement, JSXOpeningElement } from '@babel/types'

type EnsureNode<T> = Exclude<T, null | undefined> extends Node ? T : never;

export interface NodePath<T> extends OriginNodePath<T> {
    _processed?: boolean
}

export interface PluginState extends PluginPass {
    dependRequire: Set<string>
}

export type TargetMatchFn<T> = (nodePath: NodePath<T>, state: PluginState) => boolean

export type TemplateCodeFn<T, R> = (nodePath: NodePath<T>, state: PluginState) => EnsureNode<R> | string;

export type TargetMatch<T> = string | RegExp | TargetMatchFn<T>;

export type TemplateCode<T, R> = string | TemplateCodeFn<T, R>

export interface JsxElementAttributeInjectOption {
    attribute: string,
    targetMatch: TargetMatch<JSXOpeningElement>,
    templateCode: TemplateCode<JSXOpeningElement, JSXAttribute['value']>,
    dependRequire: string[]
}

export interface JsxElementParentInjectOption {
    targetMatch: TargetMatch<JSXElement>,
    templateCode: TemplateCode<JSXElement, JSXElement>,
    dependRequire: string[]
}

export interface ExportDefaultWrapInjectOption {
    targetMatch: TargetMatchFn<ExportDefaultDeclaration>,
    templateCode: TemplateCode<ExportDefaultDeclaration, ExportDefaultDeclaration['declaration']>,
    dependRequire: string[]
}

export interface Options {
    jsxElementAttributeInject?: JsxElementAttributeInjectOption[]
    jsxElementParentInject?: JsxElementParentInjectOption[]
    exportDefaultWrapInject?: ExportDefaultWrapInjectOption[]
}
