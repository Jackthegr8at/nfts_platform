import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CircleNotch, MagnifyingGlass } from 'phosphor-react';
import { withUAL } from 'ual-reactjs-renderer';
import { Disclosure } from '@headlessui/react';

import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Card } from '@components/Card';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { Select } from '@components/Select';
import { Loading } from '@components/Loading';
import { CardContainer } from '@components/CardContainer';
import { SeeMoreButton } from '@components/SeeMoreButton';
import { Header } from '@components/Header';

import chainsConfig from '@configs/chainsConfig';
import { ipfsEndpoint, ipfsGateway, chainKeyDefault, appName } from '@configs/globalsConfig';

import { SellAssetProps, SellAssetService } from '@services/asset/MassSellAssetService';
import { fetchSalesInventory } from '@services/inventory/salesInventoryService';
import { collectionSalesAssetsService } from '@services/collection/collectionSalesAssetsService';
import {
  getInventoryService,
  AssetProps,
} from '@services/inventory/getInventoryService';
import { getAccountStatsService } from '@services/account/getAccountStatsService';
import { ClaimBalanceService } from '@services/account/ClaimBalanceService';


const transferValidation = yup.object().shape({
  recipient: yup.string().eosName(),
  memo: yup.string(),
});

interface ModalProps {
  title: string;
  message?: string;
  details?: string;
  isError?: boolean;
}

