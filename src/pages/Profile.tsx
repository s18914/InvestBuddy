import { useAssets } from '@/hooks/useAssets'
import AddAssetForm from '@/components/AddAssetForm'
import AssetList from '@/components/AssetList'
import PortfolioPieChart from '@/components/PortfolioPieChart'

export default function Profile() {
  const { assets, loading, addAsset, updateAsset, deleteAsset } = useAssets()

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Management</h1>
        <p className="text-gray-600">Define your investment portfolio and track your assets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AddAssetForm onAdd={addAsset} />
          <AssetList
            assets={assets}
            onUpdate={updateAsset}
            onDelete={deleteAsset}
          />
        </div>

        <div className="lg:sticky lg:top-6 h-fit">
          <PortfolioPieChart assets={assets} />
        </div>
      </div>
    </div>
  )
}
