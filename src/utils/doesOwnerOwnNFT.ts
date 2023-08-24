export async function doesOwnerOwnNFT(owner: string, templateId: number): Promise<boolean> {
  const url = `https://proton.api.atomicassets.io/atomicassets/v1/assets?template_id=${templateId}&owner=${owner}&page=1&limit=1&order=desc&sort=asset_id`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch NFT data");
    }

    const asset = data.data[0];
    return asset && asset.owner === owner;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default doesOwnerOwnNFT;