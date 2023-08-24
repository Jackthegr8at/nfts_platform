
export interface transferServiceProps {
  account: string;
  name: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: {
    from: string;
    to: string;
    memo: string;
    quantity: string;
  };
}

export interface PurchaseSaleActionProps {
  account: string;
  name: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: {
    buyer: string;
    sale_id: string[];
    intended_delphi_median: number;
    taker_marketplace: string;
  };
}

export interface BuyAssetProps {
  activeUser: any;
  transferServiceProps: any[];
  PurchaseSaleActionProps: any[];
}

export async function BuyAssetService({
  activeUser,
  transferServiceProps,
  PurchaseSaleActionProps,
}: BuyAssetProps) {
  const actions = [...transferServiceProps, ...PurchaseSaleActionProps];
  //console.log(actions);

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