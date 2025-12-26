import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

interface HistoryItem {
  name: string
  raw: string
  formatted: string
  time: number
}

export default function OrderFormatJushuitan() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const HISTORY_KEY = 'jushuitanOrderFormatHistory'
  const MAX_HISTORY = 8

  useEffect(() => {
    // 加载历史记录
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (e) {
      console.error('加载历史记录失败', e)
    }
  }, [])

  const extractOrderNumber = (innerObj: any): string => {
    try {
      if (innerObj.datas && innerObj.datas.length > 0) {
        const soId = innerObj.datas[0].so_id || ''
        return soId.split(',')[0] || '未知订单号'
      }
      return '未知订单号'
    } catch (e) {
      return '未知订单号'
    }
  }

  const getFormattedTime = (): string => {
    const date = new Date()
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const saveHistory = (record: HistoryItem) => {
    try {
      let newHistory = [...history]
      // 移除重复记录
      newHistory = newHistory.filter(item => item.raw !== record.raw)
      // 添加到开头
      newHistory.unshift(record)
      // 限制数量
      if (newHistory.length > MAX_HISTORY) {
        newHistory = newHistory.slice(0, MAX_HISTORY)
      }
      setHistory(newHistory)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    } catch (e) {
      console.error('保存历史记录失败', e)
    }
  }

  const loadHistory = (item: HistoryItem) => {
    setInput(item.raw)
    setOutput(item.formatted)
    setError('')
  }

  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([])
      localStorage.removeItem(HISTORY_KEY)
    }
  }

  const formatJson = () => {
    try {
      setError('')
      if (!input.trim()) {
        setOutput('')
        return
      }

      let inputText = input.trim()
      
      // 去除开头的0|前缀
      if (inputText.startsWith('0|')) {
        inputText = inputText.substring(2)
      }

      // 解析外层JSON
      const outerObj = JSON.parse(inputText)
      
      // 提取ReturnValue字段
      const returnValue = outerObj.ReturnValue
      if (!returnValue) {
        throw new Error('未找到ReturnValue字段')
      }

      // 解析ReturnValue并格式化
      const innerObj = JSON.parse(returnValue)
      const formattedJson = JSON.stringify(innerObj, null, 2)

      setOutput(formattedJson)

      // 保存到历史记录
      const orderNumber = extractOrderNumber(innerObj)
      const time = getFormattedTime()
      const record: HistoryItem = {
        name: `${orderNumber} (${time})`,
        raw: input.trim(),
        formatted: formattedJson,
        time: new Date().getTime()
      }
      saveHistory(record)
    } catch (err: any) {
      setError(`处理失败：${err.message}`)
      setOutput('')
    }
  }

  // 自动格式化（防抖）
  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    const timer = setTimeout(() => {
      formatJson()
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

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
        <title>聚水潭订单Json格式化 - 在线工具</title>
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
              聚水潭订单Json格式化
            </h1>
            <p className="text-gray-600">
              自动格式化聚水潭订单JSON，支持历史记录
            </p>
          </div>

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  历史解析记录（最多{MAX_HISTORY}条）
                </span>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  清空记录
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => loadHistory(item)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-blue-50 text-sm"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入JSON（支持0|前缀）
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="粘贴包含0|前缀的JSON字符串，例如：0|{...}"
                className="w-full h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={formatJson}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  格式化
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  清空
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  格式化后的JSON
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
                  <div className="text-gray-500">格式化后的JSON将显示在这里</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
