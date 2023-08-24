export interface CancelSaleActionProps {
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

export interface CreateOfferActionProps {
  account: string;
  name: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: {
    sender: string;
    recipient: string;
    sender_asset_ids: string[];
    recipient_asset_ids: string[];
    memo: string;
  };
}

export interface AnnounceSaleActionProps {
  account: string;
  name: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: {
    seller: string;
    asset_ids: string[];
    listing_price: number;
    settlement_symbol: string;
    maker_marketplace: string;
  };
}


export interface SellAssetProps {
  activeUser: any;
  cancelSaleActionProps: CancelSaleActionProps[];
  createSaleActionProps: any[];
}

export async function SellAssetService({
  activeUser,
  cancelSaleActionProps,
  createSaleActionProps,
}: SellAssetProps) {
  const actions = [...cancelSaleActionProps, ...createSaleActionProps];
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