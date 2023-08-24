export async function doesOwnerOwnUnlockKey(owner: string, collection: string, templateId: number): Promise<boolean> {
  const url = `https://proton.api.atomicassets.io/atomicassets/v1/assets?template_id=${templateId}&owner=${owner}&page=1&limit=100&order=desc&sort=asset_id`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch NFT data");
    }

    for (let i = 0; i < data.data.length; i++) {
      const asset = data.data[i];
      if (asset && asset.mutable_data && (asset.mutable_data.Collection === collection || asset.mutable_data.Collection2 === collection || asset.mutable_data.Collection3 === collection || asset.mutable_data.CollectionText === collection || asset.mutable_data.CollectionText2 === collection || asset.mutable_data.CollectionText3 === collection)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}