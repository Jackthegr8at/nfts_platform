interface ActionProps {
  account: string;
  name: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: {
    sale_id: string;
  };
}
interface CancelSellAssetProps {
  activeUser: any;
  actions: ActionProps[];
}

export async function CancelSellAssetService({
  activeUser,
  actions,
}: CancelSellAssetProps) {
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
