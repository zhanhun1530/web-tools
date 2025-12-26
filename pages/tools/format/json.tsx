import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function JsonFormat() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isMinified, setIsMinified] = useState(false)
  const [outputType, setOutputType] = useState<'json' | 'xml'>('json')

  // 改进的JSON语法高亮，包括括号、逗号等标点符号
  const highlightJson = (json: string): string => {
    if (!json) return ''
    
    // 先转义HTML特殊字符
    let result = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // 使用特殊标记来避免重复处理
    const markers = {
      STRING_KEY: '___STRING_KEY___',
      STRING_VALUE: '___STRING_VALUE___',
      NUMBER: '___NUMBER___',
      BOOLEAN_TRUE: '___BOOLEAN_TRUE___',
      BOOLEAN_FALSE: '___BOOLEAN_FALSE___',
      NULL: '___NULL___',
    }
    
    // 先处理字符串（键名和值）
    const stringMatches: Array<{ match: string; isKey: boolean }> = []
    result = result.replace(/("(?:[^"\\]|\\.)*")/g, (match, offset, str) => {
      // 检查后面是否有冒号（键名）
      const after = str.substring(offset + match.length).trim()
      const isKey = after.startsWith(':')
      stringMatches.push({ match, isKey })
      return isKey ? markers.STRING_KEY : markers.STRING_VALUE
    })
    
    // 处理数字
    const numberMatches: string[] = []
    result = result.replace(/(-?\d+\.?\d*)/g, (match) => {
      numberMatches.push(match)
      return markers.NUMBER
    })
    
    // 处理布尔值
    result = result.replace(/\btrue\b/g, markers.BOOLEAN_TRUE)
    result = result.replace(/\bfalse\b/g, markers.BOOLEAN_FALSE)
    
    // 处理null
    result = result.replace(/\bnull\b/g, markers.NULL)
    
    // 高亮标点符号（括号、逗号、冒号）- 使用浅灰色，在深色背景上可见
    result = result.replace(/([{}[\],:])/g, '<span class="text-gray-300">$1</span>')
    
    // 恢复字符串
    let stringIndex = 0
    result = result.replace(new RegExp(markers.STRING_KEY, 'g'), () => {
      const item = stringMatches[stringIndex++]
      return `<span class="text-blue-400">${item.match}</span>`
    })
    result = result.replace(new RegExp(markers.STRING_VALUE, 'g'), () => {
      const item = stringMatches[stringIndex++]
      return `<span class="text-green-400">${item.match}</span>`
    })
    
    // 恢复数字
    let numberIndex = 0
    result = result.replace(new RegExp(markers.NUMBER, 'g'), () => {
      const match = numberMatches[numberIndex++]
      return `<span class="text-yellow-400">${match}</span>`
    })
    
    // 恢复布尔值
    result = result.replace(new RegExp(markers.BOOLEAN_TRUE, 'g'), '<span class="text-purple-400">true</span>')
    result = result.replace(new RegExp(markers.BOOLEAN_FALSE, 'g'), '<span class="text-purple-400">false</span>')
    
    // 恢复null
    result = result.replace(new RegExp(markers.NULL, 'g'), '<span class="text-gray-400">null</span>')
    
    return result
  }

  useEffect(() => {
    // 自动格式化
    if (input.trim()) {
      try {
        const parsed = JSON.parse(input)
        const formatted = JSON.stringify(parsed, null, 2)
        setOutput(formatted)
        setIsMinified(false)
        setOutputType('json')
        setError('')
      } catch (err: any) {
        setError(`JSON格式错误: ${err.message}`)
        setOutput('')
      }
    } else {
      setOutput('')
      setError('')
    }
  }, [input])

  const handleMinify = () => {
    try {
      if (!input.trim()) return
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setIsMinified(true)
      setOutputType('json')
      setError('')
    } catch (err: any) {
      setError(`JSON格式错误: ${err.message}`)
    }
  }

  const handleFormat = () => {
    try {
      if (!input.trim()) return
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setIsMinified(false)
      setOutputType('json')
      setError('')
    } catch (err: any) {
      setError(`JSON格式错误: ${err.message}`)
    }
  }

  const handleToXml = () => {
    try {
      if (!input.trim()) return
      const parsed = JSON.parse(input)
      
      const jsonToXml = (obj: any, rootName = 'root'): string => {
        let xml = ''
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            xml += `<${rootName}>\n${jsonToXml(item, 'item')}</${rootName}>\n`
          })
        } else if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => {
            const value = obj[key]
            if (Array.isArray(value)) {
              value.forEach(item => {
                xml += `<${key}>\n${jsonToXml(item, 'item')}</${key}>\n`
              })
            } else if (typeof value === 'object' && value !== null) {
              xml += `<${key}>\n${jsonToXml(value)}</${key}>\n`
            } else {
              xml += `<${key}>${value}</${key}>\n`
            }
          })
        } else {
          xml += `${obj}`
        }
        return xml
      }
      
      const rootName = 'root'
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${jsonToXml(parsed)}</${rootName}>`
      setOutput(xml)
      setIsMinified(false)
      setOutputType('xml')
      setError('')
    } catch (err: any) {
      setError(`转换失败: ${err.message}`)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    alert('已复制到剪贴板')
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <>
      <Head>
        <title>JSON格式化 - 在线工具</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-[95%]">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← 返回首页
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              JSON格式化工具
            </h1>
            <p className="text-gray-600">
              自动格式化JSON，支持压缩、转XML等功能
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={handleFormat}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              格式化
            </button>
            <button
              onClick={handleMinify}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              压缩
            </button>
            <button
              onClick={handleToXml}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              转XML
            </button>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              复制
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              清空
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入JSON
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="粘贴JSON数据，自动格式化"
                className="w-full h-[70vh] min-h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {outputType === 'xml' ? '转换后的XML' : '格式化后的JSON'}
              </label>
              <div
                className="w-full h-[70vh] min-h-[600px] p-4 border border-gray-300 rounded-lg bg-gray-900 overflow-auto"
              >
                {output ? (
                  outputType === 'xml' ? (
                    <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <pre
                      className="text-sm font-mono"
                      dangerouslySetInnerHTML={{ __html: highlightJson(output) }}
                    />
                  )
                ) : (
                  <div className="text-gray-500">
                    {outputType === 'xml' ? '转换后的XML将显示在这里' : '格式化后的JSON将显示在这里'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
