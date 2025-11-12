import { useState } from 'react'
import { Trash2, Edit2, Save, X } from 'lucide-react'
import { Asset } from '@/types/database.types'

interface AssetListProps {
  assets: Asset[]
  onUpdate: (id: string, updates: Partial<Asset>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function AssetList({ assets, onUpdate, onDelete }: AssetListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const sortedAssets = [...assets].sort((a, b) => a.name.localeCompare(b.name))

  const handleEdit = (asset: Asset) => {
    setEditingId(asset.id)
    setEditValue(asset.current_value.toString())
  }

  const handleSave = async (id: string) => {
    try {
      await onUpdate(id, { current_value: parseFloat(editValue) })
      setEditingId(null)
    } catch (error) {
      console.error('Failed to update asset:', error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        await onDelete(id)
      } catch (error) {
        console.error('Failed to delete asset:', error)
      }
    }
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No assets yet. Add your first asset to get started.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Your Assets</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {sortedAssets.map(asset => (
          <div key={asset.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: asset.color }}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{asset.name}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {asset.category.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {editingId === asset.id ? (
                <>
                  <input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave(asset.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="font-semibold text-gray-900 w-32 text-right">
                    {Number(asset.current_value).toFixed(2)} {asset.currency}
                  </span>
                  <button
                    onClick={() => handleEdit(asset)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
