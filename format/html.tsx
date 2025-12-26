import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function HtmlFormat() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const formatHTML = (html: string): string => {
    let formatted = ''
    let indent = 0
    const indentSize = 2
    
    // 简单的HTML格式化
    html = html.replace(/>\s+</g, '><')
    
    const tokens = html.split(/(<[^>]+>)/)
    
    for (const token of tokens) {
      if (!token.trim()) continue
      
      if (token.startsWith('</')) {
        indent = Math.max(0, indent - indentSize)
        formatted += ' '.repeat(indent) + token + '\n'
      } else if (token.startsWith('<')) {
        formatted += ' '.repeat(indent) + token + '\n'
        if (!token.includes('/>') && !token.match(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i)) {
          indent += indentSize
        }
      } else {
        const trimmed = token.trim()
        if (trimmed) {
          formatted += ' '.repeat(indent) + trimmed + '\n'
        }
      }
    }
    
    return formatted.trim()
  }

  const handleFormat = () => {
    try {
      setError('')
      if (!input.trim()) {
        setOutput('')
        return
      }
      
      const formatted = formatHTML(input)
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
        <title>HTML格式化 - 在线工具</title>
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
              HTML格式化工具
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
                输入HTML代码
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="粘贴HTML代码"
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
                  <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{output}</pre>
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

