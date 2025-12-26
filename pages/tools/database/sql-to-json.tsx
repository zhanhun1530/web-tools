import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function SqlToJson() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  // 改进的解析函数，更好地处理边框格式
  const parseTable = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length === 0) return []

      // 检测表格格式
      const hasBorders = lines.some(line => line.includes('|') || line.includes('+') || line.includes('-'))
      
      let headers: string[] = []
      const rows: any[] = []
      
      if (hasBorders) {
        // 处理带边框的表格
        let headerLineIndex = -1
        
        // 找到表头行（通常在第一行或分隔线后的第一行）
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          // 跳过分隔线（只包含 + - | 的行）
          if (/^[\+\-\|\s]+$/.test(line)) continue
          
          if (line.includes('|')) {
            headerLineIndex = i
            // 提取表头
            headers = line.split('|')
              .map(h => h.trim())
              .filter(h => h && !/^[\+\-\s]+$/.test(h))
            break
          }
        }
        
        if (headers.length === 0) {
          throw new Error('无法识别表头')
        }
        
        // 处理数据行
        for (let i = headerLineIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim()
          // 跳过分隔线
          if (/^[\+\-\|\s]+$/.test(line)) continue
          
          if (line.includes('|')) {
            // 分割时保留空值，以便正确对齐
            const parts = line.split('|')
            // 移除首尾的空元素（如果存在）
            const cleanParts = parts
              .map((p, idx) => {
                // 首尾可能是空的（因为 | 开头或结尾）
                if (idx === 0 || idx === parts.length - 1) {
                  return p.trim()
                }
                return p.trim()
              })
              .filter((p, idx) => {
                // 过滤掉纯分隔符，但保留空字符串（表示空单元格）
                return !/^[\+\-\s]+$/.test(p)
              })
            
            // 如果列数匹配或接近，创建行对象
            if (cleanParts.length > 0) {
              const row: any = {}
              headers.forEach((header, idx) => {
                // 如果数据列数少于表头，缺失的列设为空字符串
                row[header] = cleanParts[idx] !== undefined ? cleanParts[idx] : ''
              })
              rows.push(row)
            }
          }
        }
      } else {
        // 处理无边框的表格（空格分隔或制表符分隔）
        // 第一行作为表头
        const firstLine = lines[0].trim()
        if (firstLine.includes('\t')) {
          headers = firstLine.split('\t').map(h => h.trim())
        } else {
          // 使用多个空格作为分隔符
          headers = firstLine.split(/\s{2,}/).map(h => h.trim()).filter(h => h)
        }
        
        // 处理数据行
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          let values: string[]
          if (line.includes('\t')) {
            values = line.split('\t').map(v => v.trim())
          } else {
            values = line.split(/\s{2,}/).map(v => v.trim()).filter(v => v)
          }
          
          if (values.length === headers.length) {
            const row: any = {}
            headers.forEach((header, idx) => {
              row[header] = values[idx] || ''
            })
            rows.push(row)
          }
        }
      }
      
      return rows
    } catch (err: any) {
      throw new Error(`解析错误: ${err.message}`)
    }
  }

  const handleConvert = () => {
    try {
      setError('')
      if (!input.trim()) {
        setOutput('')
        return
      }
      
      const rows = parseTable(input)
      if (rows.length === 0) {
        setError('未找到有效数据')
        setOutput('')
        return
      }
      
      const json = JSON.stringify(rows, null, 2)
      setOutput(json)
    } catch (err: any) {
      setError(err.message)
      setOutput('')
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
        <title>SQL表格数据转JSON - 在线工具</title>
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
              SQL表格数据转JSON工具
            </h1>
            <p className="text-gray-600">
              支持带边框和无边框的表格格式，自动识别表头和数据
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  输入表格数据
                </label>
                <button
                  onClick={handleClear}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  清空
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="粘贴表格数据，支持以下格式：&#10;1. 带边框格式（使用 | 分隔）&#10;2. 无边框格式（使用空格或制表符分隔）&#10;&#10;示例：&#10;| 列1 | 列2 | 列3 |&#10;|-----|-----|-----|&#10;| 值1 | 值2 | 值3 |"
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleConvert}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                转换为JSON
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  输出JSON
                </label>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  复制
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="转换后的JSON将显示在这里"
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

