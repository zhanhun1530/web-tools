import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function JavaScriptFormat() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const formatJavaScript = (code: string): string => {
    let formatted = code
    let indent = 0
    const indentSize = 2
    const lines = code.split('\n')
    const formattedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      if (!line) {
        formattedLines.push('')
        continue
      }

      // 减少缩进（在闭合括号之前）
      if (line.startsWith('}') || line.startsWith(']')) {
        indent = Math.max(0, indent - indentSize)
      }

      // 添加缩进
      formattedLines.push(' '.repeat(indent) + line)

      // 增加缩进（在开放括号之后）
      if (line.endsWith('{') || line.endsWith('[')) {
        indent += indentSize
      }
    }

    return formattedLines.join('\n')
  }

  const handleFormat = () => {
    try {
      setError('')
      if (!input.trim()) {
        setOutput('')
        return
      }
      
      const formatted = formatJavaScript(input)
      setOutput(formatted)
    } catch (err: any) {
      setError(`格式化错误: ${err.message}`)
      setOutput('')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    alert('已复制到剪贴板')
  }

  return (
    <>
      <Head>
        <title>JavaScript格式化 - 在线工具</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← 返回首页
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              JavaScript格式化工具
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入JavaScript代码
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="粘贴JavaScript代码"
                className="w-full h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleFormat}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                格式化
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  格式化后的代码
                </label>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  复制
                </button>
              </div>
              <div className="w-full h-[600px] p-4 border border-gray-300 rounded-lg bg-gray-900 overflow-auto">
                {output ? (
                  <pre className="text-sm font-mono text-blue-400 whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-gray-500">格式化后的代码将显示在这里</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

