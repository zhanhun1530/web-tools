import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

interface HistoryItem {
  name: string
  raw: string
  formatted: string
  time: number
}

export default function AssembleFormatJushuitan() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stats, setStats] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const HISTORY_KEY = 'jushuitanAssembleFormatHistory'
  const MAX_HISTORY = 8

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch (e) {
      console.error('加载历史记录失败', e)
    }
  }, [])

  const processOrderData = (rawData: string) => {
    try {
      let jsonStr = rawData.trim()
      if (jsonStr.startsWith('0|')) {
        jsonStr = jsonStr.substring(2)
      }

      const data = JSON.parse(jsonStr)
      
      if (!data.ReturnValue) {
        throw new Error('数据中未找到ReturnValue字段')
      }

      const returnValue = JSON.parse(data.ReturnValue)
      
      if (!returnValue.datas || !Array.isArray(returnValue.datas)) {
        throw new Error('ReturnValue中未找到有效的datas数组')
      }

      const originalCount = returnValue.datas.length
      
      const filteredDatas = returnValue.datas.filter((item: any) => {
        return !(item.is_split === true || item.is_merge === true)
      })

      const filteredCount = filteredDatas.length
      const removedCount = originalCount - filteredCount

      returnValue.datas = filteredDatas
      
      return {
        returnValue,
        stats: {
          originalCount,
          filteredCount,
          removedCount
        }
      }
    } catch (error: any) {
      throw new Error(`数据处理失败：${error.message}`)
    }
  }

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
      newHistory = newHistory.filter(item => item.raw !== record.raw)
      newHistory.unshift(record)
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
    setSuccess('')
  }

  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([])
      localStorage.removeItem(HISTORY_KEY)
    }
  }

  const handleConvert = () => {
    setError('')
    setSuccess('')
    setStats('')
    
    if (!input.trim()) {
      setError('请输入有效的订单数据')
      return
    }

    try {
      const result = processOrderData(input)
      
      const formattedJson = JSON.stringify(result.returnValue, null, 2)
      setOutput(formattedJson)

      setStats(`原始订单数量：${result.stats.originalCount}\n过滤后订单数量：${result.stats.filteredCount}\n移除的订单数量：${result.stats.removedCount}（is_split/is_merge=true的订单）`)
      setSuccess('数据处理并格式化成功！')

      // 保存到历史记录
      const orderNumber = extractOrderNumber(result.returnValue)
      const time = getFormattedTime()
      const record: HistoryItem = {
        name: `${orderNumber} (${time})`,
        raw: input.trim(),
        formatted: formattedJson,
        time: new Date().getTime()
      }
      saveHistory(record)
    } catch (err: any) {
      setError(err.message)
      setOutput('')
      setStats('')
    }
  }

  const handleCopy = () => {
    if (!output.trim()) {
      setError('没有可复制的处理结果')
      return
    }
    navigator.clipboard.writeText(output)
    setSuccess('处理结果已成功复制到剪贴板！')
    setTimeout(() => setSuccess(''), 2000)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
    setSuccess('')
    setStats('')
  }

  return (
    <>
      <Head>
        <title>组装聚水潭数据并格式化 - 在线工具</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← 返回首页
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              组装聚水潭数据并格式化
            </h1>
            <p className="text-gray-600">
              处理并格式化聚水潭订单数据，过滤is_split/is_merge=true的订单
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

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {stats && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{stats}</pre>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原始订单数据（JSON）
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="请粘贴聚水潭订单原始JSON数据..."
                className="w-full h-[500px] p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleConvert}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  处理并格式化
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
                  处理后订单数据（JSON）
                </label>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  复制
                </button>
              </div>
              <div className="w-full h-[500px] p-4 border border-gray-300 rounded-lg bg-gray-900 overflow-auto">
                {output ? (
                  <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="text-gray-500">处理后的结果将显示在这里</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
