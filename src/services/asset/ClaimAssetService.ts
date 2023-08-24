interface ActionProps {
  account: string;
  name: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: {
    auction_id: string;
  };
}

interface claimAuctionServiceProps {
  activeUser: any;
  actions: ActionProps[];
}

export async function claimNFTService({
  activeUser,
  actions,
}: claimAuctionServiceProps) {
  const response = await activeUser.signTransaction(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );

  return response;
}
