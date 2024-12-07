import babel from '@babel/core'
import fs from 'fs'
import vm from 'vm'

export const injectRequireFile = (filePath: string, inject: (code: string) => string) => {
  const originAppConfigContent = fs.readFileSync(filePath, 'utf-8')

  const finalAppConfigContent = inject(originAppConfigContent)

  const transformResult = babel.transformSync(finalAppConfigContent, {
    filename: 'file.ts',
    presets: ['@babel/preset-typescript'],
    plugins: ['@babel/plugin-transform-modules-commonjs']
  })

  if (!transformResult?.code) return

  const context = vm.createContext({ console, require, module, exports: {}, process, __dirname, __filename })

  vm.runInNewContext(transformResult.code, context)

  return context.exports.default
}
