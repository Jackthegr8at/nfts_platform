import { useState, useEffect, useRef, useMemo } from 'react';
import { ipfsEndpoint, ipfsGateway } from '@configs/globalsConfig';

import { fetchSalesInventory } from '@services/inventory/salesInventoryService';
import { Card } from '@components/Card';
import { CardContainer } from '@components/CardContainer';
import { SeeMoreButton } from '@components/SeeMoreButton';
import { collectionTabs } from '@utils/collectionTabs';
import { onSubmit, tokenMapping } from '@services/asset/BuyAssetFunction';

import { Modal } from '@components/Modal';
import { CircleNotch } from 'phosphor-react';
import { Disclosure } from '@headlessui/react';

import { useRouter } from 'next/router';
import Link from 'next/link';


interface CollectionAssetsListProps {
  ual: any;
  chainKey: string;
  collectionName: string;
  storefront: any;
  collection: any;
}

interface ModalProps {
  title: string;
  message?: string;
  details?: string;
  isError?: boolean;
}


export function CollectionAssetsSalesList({
  chainKey,
  collectionName,
  collection,
  ual,
  storefront,
}: CollectionAssetsListProps) {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedAssets, setDisplayedAssets] = useState([]);
  const [Showcases, setShowcases] = useState([]);
  const router = useRouter();
  const modalRef = useRef(null);


  const [filter, setFilter] = useState({
    owner: '',
    listingSymbol: '',
    minPrice: 0,
    maxPrice: Infinity,
  });

  useEffect(() => {
    fetchSalesInventory({ chainKey: chainKey, collectionName: collectionName })
      .then((data) => {
        //console.log('Assets fetched:', data);
        setAssets(data);
      })
      .catch(err => console.error(err));
  }, [chainKey, collectionName]);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (filter.owner && asset.owner !== filter.owner) return false;
      if (filter.listingSymbol && asset.listing_symbol !== filter.listingSymbol) return false;
      if (filter.minPrice && asset.listing_price < filter.minPrice) return false;
      if (filter.maxPrice && asset.listing_price > filter.maxPrice) return false;
      return true;
    });
  }, [assets, filter]);

  const limit = 20;
  const isEndOfList = displayedAssets.length === filteredAssets.length;


  useEffect(() => {
    setDisplayedAssets(filteredAssets.slice(0, limit));
  }, [filteredAssets, limit]);


  const [modal, setModal] = useState<ModalProps>({
    title: '',
    message: '',
    details: '',
    isError: false,
  });

  function handleSeeMoreAssets() {
    const nextPageStartIndex = displayedAssets.length;
    const nextPageEndIndex = nextPageStartIndex + limit;
    setDisplayedAssets([...displayedAssets, ...filteredAssets.slice(nextPageStartIndex, nextPageEndIndex)]);
  }

  const handleSubmit = (priceInfo) => {
    onSubmit(priceInfo, ual, chainKey, setIsLoading, modalRef, setModal, router);
  };


  const uniqueOwners = [...new Set(assets.map(asset => asset.owner))].sort();
  const uniqueSymbols = [...new Set(assets.map(asset => asset.listing_symbol))];

  //console.log('Assets displayedAssets:', displayedAssets);

  //
  useEffect(() => {
    const fetchData = async () => {
      // if storefront is undefined, default to an empty object
      const safeStorefront = storefront || {};

      const infoShowcases = [
        {
          collection_name: safeStorefront.collection1,
        },
        {
          collection_name: safeStorefront.collection2,
        },
        {
          collection_name: safeStorefront.collection3,
        },
      ].filter(info => info.collection_name);  // filter out items with undefined collection_name

      // use Promise.all to fetch all Showcases concurrently
      const dataShowcases = await Promise.all(
        infoShowcases.map(async info => {
          const responseWithAuthor = await fetchSalesInventory({
            chainKey: chainKey,
            collectionName: info.collection_name,
            seller: collection.author,
            maxlimit: 3,
            fast: true
          });

          if (responseWithAuthor.length === 0) {
            const responseWithoutAuthor = await fetchSalesInventory({
              chainKey: chainKey,
              collectionName: info.collection_name,
              maxlimit: 3,
              fast: true
            });
            return responseWithoutAuthor;
          } else {
            return responseWithAuthor;
          }
        })
      );
      //console.log('dataShowcases infos:', dataShowcases);
      let Showcases = null; // Initializing Showcases to null
      if (dataShowcases[0]?.length !== 0) {
        const nonEmptyShowcases = dataShowcases.filter(showcase => showcase.length !== 0);

        Showcases = nonEmptyShowcases.map((assetsArray, index) => {
          const Showcase = assetsArray[0].collection;
          //console.log('assetsArray infos:', assetsArray);
          return {
            href: `/${chainKey}/collection/${Showcase.collection_name}`,
            author: Showcase.author,
            authorImg: `${ipfsGateway}/${Showcase.img}`,
            authorHref: `/${chainKey}/author/${Showcase.author}`,
            name: Showcase.name,
            featuredImage: `${ipfsGateway}/${Showcase.img}`,
            totalItems: assetsArray.length, // Get the number of assets in the collection
            popularItems: assetsArray
              .filter(asset => asset.data.image || asset.data.video)
              .map(asset => ({
                href: `/${chainKey}/collection/${Showcase.collection_name}/asset/${asset.asset_id}`,
                tokenId: asset.asset_id,
                tokenImage: asset.data.image ? `${ipfsGateway}/${asset.data.image}` : null,
                tokenVideo: asset.data.video ? `${ipfsEndpoint}/${asset.data.video}` : null
              })),
          };
        });
      }

      setShowcases(Showcases);

    };
    fetchData();
  }, []);

  return (
    <>
      <section className="container">
        <h2 className="headline-2 my-8 flex items-center gap-2">
          {collectionTabs[4].name}
          <span className="badge-medium">{`${displayedAssets.length ?? 0}/${assets.length ?? 0}`}</span>
        </h2>


        {assets.length > 0 ? (
          <>

            <Modal ref={modalRef} title={modal.title}>
              <p className="body-2 mt-2">{modal.message}</p>
              {!modal.isError ? (
                <span className="flex gap-2 items-center py-4 body-2 font-bold text-white">
                  <CircleNotch size={24} weight="bold" className="animate-spin" />
                  Redirecting...
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

            {Showcases && Showcases.length > 0 && collection && collection.author && (
              <div className="relative mx-auto py-8 px-2 w-full max-w-7xl">
                <div className="mx-auto max-w-2xl lg:max-w-5xl">
                  <h3 className="headline-3 mb-4">Featured by {collection.author}</h3>

                  {/* :Showcases */}
                  <div className={
                    `mt-5 sm:mt-10 grid gap-2 ${collection.length === 1 ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-3'}`}
                  >
                    {Showcases.map(Showcase => (
                      <div key={Showcase.id} className="col-span-1 p-5 flex flex-col rounded-md hover:shadow-custom">
                        {/* ::Pictures Container */}
                        <div className="w-full grid grid-cols-3 gap-3">
                          {/* :::featured item */}
                          <div onClick={() => router.push(Showcase.href)}
                            className="col-span-full group cursor-pointer relative w-full h-56 rounded-md overflow-hidden hover:shadow">
                            <img src={Showcase.featuredImage} alt="" className="absolute inset-0 w-full h-full object-cover transition duration-200 ease-in transform hover:scale-105" />
                          </div>
                          {/* :::other popular items */}
                          {Showcase.popularItems.map(item => (
                            <div
                              key={item.tokenId}
                              onClick={() => router.push(item.href)}
                              className="col-span-1 cursor-pointer relative w-full h-20 rounded-md overflow-hidden hover:shadow"
                            >
                              {item.tokenVideo ? (
                                <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover transition duration-200 ease-in transform hover:scale-105">
                                  <source src={item.tokenVideo} type="video/mp4" />
                                </video>
                              ) : (
                                <img src={item.tokenImage} alt="" className="absolute inset-0 w-full h-full object-cover transition duration-200 ease-in transform hover:scale-105" />
                              )}
                            </div>
                          ))}
                        </div>
                        {/* ::Details Container */}
                        <div className="mt-2">
                          {/* :::collection name  */}
                          <p className="text-lg font-bold">{Showcase.name}</p>
                          <div className="mt-0.5 flex items-center justify-between">
                            <p className="inline-flex items-center">
                              {/* :::author avatar  */}
                              <span className="mr-2 w-8 h-8 inline-block border-2 border-gray-50 rounded-full overflow-hidden" aria-label="avatar">
                                <img src={Showcase.authorImg} alt="" className="w-full h-full" />
                              </span>
                              {/* :::author  */}
                              <span className="flex-shrink-0 w-32 text-sm text-gray-300 truncate">
                                by&#160;
                                <span
                                  onClick={() => router.push(Showcase.authorHref)}
                                  className="cursor-pointer text-yellow-500 font-bold hover:text-yellow-600"
                                >
                                  {Showcase.author}
                                </span>
                              </span>
                            </p>
                            {/* :::total items  */}
                            {/*<span className="py-0.5 px-2 border border-gray-200 rounded-md text-xs text-gray-300 font-bold uppercase whitespace-nowrap">{`${Showcase.totalItems} items`}</span>*/}
                          </div>
                        </div>
                      </div>
                    ))
                    }
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="container mt-6">
                <div className="flex flex-col sm:flex-row justify-between p-8 mb-8 gap-4 bg-neutral-800 text-white rounded-md w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <label className="title-1">
                      Owner
                      <select className="text-black w-full px-2 py-1.5 border border-neutral-700 rounded mt-2" value={filter.owner} onChange={(e) => setFilter(f => ({ ...f, owner: e.target.value }))}>
                        <option value="">Select an owner</option>
                        {uniqueOwners.map(owner => <option key={owner} value={owner}>{owner}</option>)}
                      </select>
                    </label>
                    <label className="title-1">
                      Listing Token
                      <select className="text-black w-full px-2 py-1.5 border border-neutral-700 rounded mt-2" value={filter.listingSymbol} onChange={(e) => setFilter(f => ({ ...f, listingSymbol: e.target.value }))}>
                        <option value="">Select a Token</option>
                        {uniqueSymbols.map(symbol => <option key={symbol} value={symbol}>{symbol}</option>)}
                      </select>
                    </label>
                    <label className="title-1">
                      Min Price
                      <input className="text-black w-full px-2 py-1.5 h-10 border border-neutral-700 rounded mt-2" type="number" value={filter.minPrice} onChange={(e) => setFilter(f => ({ ...f, minPrice: e.target.value ? parseFloat(e.target.value) : 0 }))} />
                    </label>
                    <label className="title-1">
                      Max Price
                      <input className="text-black w-full px-2 py-1.5 h-10 border border-neutral-700 rounded mt-2" type="number" value={filter.maxPrice} onChange={(e) => setFilter(f => ({ ...f, maxPrice: e.target.value ? parseFloat(e.target.value) : Infinity }))} />
                    </label>
                  </div>
                </div>
              </div>
              <CardContainer additionalStyle="xl:grid-cols-5">
                {displayedAssets.map((asset) => {
                  return (
                    <div key={asset.asset_id} className="w-full flex flex-col gap-4">
                      <div className="relative bg-neutral-800 rounded-xl cursor-pointer hover:scale-105 duration-300">
                        {asset.listing_price && (
                          <div
                            className="absolute top-0 right-0 z-10"
                            title={`On sale for ${asset.listing_price} ${asset.listing_symbol}`}
                          >
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-800 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-10 bg-red-800 text-white text-sm items-center justify-center">
                              Sale
                            </span>
                          </div>
                        )}
                        <div className="rounded-xl overflow-hidden">
                          <Card
                            id={asset.template && asset.template.template_id}
                            href={`/${chainKey}/collection/${collectionName}/asset/${asset.asset_id}`}
                            image={
                              asset.data.img
                                ? `${ipfsGateway}/${asset.data.img}`
                                : asset.data.image
                                  ? `${ipfsGateway}/${asset.data.image}`
                                  : asset.data.glbthumb
                                    ? `${ipfsEndpoint}/${asset.data.glbthumb}`
                                    : ''
                            }
                            video={
                              asset.data.video
                                ? `${ipfsEndpoint}/${asset.data.video}`
                                : ''
                            }
                            title={asset.name}
                            subtitle={asset.owner && `Owned by ${asset.owner}`}
                            subtitle2={`${asset.listing_price ? `${asset.listing_price} ${asset.listing_symbol}` : ''}`}
                          />
                        </div>
                      </div>
                      {asset.listing_price && tokenMapping.hasOwnProperty(asset.listing_symbol) && (
                        <button
                          className="btn-red btn-small"
                          onClick={() => handleSubmit({ price: asset.listing_price, token: asset.listing_symbol, saleid: asset.sale_id, collection: asset.collection, asset_id: asset.asset_id })}
                        >
                          Buy Now for {asset.listing_price} {asset.listing_symbol}
                        </button>
                      )}
                    </div>
                  );
                })}
              </CardContainer>
              {!isEndOfList && (
                <div className="flex justify-center mt-8">
                  <SeeMoreButton
                    isLoading={isLoading}
                    onClick={handleSeeMoreAssets}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {<div className="container mx-auto px-8 py-24 text-center">
              <h4 className="headline-3">
                There is no NFTs for sale in this collection
              </h4>
            </div>
            }
          </>
        )}
      </section>
    </>
  );
}
