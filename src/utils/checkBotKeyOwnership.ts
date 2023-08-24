import { useState, useEffect } from "react";
import { doesOwnerOwnUnlockKey } from "@utils/doesOwnerOwnUnlockKey";

export async function checkBotKeyOwnership(owner: string, collection: string): Promise<boolean> {
  const templateId = 98644;
  const isOwner = await doesOwnerOwnUnlockKey(owner, collection, templateId);

  return isOwner;
}

export function useBotKeyOwnership(owner, collection, chainKey) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chainKey !== 'xprnetwork-test') {
      const storageKey = `botKeyOwnership-${owner}-${collection}`;
      const storedData = localStorage.getItem(storageKey);

      //console.log("Stored bot data:", storedData); 

      if (storedData !== null && JSON.parse(storedData)) {
        setAuthorized(JSON.parse(storedData));
        setLoading(false);
      } else {
        checkBotKeyOwnership(owner, collection)
          .then((isOwner) => {
            setAuthorized(isOwner);
            setLoading(false);
            localStorage.setItem(storageKey, JSON.stringify(isOwner));
          })
          .catch((error) => {
            console.error("Error checking bot key ownership:", error);
            setLoading(false);
          });
      }
    }
  }, [owner, collection, chainKey]);

  return { authorized, loading };
}

export default useBotKeyOwnership;