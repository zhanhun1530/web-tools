import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function SqlToJson() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  // 清理带边框格式的辅助函数
  const cleanBorderTableData = (rawData: string): string => {
    // 1. 按行分割，过滤空行和纯分隔线（仅包含+、-、|、空格的行）
    const lines = rawData.split('\n').filter(line => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return false
      // 匹配纯分隔线（包含+、-、|，无有效文本）
      return !/^[\+\-\|\s]+$/.test(trimmedLine)
    })

    // 2. 处理每一行：去除|符号，清理多余空格（转为制表符分隔，保持与原有格式兼容）
    const cleanedLines = lines.map(line => {
      // 去除所有|符号
      let cleanedLine = line.replace(/\|/g, '')
      // 将多个连续空格替换为单个制表符（处理列之间的空格分隔）
      cleanedLine = cleanedLine.replace(/\s{2,}/g, '\t')
      // 去除首尾空格
      return cleanedLine.trim()
    })

    // 3. 过滤清理后仍为空的行
    return cleanedLines.filter(line => line.trim()).join('\n')
  }

  // 转换核心函数：SQL表格数据转JSON（兼容两种格式）
  const parseTable = (sqlData: string) => {
    try {
      if (!sqlData.trim()) {
        throw new Error('请输入有效的SQL表格数据')
      }

      // 第一步：先判断并清理带边框格式的数据，转换为兼容的制表符分隔格式
      const hasBorder = /[\+\-\|]/.test(sqlData)
      let processedData = sqlData
      if (hasBorder) {
        processedData = cleanBorderTableData(sqlData)
      }

      // 后续逻辑基于处理后的制表符分隔数据进行解析
      // 按行分割数据，过滤空行
      const lines = processedData.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        throw new Error('数据格式错误：至少需要包含表头和一行数据')
      }

      // 解析表头（第一行），按制表符分割并去除首尾空格
      const headers = lines[0].split('\t').map(header => header.trim()).filter(header => header)
      // 解析数据行（从第二行开始）
      const dataRows = lines.slice(1)

      // 校验表头是否有效
      if (headers.length === 0) {
        throw new Error('无法解析有效表头，请检查数据格式')
      }

      // 构建JSON数组
      const jsonArray: any[] = []
      dataRows.forEach((row) => {
        // 按制表符分割当前行数据
        const values = row.split('\t').map(val => val.trim())
        const obj: any = {}

        // 映射表头和对应的值
        headers.forEach((header, colIndex) => {
          // 处理值：去除首尾空格，空值转为空字符串
          let value = values[colIndex] ? values[colIndex].trim() : ''
          // 处理NULL字符串转为实际的null
          if (value.toUpperCase() === 'NULL') {
            obj[header] = null
          } 
          // 尝试转换数字类型（整数/浮点数）
          else if (/^-?\d+$/.test(value)) {
            obj[header] = parseInt(value, 10)
          } else if (/^-?\d+\.\d+$/.test(value)) {
            obj[header] = parseFloat(value)
          } else {
            obj[header] = value
          }
        })

        jsonArray.push(obj)
      })

      return jsonArray
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

