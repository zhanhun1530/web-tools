import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()

  const categories = [
    {
      id: 'jushuitan',
      name: '聚水潭工具',
      description: '聚水潭相关数据处理工具',
      icon: '📦',
      tools: [
        { name: '组装聚水潭上送数据', path: '/tools/jushuitan/assemble' },
        { name: '组装聚水潭数据并格式化', path: '/tools/jushuitan/assemble-format' },
        { name: '聚水潭订单Json格式化', path: '/tools/jushuitan/order-format' },
      ]
    },
    {
      id: 'database',
      name: '数据库工具',
      description: '数据库数据处理工具',
      icon: '🗄️',
      tools: [
        { name: 'SQL表格数据转JSON', path: '/tools/database/sql-to-json' },
      ]
    },
    {
      id: 'format',
      name: '格式化工具',
      description: '代码和数据格式化工具',
      icon: '✨',
      tools: [
        { name: 'JSON格式化', path: '/tools/format/json' },
        { name: 'JavaScript格式化', path: '/tools/format/javascript' },
        { name: 'HTML格式化', path: '/tools/format/html' },
      ]
    },
    {
      id: 'time',
      name: '时间工具',
      description: '时间戳和时间格式转换',
      icon: '⏰',
      tools: [
        { name: '时间戳转换', path: '/tools/time/timestamp' },
      ]
    },
    {
      id: 'encode',
      name: '编码工具',
      description: 'Base64、AES等编码加解密工具',
      icon: '🔐',
      tools: [
        { name: 'Base64加解密', path: '/tools/encode/base64' },
        { name: 'AES加解密', path: '/tools/encode/aes' },
      ]
    },
  ]

  return (
    <>
      <Head>
        <title>在线工具集合</title>
        <meta name="description" content="实用的在线工具集合" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              在线工具集合
            </h1>
            <p className="text-xl text-gray-600">
              实用的在线工具，提高工作效率
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {category.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {category.tools.map((tool) => (
                    <button
                      key={tool.path}
                      onClick={() => router.push(tool.path)}
                      className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-blue-50 rounded-md transition-colors text-gray-700 hover:text-blue-600"
                    >
                      {tool.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

