import React from 'react'

interface TabItem {
  id: string
  label: string
}

interface TabMenuProps {
  items: TabItem[]
  activeTab: string
  onTabChange: (id: string) => void
}

const TabMenu: React.FC<TabMenuProps> = ({ items, activeTab, onTabChange }) => {
  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`border-b-2 px-1 pb-4 text-sm font-medium ${
              activeTab === item.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default TabMenu
