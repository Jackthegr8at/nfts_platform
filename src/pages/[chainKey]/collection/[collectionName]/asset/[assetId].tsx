import { Tab } from '@headlessui/react';
import Link from 'next/link';
import Head from 'next/head';
import { withUAL } from 'ual-reactjs-renderer';
import { GetServerSideProps } from 'next';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

import { ipfsEndpoint, ipfsGateway, appName, appUrl } from '@configs/globalsConfig';

import { Card } from '@components/Card';

import { getAssetService, AssetProps } from '@services/asset/getAssetService';

import { Header } from '@components/Header';
import { handlePreview } from '@utils/handlePreview';
import { Attributes } from '@components/Attributes';

import { Modal } from '@components/Modal';
import { CircleNotch } from 'phosphor-react';
import { Disclosure } from '@headlessui/react';

import { isAuthorizedAccount } from '@utils/isAuthorizedAccount';
import { collectionTabs } from '@utils/collectionTabs';
import { fetchNFTPrice } from '@utils/fetchNFTPrice';

import { onSubmit, tokenMapping } from '@services/asset/BuyAssetFunction';

import {
  Storefront,
} from 'phosphor-react';


interface ModalProps {
  title: string;
  message?: string;
  details?: string;
  isError?: boolean;
}

interface AssetViewProps {
  ual: any;
  chainKey: string;
  asset: AssetProps;
}