function MassSales({ ual }) {
  const router = useRouter();
  const modalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(transferValidation),
  });

  const [balanceQuantities, setBalanceQuantities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<AssetProps[]>([]);
  const [assetsOnSale, setAssetsOnSale] = useState([]);
  const [ownedCollections, setOwnedCollections] = useState([]);
  const [collectionsFilterOptions, setCollectionsFilterOptions] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [match, setMatch] = useState('');
  const [waitToSearch, setWaitToSearch] = useState(null);
  const [price, setPrice] = useState<number | null>(null);
  const [priceUSD, setPriceUSD] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [modal, setModal] = useState<ModalProps>({
    title: '',
    message: '',
    details: '',
    isError: false,
  });

  const chainKey = (router.query.chainKey ?? chainKeyDefault) as string;

  const chainIdLogged =
    ual?.activeUser?.chainId ?? ual?.activeUser?.chain.chainId;

  const chainId = chainsConfig[chainKey].chainId;

  const limit = 12;
  const currentPage = Math.ceil(filteredAssets.length / limit);
  const offset = (currentPage - 1) * limit;
  const isEndOfList = filteredAssets.length % limit > 0;

  const accountName = ual?.activeUser?.accountName;

  const [selectedToken, setSelectedToken] = useState("XPR");

  const tokenOptions = [
    { value: 'XPR', label: 'XPR' },
    { value: 'XUSDC', label: 'XUSDC' },
  ];

  const handleTokenChange = (value) => {
    //console.log("Selected value:", value);
    setSelectedToken(value);
  };

  const getTokenData = (token) => {
    const tokenData = {
      XPR: {
        listing_price: `${price.toFixed(4)} XPR`,
        settlement_symbol: '4,XPR',
      },
      XUSDC: {
        listing_price: `${price.toFixed(6)} XUSDC`,
        settlement_symbol: '6,XUSDC',
      },
    };
    return tokenData[token];
  };

  async function get_table_rows({
    chainKey,
    json = true,
    code,
    scope,
    table,
    lower_bound = "",
    upper_bound = "",
    index_position = 1,
    key_type = "",
    limit = 10,
    reverse = false,
    show_payer = false
  }) {

    const rpcEndpoint = `${chainsConfig[chainKey].protocol}://${chainsConfig[chainKey].host}`;
    //const rpcEndpoint = "https://api-proton.saltant.io";

    //console.log(rpcEndpoint);
    const response = await fetch(`${rpcEndpoint}/v1/chain/get_table_rows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json,
        code,
        scope,
        table,
        lower_bound,
        upper_bound,
        index_position,
        key_type,
        limit,
        reverse,
        show_payer
      }),
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse.rows;
    } else {
      throw new Error(`Error fetching table rows: ${response.statusText}`);
    }
  }


  useEffect(() => {
    if (accountName) {
      fetchSalesInventory({ chainKey: chainKey, seller: accountName })
        .then(setAssetsOnSale)
        .catch(err => console.error(err));
    }
  }, [chainKey, accountName]);


  useEffect(() => {
    if (!accountName) return;
    async function getAtomicMarketBalance() {
      try {
        const result = await get_table_rows({
          chainKey,
          code: "atomicmarket",
          scope: "atomicmarket",
          table: "balances",
          lower_bound: accountName,
          limit: 1,
          reverse: false,
          show_payer: false,
        });
        if (result && result.length > 0 && result[0].owner === accountName) {
          const quantities = result[0].quantities.map(qty => {
            const [value, token] = qty.split(' ');
            return { value, token };
          });
          setBalanceQuantities(quantities);
        } else {
          console.error(`No Atomic Market balances found for account: ${accountName}.`);
        }
      } catch (error) {
        console.error("Error fetching table rows:", error);
      }
    }

    getAtomicMarketBalance();
  }, [chainKey, accountName]);

  const handleBalanceClaims = async () => {
    setIsLoading(true);

    try {
      const actions = [];

      // Iterate through each balance quantity
      balanceQuantities.forEach((balance) => {
        const claimBalanceAction = {
          account: 'atomicmarket',
          name: 'withdraw',
          authorization: [
            {
              actor: ual.activeUser.accountName,
              permission: ual.activeUser.requestPermission,
            },
          ],
          data: {
            owner: ual.activeUser.accountName,
            token_to_withdraw: `${balance.value} ${balance.token}`,
          },
        };
        actions.push(claimBalanceAction);
      });

      await ClaimBalanceService({
        activeUser: ual.activeUser,
        actions: actions,
      });

      setIsSaved(true);

      modalRef.current?.openModal();
      const title = 'Successfully claimed';
      const message = 'Please wait while we refresh the page.';

      setModal({
        title,
        message,
      });

      setTimeout(() => {
        router.reload();
        setIsSaved(false);
      }, 6000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to claim';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  };



  useEffect(() => {
    fetch('https://api.protonchain.com/v1/chain/exchange-rates/info')
      .then(response => response.json())
      .then(data => {
        const xprData = data.find(tokenData => tokenData.symbol === 'XPR');
        if (xprData) {
          const usdRate = xprData.rates.find(rateData => rateData.counterCurrency === 'USD');
          if (usdRate) {
            setExchangeRate(usdRate.price);
          }
        }
      });
  }, []);

  function handlePrice(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (value === '') {
      setPrice(null);
      setPriceUSD(null);
    } else {
      const price = parseFloat(value);
      setPrice(price);
      setPriceUSD(parseFloat((price * exchangeRate).toFixed(2)));
    }
  }

  useEffect(() => {
    async function getUserInfo() {
      try {
        const { data: inventory } = await getInventoryService(chainKey, {
          owner: accountName,
        });

        const { data: collections } = await getAccountStatsService(
          chainKey,
          accountName
        );

        setFilteredAssets(inventory.data);
        setOwnedCollections(collections.data['collections']);
      } catch (e) {
        modalRef.current?.openModal();
        const jsonError = JSON.parse(JSON.stringify(e));
        const details = JSON.stringify(e, undefined, 2);
        const message =
          jsonError?.cause?.json?.error?.details[0]?.message ??
          'Unable to get user inventory or collections';

        setModal({
          title: 'Error',
          message,
          details,
        });
      }
    }

    if (!!chainId && !!chainIdLogged && chainId === chainIdLogged) {
      getUserInfo();
    }
  }, [chainKey, chainIdLogged, chainId, accountName]);

  useEffect(() => {
    let options = [
      {
        label: `All Collections (${ownedCollections.length})`,
        value: '',
      },
    ];

    ownedCollections.forEach((item) =>
      options.push({
        label: `(${item.collection.name}) By ${item.collection.author}`,
        value: item.collection.collection_name,
      })
    );

    setCollectionsFilterOptions(options);
  }, [ownedCollections]);

  useEffect(() => {
    async function getUserInventory() {
      try {
        const { data: inventory } = await getInventoryService(chainKey, {
          owner: accountName,
          collection_name: selectedCollection,
        });

        setFilteredAssets(inventory.data);
      } catch (e) {
        modalRef.current?.openModal();
        const jsonError = JSON.parse(JSON.stringify(e));
        const details = JSON.stringify(e, undefined, 2);
        const message =
          jsonError?.cause?.json?.error?.details[0]?.message ??
          'Unable to get user inventory';

        setModal({
          title: 'Error',
          message,
          details,
        });
      }
    }
    if (selectedCollection) {
      getUserInventory();
    }
  }, [selectedCollection, accountName, chainKey]);

  async function handleSeeMoreAssets() {
    setIsLoading(true);

    try {
      const { data } = await getInventoryService(chainKey, {
        owner: accountName,
        match,
        collection_name: selectedCollection,
        page: currentPage + 1,
        limit,
        offset,
      });

      setFilteredAssets((state) => [...state, ...data.data]);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to get user inventory';

      setModal({
        title: 'Error',
        message,
        details,
      });
    }

    setIsLoading(false);
  }

  async function onSubmit() {
    setIsLoading(true);

    let assetIds = [];
    selectedAssets.map((item) => {
      assetIds.push(item.asset_id);
    });
    //console.log(assetIds);
    //console.log(ual.activeUser);
    //console.log(ual.activeUser.accountName);
    try {
      const assetsToCancel = assetsOnSale.filter(asset => assetIds.includes(asset.asset_id));

      const cancelSaleActionProps = assetsToCancel.map((asset) => {
        return {
          account: 'atomicmarket',
          name: 'cancelsale',
          authorization: [
            {
              actor: ual.activeUser.accountName,
              permission: ual.activeUser.requestPermission,
            },
          ],
          data: {
            sale_id: asset.sale_id,
          },
        };
      });
      //  const price = '155000.0000 XPR'
      const marketplace = chainKey === "xprnetwork" ? 'abstraktsmkt' : 'abstraktsmkt';

      const saleActionsByAsset = assetIds.reduce((acc, assetId) => {



        const tokenData = getTokenData(selectedToken);

        const announceSaleAction = {
          account: 'atomicmarket',
          name: 'announcesale',
          authorization: [
            {
              actor: ual.activeUser.accountName,
              permission: ual.activeUser.requestPermission,
            },
          ],
          data: {
            seller: ual.activeUser.accountName,
            asset_ids: [assetId],
            listing_price: tokenData.listing_price,
            settlement_symbol: tokenData.settlement_symbol,
            maker_marketplace: marketplace,
          },
        };

        const createOfferAction = {
          account: 'atomicassets',
          name: 'createoffer',
          authorization: [
            {
              actor: ual.activeUser.accountName,
              permission: ual.activeUser.requestPermission,
            },
          ],
          data: {
            sender: ual.activeUser.accountName,
            recipient: 'atomicmarket',
            sender_asset_ids: [assetId],
            recipient_asset_ids: [],
            memo: 'sale',
          },
        };


        return [
          ...acc,
          announceSaleAction,
          createOfferAction,
        ];
      }, []);

      const createSaleActionProps = saleActionsByAsset.map((saleAction) => ({ ...saleAction }));

      //console.log(cancelSaleActionProps);
      //console.log(createSaleActionProps);

      await SellAssetService({
        activeUser: ual.activeUser,
        cancelSaleActionProps,
        createSaleActionProps,
      });



      //  sender: assetIds,
      //  price: salePrice,


      setIsSaved(true);

      modalRef.current?.openModal();
      const title = 'NFTs was successfully put on sale';
      const message = 'Please wait while we refresh the page.';

      setModal({
        title,
        message,
      });

      setTimeout(() => {
        router.reload();
        setIsSaved(false);
      }, 6000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to sale NFTs';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }

  function handleAssetSelection(asset) {
    const alreadySelected =
      selectedAssets.length > 0 &&
      selectedAssets.find((item) => item && item.asset_id === asset.asset_id);

    if (!alreadySelected) {
      setSelectedAssets((state) => [...state, ...[asset]]);
    }

    setSelectedAssets((state) => {
      const assetIndex = selectedAssets.findIndex(
        (item) => item && item.asset_id === asset.asset_id
      );

      let newState = state.filter((item, index) => index !== assetIndex);

      return [...newState];
    });
  }

  function handleLogin() {
    ual?.showModal();
  }

  async function handleSearch(event) {
    const { value } = event.target;
    clearTimeout(waitToSearch);

    setMatch(value);
    const newWaitToSearch = setTimeout(async () => {
      const { data: assets } = await getInventoryService(chainKey, {
        match: value || '',
        owner: accountName,
        collection_name: selectedCollection || '',
      });

      setFilteredAssets(assets.data);
    }, 500);

    setWaitToSearch(newWaitToSearch);
  }

  if (!!chainId && !!chainIdLogged && chainId === chainIdLogged) {
    return (
      <>
        <Head>
          <title>{`Mass Sale - ${appName}`}</title>
        </Head>

        <Header.Root border>
          <Header.Content title="Mass Sale" />
        </Header.Root>

        {balanceQuantities.length > 0 &&
          <div className="container mt-6">
            <div className="flex flex-col sm:flex-row justify-between p-8 mb-8 gap-4 bg-neutral-800 text-white rounded-md w-full">
              <div className="flex flex-row gap-4 items-center">
                <div className="bg-yellow-400/10 p-3.5 rounded-full">
                </div>
                <div className="flex flex-col  items-start">
                  <h3 className="title-1">Claims</h3>
                  <span className="body-2">
                    You have unclaimed balances: {balanceQuantities.map(balance => `${balance.value} ${balance.token}`).join(', ')}.
                    Click on the button to claim them.
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-2">
                <button
                  type="button"
                  className={'btn w-fit whitespace-nowrap'}
                  onClick={handleBalanceClaims}
                >
                  {'Claim Unclaimed Items'}
                </button>
              </div>
            </div>
          </div>
        }


        <main className="container">
          <h2 className="headline-2 mt-4 md:mt-8">
            Sell one or multiple NFTs
          </h2>
          <ol className="list-decimal pl-6 body-1 text-neutral-200 mt-2">
            <li className="pl-1">Select the NFTs by clicking on their pictures to the right.</li>
            <li className="pl-1">Each selected NFT will have a separate listing; they will not be bundled together.</li>
            <li className="pl-1">Choose the token you want to list the NFTs for.</li>
            <li className="pl-1">Enter the price in the selected token in the price field. If you're listing in XPR, the USD equivalent will be displayed.</li>
            <li className="pl-1">Click the "Put on sale NFTs" button.</li>
          </ol>
          <Modal ref={modalRef} title={modal.title}>
            <p className="body-2 mt-2">{modal.message}</p>
            {!modal.isError ? (
              <span className="flex gap-2 items-center py-4 body-2 font-bold text-white">
                <CircleNotch size={24} weight="bold" className="animate-spin" />
                Loading...
              </span>
            ) : (
              <Disclosure>
                <Disclosure.Button className="btn btn-small mt-4">
                  Details
                </Disclosure.Button>
                <Disclosure.Panel>
                  <pre className="overflow-auto p-4 rounded-lg bg-neutral-700 max-h-96 mt-4">
                    {modal.details}
                  </pre>
                </Disclosure.Panel>
              </Disclosure>
            )}
          </Modal>

          <div className="flex md:flex-row flex-col gap-16 w-full md:my-16 my-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col md:w-1/2 w-full gap-8"
            >
              {selectedAssets.length > 0 ? (
                <div className="flex flex-col gap-8">
                  <h3 className="headline-3">Selected NFTs</h3>
                  <CardContainer additionalStyle="sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
                    {selectedAssets.map((asset, index) => (
                      <div key={index} className="w-full flex flex-col gap-4">
                        <Card
                          id={asset.template_mint}
                          onClick={() => handleAssetSelection(asset)}
                          image={
                            asset.data['image'] || asset.data['glbthumb']
                              ? `${ipfsGateway}/${asset.data['image'] || asset.data['glbthumb']
                              }`
                              : ''
                          }
                          video={
                            asset.data['video']
                              ? `${ipfsEndpoint}/${asset.data['video']}`
                              : ''
                          }
                          title={asset.name}
                          subtitle={`by ${asset.collection.author}`}
                        />
                        <Link
                          href={`/${chainKey}/collection/${asset.collection.collection_name}/asset/${asset.asset_id}`}
                          className="btn btn-small whitespace-nowrap w-full text-center truncate"
                          target="_blank"
                        >
                          View Asset
                        </Link>
                      </div>
                    ))}
                  </CardContainer>
                </div>
              ) : (
                <div className="bg-neutral-800 px-8 py-16 text-center rounded-xl">
                  <h4 className="title-1">Select NFTs to sell</h4>
                </div>
              )}
              {isLoading ? (
                <span className="flex gap-2 items-center p-4 body-2 font-bold text-white">
                  <CircleNotch size={24} weight="bold" className="animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  <Select
                    onChange={(option) => handleTokenChange(option)}
                    label="Select Token"
                    selectedValue={selectedToken}
                    options={tokenOptions}
                  />

                  <Input
                    icon={<MagnifyingGlass size={24} />}
                    type="number"
                    label={`Price (${selectedToken})`}
                    placeholder={`Price in ${selectedToken}`}
                    onChange={handlePrice}
                    value={price}
                    step={selectedToken === "XUSDC" ? "any" : "1"}
                  />
                  {priceUSD !== null && selectedToken === "XPR" && (
                    <p>USD Price: {priceUSD}</p>
                  )}
                  <button
                    type="submit"
                    className={`btn w-fit whitespace-nowrap ${isSaved && 'animate-pulse bg-emerald-600'
                      }`}
                    disabled={selectedAssets.length === 0}
                  >
                    {isSaved ? 'Saved' : 'Put on sale NFTs'}
                  </button>
                </>
              )}
            </form>
            <div className="flex flex-col md:w-1/2 w-full">
              <div className="flex flex-col gap-8">
                <h3 className="headline-3">Select NFTs to put on sale</h3>

                {collectionsFilterOptions.length > 0 && (
                  <div className="z-10">
                    <Select
                      onChange={(option) => setSelectedCollection(option)}
                      label="Filter by collection"
                      selectedValue={collectionsFilterOptions[0].value}
                      options={collectionsFilterOptions}
                    />
                  </div>
                )}
                <Input
                  icon={<MagnifyingGlass size={24} />}
                  type="search"
                  label="Search by name"
                  placeholder="Search NFT"
                  onChange={handleSearch}
                  value={match}
                />
                {filteredAssets.length > 0 ? (
                  <CardContainer additionalStyle="sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredAssets.map((asset, index) => {
                      if (asset.is_transferable) {
                        const saleInfo = assetsOnSale.find(sale => sale.asset_id === asset.asset_id);
                        return (
                          <div key={index} className="w-full flex flex-col gap-4">
                            <div
                              className={`cursor-pointer ${selectedAssets.includes(asset) &&
                                'border-4 rounded-xl'
                                } relative`}
                            >
                              {saleInfo && (
                                <div
                                  className="absolute top-0 right-0 z-10"
                                  title={`On sale for ${saleInfo.listing_price} ${saleInfo.listing_symbol}`}
                                >
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-800 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-6 w-10 bg-red-800 text-white text-sm items-center justify-center">
                                    Sale
                                  </span>
                                </div>
                              )}
                              <Card
                                id={asset.template_mint}
                                onClick={() => handleAssetSelection(asset)}
                                image={
                                  asset.data.image || asset.data.glbthumb
                                    ? `${ipfsGateway}/${asset.data.image || asset.data.glbthumb
                                    }`
                                    : ''
                                }
                                video={
                                  asset.data.video
                                    ? `${ipfsEndpoint}/${asset.data.video}`
                                    : ''
                                }
                                title={asset.name}
                                subtitle={`by ${asset.collection.author}`}
                                subtitle2={`${saleInfo ? `${saleInfo.listing_price} ${saleInfo.listing_symbol}` : ''}`}
                              />
                            </div>
                            <Link
                              href={`/${chainKey}/collection/${asset.collection.collection_name}/asset/${asset.asset_id}`}
                              className="btn btn-small whitespace-nowrap w-full text-center truncate"
                              target="_blank"
                            >
                              View Asset
                            </Link>
                          </div>
                        );
                      }
                    })}
                  </CardContainer>
                ) : (
                  <>
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <div className="bg-neutral-800 px-8 py-24 text-center rounded-xl">
                        <h4 className="title-1">NFTs not found</h4>
                      </div>
                    )}
                  </>
                )}
                {!isEndOfList && (
                  <div className="flex justify-center">
                    <SeeMoreButton
                      isLoading={isLoading}
                      onClick={handleSeeMoreAssets}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Mass Sale - ${appName}`}</title>
      </Head>

      {!ual?.activeUser && (
        <div className="mx-auto my-14 text-center">
          <h2 className="headline-2">Connect your wallet</h2>
          <p className="body-1 mt-2 mb-6">
            You need to connect your wallet to put on sale one or multiple NFTs
          </p>
          <button type="button" className="btn" onClick={handleLogin}>
            Connect Wallet
          </button>
        </div>
      )}
    </>
  );
}

export default withUAL(MassSales);