'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { settingsAPI } from '@/lib/api'

export default function SettingsTab() {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const queryClient = useQueryClient()

  // Явно указать, что settings — массив, и задать дефолтное значение []
  const { data: settings = [], isLoading } = useQuery<any[], Error>(
    ['settings'],
    () => settingsAPI.getAll() as Promise<any[]>
  )

  const updateMutation = useMutation(
    ({ key, value }: { key: string; value: string }) => 
      settingsAPI.update(key, value),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settings')
        setEditingKey(null)
        setEditValue('')
      }
    }
  )

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key)
    setEditValue(currentValue === '***hidden***' ? '' : currentValue)
  }

  const handleSave = async () => {
    if (editingKey) {
      await updateMutation.mutateAsync({ key: editingKey, value: editValue })
    }
  }

  const handleCancel = () => {
    setEditingKey(null)
    setEditValue('')
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Настройки системы
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Управление конфигурацией AI Assistant
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {Array.isArray(settings) ? settings.map((setting: any) => (
             <div key={setting.key} className="border-b border-gray-200 pb-4">
               <div className="flex items-center justify-between">
                 <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {setting.description || setting.key}
                  </label>
                  
                  {editingKey === setting.key ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type={setting.type === 'password' ? 'password' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 form-input"
                        placeholder={setting.type === 'password' ? 'Введите новое значение...' : ''}
                      />
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded flex-1 mr-2">
                        {setting.value || 'Не задано'}
                      </span>
                      <button
                        onClick={() => handleEdit(setting.key, setting.value)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                      >
                        Изменить
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="mt-1 text-xs text-gray-500">
                Ключ: {setting.key} | Тип: {setting.type}
              </p>
            </div>
          )) : null}
        </div>

        {settings?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Настройки не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}
