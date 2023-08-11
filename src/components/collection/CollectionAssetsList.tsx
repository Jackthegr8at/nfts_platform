import { useState, useEffect, useMemo } from 'react';

import { ipfsEndpoint, ipfsGateway } from '@configs/globalsConfig';
import {
  collectionAssetsService,
  AssetProps,
} from '@services/collection/collectionAssetsService';

import { fetchSalesInventory } from '@services/inventory/salesInventoryService';
import { Card } from '@components/Card';
import { CardContainer } from '@components/CardContainer';
import { SeeMoreButton } from '@components/SeeMoreButton';
import { CreateNewItem } from '@components/collection/CreateNewItem';

import { collectionTabs } from '@utils/collectionTabs';


interface CollectionAssetsListProps {
  chainKey: string;
  initialAssets: AssetProps[];
  initialBurnedAssets: AssetProps[];
  totalAssets: number;
  totalBurned: number;
  collectionName: string;
  hasAuthorization: boolean;
}


export function CollectionAssetsList({
  chainKey,
  initialAssets,
  initialBurnedAssets,
  totalAssets,
  totalBurned,
  collectionName,
  hasAuthorization,
}: CollectionAssetsListProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [isLoading, setIsLoading] = useState(false);
  const [burnedAssets, setBurnedAssets] = useState(initialBurnedAssets);
  const [assetsOnSale, setAssetsOnSale] = useState([]);

  const limit = 12;
  const currentPage = Math.ceil(assets.length / limit);
  const currentBurnedPage = Math.ceil(burnedAssets.length / limit);
  const offset = (currentPage - 1) * limit;
  const burnedOffset = (currentBurnedPage - 1) * limit;
  const isEndOfList = Number(totalAssets) === assets.length;
  const isEndOfBurnedList = Number(totalBurned) === burnedAssets.length;

  async function handleSeeMoreAssets() {
    setIsLoading(true);

    try {
      const { data } = await collectionAssetsService(chainKey, {
        collectionName,
        burned: false,
        page: currentPage + 1,
        offset,
      });

      setAssets((state) => [...state, ...data.data]);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  }

  async function handleSeeMoreBurnedAssets() {
    setIsLoading(true);

    try {
      const { data } = await collectionAssetsService(chainKey, {
        collectionName,
        burned: true,
        page: currentBurnedPage + 1,
        offset: burnedOffset,
      });

      setBurnedAssets((state) => [...state, ...data.data]);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    fetchSalesInventory({ chainKey: chainKey, collectionName: collectionName })
      .then((data) => {
        //console.log('Assets fetched:', data);
        setAssetsOnSale(data);
      })
      .catch(err => console.error(err));
  }, [chainKey, collectionName]);

  return (
    <>
      <section className="container">
        <h2 className="headline-2 my-8 flex items-center gap-2">
          {collectionTabs[3].name}
          <span className="badge-medium">{totalAssets ?? 0}</span>
        </h2>

        {assets.length > 0 ? (
          <>
            <CardContainer>
              {hasAuthorization && (
                <CreateNewItem
                  href={`/${chainKey}/collection/${collectionName}/asset/new`}
                  label="Create NFT"
                />
              )}
              {assets.map((asset) => {
                const saleInfo = assetsOnSale.find(sale => sale.asset_id === asset.asset_id);
                return (
                  <div key={asset.asset_id} className="relative bg-neutral-800 rounded-xl cursor-pointer hover:scale-105 duration-300">
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
                        subtitle2={`${saleInfo ? `${saleInfo.listing_price} ${saleInfo.listing_symbol}` : ''}`}
                      />
                    </div>
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
          </>
        ) : (
          <>
            {hasAuthorization ? (
              <CreateNewItem
                href={`/${chainKey}/collection/${collectionName}/asset/new`}
                label="Create your first NFT"
              />
            ) : (
              <div className="container mx-auto px-8 py-24 text-center">
                <h4 className="headline-3">
                  There is no NFTs in this collection
                </h4>
              </div>
            )}
          </>
        )}
      </section>

      <section className="container">
        <h2 className="headline-2 my-8 flex items-center gap-2">
          Burned <span className="badge-medium">{totalBurned ?? 0}</span>
        </h2>

        {burnedAssets.length > 0 ? (
          <>
            <CardContainer>
              {burnedAssets.map((asset) => (
                <Card
                  key={asset.asset_id}
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
                  subtitle={`Burned by ${asset.burned_by_account}`}
                />
              ))}
            </CardContainer>

            {!isEndOfBurnedList && (
              <div className="flex justify-center mt-8">
                <SeeMoreButton
                  isLoading={isLoading}
                  onClick={handleSeeMoreBurnedAssets}
                />
              </div>
            )}
          </>
        ) : (
          <div className="container mx-auto px-8 py-24 text-center">
            <h4 className="headline-3">
              There is no burned NFTs in this collection
            </h4>
          </div>
        )}
      </section>
    </>
  );
}