function Asset({ ual, chainKey, asset }: AssetViewProps) {
  const image = asset.data.img || asset.data.image || asset.data.glbthumb;
  const audio = asset.data.song || asset.data.audio;
  const model = asset.data.model || asset.data.glb;
  const description = asset.data.desc;
  const video = asset.data.video;
  const collection = asset.collection;
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();
  const modalRef = useRef(null);

  //console.log(asset);

  const marketasset = [
    ['Soon.Market', `https://soon.market/nft/templates/${asset.template.template_id}`],
    ['ProtonMint', `https://protonmint.com/${collection.collection_name}/${asset.template.template_id}`],
    ['Proton Market', `https://www.protonmarket.com/${collection.collection_name}/${asset.template.template_id}`],
  ];

  const hasAuthorization = isAuthorizedAccount(ual, collection) as boolean;

  const [localDate, setLocalDate] = useState(null);

  useEffect(() => {
      const unixTimestamp = Math.floor(Number(asset.minted_at_time) / 1000);
      const date = new Date(unixTimestamp * 1000);
      setLocalDate(date.toLocaleString());
  }, [asset.minted_at_time]);

  const [priceInfo, setPriceInfo] = useState(null);
  const assetId = asset.asset_id;

  useEffect(() => {
    fetchNFTPrice(assetId, chainKey).then((fetchedPriceInfo) => {
      if (fetchedPriceInfo !== null) {
        setPriceInfo(fetchedPriceInfo);
        //console.log('the result of priceInfo:',priceInfo);
      } else {
        //console.log("NFT price not available");
      }
    });
  }, [assetId, chainKey]);

  const [modal, setModal] = useState<ModalProps>({
    title: '',
    message: '',
    details: '',
    isError: false,
  });

  //console.log('the result of priceInfo:',priceInfo);

  const handleSubmit = (priceInfo) => {
    onSubmit(priceInfo, ual, chainKey, setIsLoading, modalRef, setModal, router);
  };

  return (
    <>
      <Head>
        <meta prefix="og: http://ogp.me/ns#" />
        <title>{`${asset.name} - ${collection.name}`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${asset.name} - ${collection.name}`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={`${ipfsEndpoint}/${image}`} />
        <meta property="og:url" content={appUrl} />
        <meta name="twitter:image:alt" content={`${asset.name} - ${collection.name}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${ipfsEndpoint}/${image}`} />
      </Head>

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

      <Header.Root
        breadcrumb={[
          [
            hasAuthorization ? 'My Collections' : 'Explorer',
            hasAuthorization ? `/${chainKey}` : `/${chainKey}/explorer`,
          ],
          [
            collection.collection_name,
            `/${chainKey}/collection/${collection.collection_name}`,
          ],
          [
            collectionTabs[3].name,
            `/${chainKey}/collection/${collection.collection_name}?tab=${collectionTabs[3].key}`,
          ],
          [asset.name],
        ]}
      >
        <Header.Content
          title={asset.name}
          subtitle={`Asset #${asset.asset_id}`}
        >
          <Header.Audio audioIpfs={audio} />
          {hasAuthorization && !asset.burned_by_account && (
            <Link
              href={`/${chainKey}/collection/${collection.collection_name}/asset/${asset.asset_id}/edit`}
              className="btn mt-4 mr-4"
            >
              Update Asset
            </Link>
          )}
          {priceInfo && tokenMapping.hasOwnProperty(priceInfo.token) && (
            <button
              className={`btn-red mt-4`}
              onClick={() => handleSubmit(priceInfo)}
            >
              Buy Now for {priceInfo.price} {priceInfo.token}
            </button>
          )}
        </Header.Content>

        <Header.Banner imageIpfs={image} videoIpfs={video} modelIpfs={model} />
      </Header.Root>

      <Tab.Group>
        <Tab.List className="tab-list mb-4 md:mb-8">
          <Tab className="tab">Information</Tab>
          <Tab className="tab">Immutable data</Tab>
          {Object.keys(asset.mutable_data).length > 0 && (
            <Tab className="tab">Mutable data</Tab>
          )}
          {chainKey !== 'xprnetwork-test' && (
            <Tab className="tab">XPR Market</Tab>
          )}
        </Tab.List>
        <Tab.Panels className="container">
          <Tab.Panel>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-0 justify-center pb-8">
              <div className="grid grid-cols-1 h-fit">
                <Card
                  href={`/${chainKey}/collection/${collection.collection_name}`}
                  image={
                    collection.img ? `${ipfsGateway}/${collection.img}` : ''
                  }
                  title={collection.name}
                  subtitle={`by ${collection.author}`}
                />
              </div>

              <div className="md:w-1/2 w-full">
                <div className="w-full md:max-w-sm mx-auto">
                  <div className="flex justify-between py-3 body-2 text-white border-b border-neutral-700">
                    <span>Owner</span>
                    <div
                      onClick={() => router.push(`/${chainKey}/owner/${asset.owner}`)}
                      className="text-highlight cursor-pointer"
                    >
                      {asset.owner}
                    </div>
                  </div>
                  <div className="flex justify-between py-3 body-2 text-white border-b border-neutral-700">
                    <span>Mint Number</span>
                    <div>
                      <span className="font-bold pr-2">
                        {asset.template_mint !== '0'
                          ? asset.template_mint
                          : 'Minting...'}
                      </span>
                      {asset.template && (
                        <span className="">
                          (max:{' '}
                          {parseInt(asset.template.max_supply, 10) ||
                            'Infinite'}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                  <>
                    {asset.template && (
                      <>
                        <div className="flex justify-between py-3 body-2 text-white border-b border-neutral-700">
                          <span>Minted Date</span>
                          <span className="font-bold">{localDate || 'Loading...'}</span>
                        </div>
                        <div className="flex justify-between py-3 body-2 text-white border-b border-neutral-700">
                          <span>Template ID</span>
                          <Link
                            href={`/${chainKey}/collection/${collection.collection_name}/template/${asset.template.template_id}`}
                            className="font-bold underline"
                          >
                            {asset.template.template_id}
                          </Link>
                        </div>
                      </>
                    )}
                  </>
                  <div className="flex justify-between py-3 body-2 text-white border-b border-neutral-700">
                    <span>Schema</span>
                    <Link
                      href={`/${chainKey}/collection/${collection.collection_name}/schema/${asset.schema.schema_name}`}
                      className="font-bold underline"
                    >
                      {asset.schema.schema_name}
                    </Link>
                  </div>
                  <div className="flex justify-between py-3 body-2 text-white border-b border-neutral-700">
                    <span>Burnable</span>
                    <span className="font-bold">
                      {asset.is_burnable ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 body-2 text-white border-b border-neutral-700">
                    <span>Transferable</span>
                    <span className="font-bold">
                      {asset.is_transferable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <Attributes.List>
              {asset.schema.format.map((schema) => (
                <Attributes.Item
                  key={schema.name}
                  name={schema.name}
                  type={schema.type}
                  value={
                    asset.template
                      ? asset.template.immutable_data[schema.name]
                      : asset.immutable_data[schema.name]
                  }
                />
              ))}
            </Attributes.List>
          </Tab.Panel>
          {Object.keys(asset.mutable_data).length > 0 && (
            <Tab.Panel>
              <Attributes.List>
                {asset.schema.format.map((schema) => (
                  <Attributes.Item
                    key={schema.name}
                    name={schema.name}
                    type={schema.type}
                    value={asset.mutable_data[schema.name]}
                  />
                ))}
              </Attributes.List>
            </Tab.Panel>
          )}
          {chainKey !== 'xprnetwork-test' && (
            <Tab.Panel>
              <div className="flex-1">
                <h3 className="headline-3 mb-4">XPR Markets</h3>
                {marketasset.map((item, index) => {
                  return (
                    <a
                      key={item[0]}
                      href={item[1]}
                      target="_blank"
                      className="font-bold underline"
                      rel="noreferrer"
                    >
                      <div className="flex justify-start gap-4 py-3 body-2 text-white border-b border-neutral-700">
                        <Storefront size={24} />
                        <span className="font-bold">{item[0]}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </Tab.Panel>
          )}
        </Tab.Panels>
      </Tab.Group>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const chainKey = params.chainKey as string;
  const assetId = params.assetId as string;

  try {
    const { data: asset } = await getAssetService(chainKey, { assetId });

    return {
      props: {
        asset: asset.data,
        chainKey,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default withUAL(Asset);
