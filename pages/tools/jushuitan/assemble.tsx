import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function AssembleJushuitan() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stats, setStats] = useState('')

  const processOrderData = (rawData: string) => {
    try {
      // 清理输入数据（去除开头的0|等非JSON字符）
      let jsonStr = rawData.trim()
      if (jsonStr.startsWith('0|')) {
        jsonStr = jsonStr.substring(2)
      }

      // 解析JSON
      const data = JSON.parse(jsonStr)
      
      // 检查是否有ReturnValue字段
      if (!data.ReturnValue) {
        throw new Error('数据中未找到ReturnValue字段')
      }

      // 解析ReturnValue中的JSON
      const returnValue = JSON.parse(data.ReturnValue)
      
      // 检查是否有datas数组
      if (!returnValue.datas || !Array.isArray(returnValue.datas)) {
        throw new Error('ReturnValue中未找到有效的datas数组')
      }

      // 记录原始数据数量
      const originalCount = returnValue.datas.length
      
      // 过滤数据：移除is_split=true 或 is_merge=true的订单
      const filteredDatas = returnValue.datas.filter((item: any) => {
        return !(item.is_split === true || item.is_merge === true)
      })

      // 记录过滤后的数据数量
      const filteredCount = filteredDatas.length
      const removedCount = originalCount - filteredCount

      // 更新数据
      returnValue.datas = filteredDatas
      
      // 重新组装返回数据
      const result = {
        ...data,
        ReturnValue: JSON.stringify(returnValue)
      }

      // 返回处理结果和统计信息
      return {
        processedData: result,
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
      
      // 格式化输出JSON
      const formattedJson = JSON.stringify(result.processedData, null, 2)
      setOutput(formattedJson)

      // 显示统计信息
      setStats(`原始订单数量：${result.stats.originalCount}\n过滤后订单数量：${result.stats.filteredCount}\n移除的订单数量：${result.stats.removedCount}（is_split/is_merge=true的订单）`)
      setSuccess('数据处理成功！已过滤掉is_split/is_merge=true的订单')
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
        <title>组装聚水潭上送数据 - 在线工具</title>
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
              组装聚水潭上送数据
            </h1>
            <p className="text-gray-600">
              处理聚水潭订单数据，过滤is_split/is_merge=true的订单
            </p>
          </div>

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
                  处理数据
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
              <textarea
                value={output}
                readOnly
                placeholder="处理后的结果将显示在这里..."
                className="w-full h-[500px] p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
