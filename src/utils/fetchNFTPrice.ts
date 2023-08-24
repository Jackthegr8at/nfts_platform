import chainsConfig from '@configs/chainsConfig';

export async function fetchNFTPrice(assetId: string, chainKey: string) {
  const url = `${chainsConfig[chainKey].aaEndpoint}/atomicmarket/v2/sales?state=1&asset_id=${assetId}&page=1&limit=100&order=desc&sort=created`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      const sale = data.data[0];
      //console.log("sale info:", sale);
      const price = parseFloat(sale.price.amount) / 10 ** sale.price.token_precision;
      const token = sale.price.token_symbol;
      const saleid = sale.sale_id;
      const collection = sale.collection;
      const asset_id = sale.assets[0]?.asset_id;  // Access the asset_id of the first asset in the assets array
      return { price, token, saleid, collection, asset_id };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching NFT price:", error);
    return null;
  }
}
