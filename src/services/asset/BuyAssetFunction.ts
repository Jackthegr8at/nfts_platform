import { BuyAssetService } from '@services/asset/BuyAssetService';

export const tokenMapping = {
  XPR: {
    accountName: 'eosio.token',
    decimals: 4,
  },
  XUSDC: {
    accountName: 'xtokens',
    decimals: 6,
  },
  METAL: {
    accountName: 'xtokens',
    decimals: 8,
  },
  LOAN: {
    accountName: 'loan.token',
    decimals: 4,
  },
};


export async function onSubmit(priceInfo, ual, chainKey, setIsLoading, modalRef, setModal, router) {
  setIsLoading(true);
  //console.log('priceInfo is:', priceInfo);

  const tokenInfo = tokenMapping[priceInfo.token];
  try {
    const marketplace = chainKey === "xprnetwork" ? 'abstraktsmkt' : 'abstraktsmkt';

    const transferAction = {
      account: tokenInfo.accountName,
      name: 'transfer',
      authorization: [
        {
          actor: ual.activeUser.accountName,
          permission: ual.activeUser.requestPermission,
        },
      ],
      data: {
        from: ual.activeUser.accountName,
        to: 'atomicmarket',
        memo: 'deposit',
        quantity: `${priceInfo.price.toFixed(tokenInfo.decimals)} ${priceInfo.token}`,
      },
    };

    const PurchaseSaleAction = {
      account: 'atomicmarket',
      name: 'purchasesale',
      authorization: [
        {
          actor: ual.activeUser.accountName,
          permission: ual.activeUser.requestPermission,
        },
      ],
      data: {
        buyer: ual.activeUser.accountName,
        sale_id: [priceInfo.saleid],
        intended_delphi_median: '0',
        taker_marketplace: marketplace,
      },
    };

    await BuyAssetService({
      activeUser: ual.activeUser,
      transferServiceProps: [transferAction],
      PurchaseSaleActionProps: [PurchaseSaleAction],
    });

    modalRef.current?.openModal();
    const title = 'NFT was successfully bought';
    const message = 'Please wait while we refresh the page.';

    setModal({
      title,
      message,
    });


    setTimeout(() => {
      if (priceInfo?.collection && priceInfo?.asset_id) {
        const link = `/${chainKey}/collection/${priceInfo.collection.collection_name}/asset/${priceInfo.asset_id}`;
        //console.log('Link is:', link);
        router.push(link);
      } else {
        // Both values are not defined, refresh the page
        router.reload();
      }
    }, 6000);
  } catch (e) {
    modalRef.current?.openModal();
    const jsonError = JSON.parse(JSON.stringify(e));
    const details = JSON.stringify(e, undefined, 2);
    const message =
      jsonError?.cause?.json?.error?.details[0]?.message ??
      'Unable to buy the NFT';

    setModal({
      title: 'Error',
      message,
      details,
      isError: true,
    });
  }
  setIsLoading(false);
}