import { doesOwnerOwnNFT } from "@utils/doesOwnerOwnNFT";

export async function checkKeyOwnership(owner: string): Promise<boolean> {
  const templateId = 97288;
  const isOwner = await doesOwnerOwnNFT(owner, templateId);

  return isOwner;
}