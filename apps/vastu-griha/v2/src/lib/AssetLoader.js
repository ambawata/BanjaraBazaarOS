import manifest from '../../assets/asset-manifest.json'

// Load all SVG files under the assets folder eagerly as URL strings.
// Vite's import.meta.glob handles resolving these to production asset URLs automatically.
const assetModules = import.meta.glob('../../assets/**/*.svg', { eager: true, import: 'default' })

export const AssetLoader = {
  /**
   * Get all registered assets from the manifest.
   * @returns {Array} List of asset items.
   */
  getAllAssets() {
    return manifest
  },

  /**
   * Get an asset metadata by its ID.
   * @param {string} id - The unique identifier of the asset.
   * @returns {Object|null} The asset metadata, or null if not found.
   */
  getAsset(id) {
    return manifest.find(asset => asset.id === id) || null
  },

  /**
   * Internal helper to resolve file paths within the asset subfolder structure.
   * @private
   */
  _resolveUrl(asset, filename) {
    if (!asset || !filename) return null

    // Construct the path key matching the Vite import.meta.glob key
    // E.g. "../../assets/furniture/sofa/preview.svg"
    const pathKey = `../../assets/${asset.category}/${asset.filename}/${filename}`
    const resolvedUrl = assetModules[pathKey]

    if (!resolvedUrl) {
      console.warn(`AssetLoader: File not found in glob cache: ${pathKey}`)
      return null
    }

    return resolvedUrl
  },

  /**
   * Get the dynamically resolved URL for the asset's large hero preview.
   * @param {string} id - The asset ID.
   */
  getAssetPreviewUrl(id) {
    const asset = this.getAsset(id)
    return this._resolveUrl(asset, asset?.preview || 'preview.svg')
  },

  /**
   * Get the dynamically resolved URL for the asset's small thumbnail.
   * @param {string} id - The asset ID.
   */
  getAssetThumbnailUrl(id) {
    const asset = this.getAsset(id)
    return this._resolveUrl(asset, asset?.thumbnail || 'thumbnail.svg')
  },

  /**
   * Get the dynamically resolved URL for the asset's 2D top-down planner footprint.
   * @param {string} id - The asset ID.
   */
  getAssetPlannerTopUrl(id) {
    const asset = this.getAsset(id)
    return this._resolveUrl(asset, asset?.plannerTop || 'planner-top.svg')
  },

  /**
   * Get the dynamically resolved URL for the asset's outline snapping footprint.
   * @param {string} id - The asset ID.
   */
  getAssetPlannerOutlineUrl(id) {
    const asset = this.getAsset(id)
    return this._resolveUrl(asset, asset?.plannerOutline || 'planner-outline.svg')
  },

  /**
   * Legacy lookup compatibility returning preview.
   */
  getAssetUrl(id) {
    return this.getAssetPreviewUrl(id)
  },

  /**
   * Get all assets belonging to a specific category.
   * @param {string} category - The category name.
   * @returns {Array} List of assets.
   */
  getAssetsByCategory(category) {
    if (!category || category === 'all') {
      return manifest
    }
    return manifest.filter(asset => asset.category.toLowerCase() === category.toLowerCase())
  },

  /**
   * Search assets by query and filter by category. Matches name, tags, description, material, color, and category.
   * @param {string} query - The search text query.
   * @param {string} [category] - Optional category filter.
   * @returns {Array} Filtered list of assets.
   */
  searchAssets(query, category) {
    let list = this.getAssetsByCategory(category)
    
    if (query) {
      const cleanQuery = query.toLowerCase().trim()
      list = list.filter(asset => {
        const nameMatch = asset.name?.toLowerCase().includes(cleanQuery)
        const tagsMatch = asset.tags?.some(tag => tag.toLowerCase().includes(cleanQuery))
        const descMatch = asset.description?.toLowerCase().includes(cleanQuery)
        const materialMatch = asset.material?.toLowerCase().includes(cleanQuery)
        const colorMatch = asset.color?.toLowerCase().includes(cleanQuery)
        const categoryMatch = asset.category?.toLowerCase().includes(cleanQuery)
        const idMatch = asset.id?.toLowerCase().includes(cleanQuery)
        
        return nameMatch || tagsMatch || descMatch || materialMatch || colorMatch || categoryMatch || idMatch
      })
    }
    
    return list
  }
}

export default AssetLoader
