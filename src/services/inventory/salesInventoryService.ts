import {
  getSalesInventoryService,
  SalesAssetProps,
} from '@services/inventory/getSaleInventoryService';

export async function fetchSalesInventory({ chainKey, collectionName = null, seller = null, maxlimit = null, fast = null }) {
  let page = 1;
  const limit = maxlimit || 100;
  let hasNextPage = true;
  let allAssetsOnSale = [];

  while (hasNextPage) {
    let options: { limit: number; page: number; owner?: string; collection_name?: string, seller?: string } = {
      limit: limit,
      page: page
    };

    if (collectionName) {
      options.collection_name = collectionName;
    }

    if (seller) {
      options.seller = seller;
    }


    try {
      const response = await getSalesInventoryService(chainKey, options);
      const assetsOnSale = response.data.data.flatMap((sale) =>
        sale.assets.map((asset) => ({
          asset_id: asset.asset_id,
          sale_id: sale.sale_id,
          listing_price: Number(sale.listing_price) / Math.pow(10, sale.price.token_precision),
          listing_symbol: sale.price.token_symbol,
          name: asset.name,
          data: asset.data,
          owner: asset.owner,
          collection: asset.collection,
          // Add more fields as required
        }))
      );

      allAssetsOnSale = allAssetsOnSale.concat(assetsOnSale);
      //console.log('assets on sale:', assetsOnSale);


      if (!fast) {
        hasNextPage = response.data.data.length > 0;
        if (hasNextPage) {
          page += 1;
        }
      } else {
        hasNextPage = false;
      }

    } catch (error) {
      console.error('Error fetching sales inventory:', error);
      hasNextPage = false;  // stop the loop if there's an error
    }
  }

  //console.log('All assets on sale:', allAssetsOnSale);
  return allAssetsOnSale;
}
