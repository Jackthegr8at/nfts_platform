import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CircleNotch, MagnifyingGlass } from 'phosphor-react';
import { withUAL } from 'ual-reactjs-renderer';
import { Disclosure } from '@headlessui/react';

import { useForm } from 'react-hook-form';

import { Card } from '@components/Card';
import { Input } from '@components/Input';
import { Textarea } from '@components/Textarea';
import { Modal } from '@components/Modal';
import { Select } from '@components/Select';
import { Loading } from '@components/Loading';
import { CardContainer } from '@components/CardContainer';
import { SeeMoreButton } from '@components/SeeMoreButton';

import chainsConfig from '@configs/chainsConfig';
import { ipfsEndpoint, ipfsGateway, chainKeyDefault, appName } from '@configs/globalsConfig';

import { editStorefrontService } from '@services/Tools/editStorefrontService';
import {
  getInventoryService,
  AssetProps,
} from '@services/inventory/getInventoryService';
import { getAccountStatsService } from '@services/account/getAccountStatsService';


interface editStorefrontProps {
  ual: any;
  chainKey: string;
  owner: string;
  storefront: any;
}

interface ModalProps {
  title: string;
  message?: string;
  details?: string;
  isError?: boolean;
}

export function Editstorefront({
  owner,
  ual,
  storefront,
}: editStorefrontProps) {
  const router = useRouter();
  const modalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: storefront.title || '',
      description: storefront.description || '',
      website: storefront.website || '',
      collection1: storefront.collection1 || '',
      collection2: storefront.collection2 || '',
      collection3: storefront.collection3 || '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<AssetProps[]>([]);
  const [ownedCollections, setOwnedCollections] = useState([]);
  const [collectionsFilterOptions, setCollectionsFilterOptions] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [match, setMatch] = useState('');
  const [waitToSearch, setWaitToSearch] = useState(null);
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
          limit: 1,
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



  async function onSubmit(formValues) {
    setIsLoading(true);

    // map selectedAssets to an array of collection names
    let selectedCollections = selectedAssets.map(item => item.collection.collection_name);

    //console.log('info selectedCollections:', selectedCollections);

    try {
      // if collections are selected, update formValues
      if (selectedCollections.length > 0) {
        formValues.collection1 = selectedCollections[0] || null; // set to null if not selected
        formValues.collection2 = selectedCollections[1] || null; // set to null if not selected
        formValues.collection3 = selectedCollections[2] || null; // set to null if not selected
      }

      // Construct data
      const updateData = {
        values: Object.entries(formValues)
          .filter(([key, value]) => value) // only include keys where value is not empty
          .map(([key, value]) => ({ key, value })), // map to your desired format
      };

      // predefined set of keys
      const allKeys = ["collection1", "collection2", "collection3", "title", "description", "website"];

      // Get keys from formValues with non-empty values
      const formKeys = Object.entries(formValues)
        .filter(([key, value]) => value)
        .map(([key, value]) => key);

      // Filter allKeys to get keys not in formKeys
      const removeKeys = allKeys.filter(key => !formKeys.includes(key));
      //console.log('info formKeys:', formKeys);
      //console.log('info removeKeys:', removeKeys);
      //console.log('info updateData:', updateData);

      let updatevaluesAction = null;
      if (updateData.values.length > 0) {
        updatevaluesAction = {
          account: 'storefront',
          name: 'updatevalues',
          authorization: [
            {
              actor: ual.activeUser.accountName,
              permission: ual.activeUser.requestPermission,
            },
          ],
          data: {
            actor: ual.activeUser.accountName,
            values: updateData.values,
          },
        };
      }

      let removekeysAction = null;
      if (removeKeys.length > 0) {
        removekeysAction = {
          account: 'storefront',
          name: 'removekeys',
          authorization: [
            {
              actor: ual.activeUser.accountName,
              permission: ual.activeUser.requestPermission,
            },
          ],
          data: {
            actor: ual.activeUser.accountName,
            keys: removeKeys,
          },
        };
      }

      //console.log(updatevaluesAction);
      //console.log(removekeysAction);

      await editStorefrontService({
        activeUser: ual.activeUser,
        actions: [updatevaluesAction, removekeysAction].filter(action => action !== null),
      });


      setIsSaved(true);

      modalRef.current?.openModal();
      const title = 'Storefront edited';
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
        'Unable to edit the storefront';

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
        <main className="container">
          <h2 className="headline-2 mt-4 md:mt-8">
            Edit your Storefront
          </h2>
          <ol className="list-decimal pl-6 body-1 text-neutral-200 mt-2">
            <li>Select the NFTs (1 by collection) you would like to include in your storefront by clicking on their pictures to the right. The NFT's collection will then be featured.</li>
            <li>In the provided input fields, enter the following:
              <ul>
                <li>Title: The name or title of your storefront.</li>
                <li>Description: A brief description of your storefront.</li>
                <li>Website: Your website link, if any.</li>
                <li>Collection 1, 2, 3: Optionally, enter the collection ID (exemple 125554242425) of the NFT collections that you would like to feature in your storefront. (Selected NFTs will automatically populate these fields during the transaction).</li>
              </ul>
            </li>
            <li>Once you've entered all your details, click the "edit Storefront" button to update your storefront. Please note that if your storefront has previously set values and you want to remove them, simply delete the input and leave the field empty before submitting. The system will remove any keys that have been left empty.</li>
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
              <Input
                {...register('title')}
                error={errors.title?.message}
                type="text"
                label="Title"
              />
              <Textarea
                {...register('description')}
                error={errors.description?.message}
                label="Description"
              />
              <Input
                {...register('website')}
                error={errors.website?.message}
                type="text"
                label="Website"
              />
              <Input
                {...register('collection1')}
                error={errors.collection1?.message}
                type="text"
                label="Collection 1"
              />
              <Input
                {...register('collection2')}
                error={errors.collection2?.message}
                type="text"
                label="Collection 2"
              />
              <Input
                {...register('collection3')}
                error={errors.collection3?.message}
                type="text"
                label="Collection 3"
              />
              {selectedAssets.length > 0 ? (
                <div className="flex flex-col gap-8">
                  <h3 className="headline-3">Selected collections</h3>
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
                              ? `${ipfsGateway}/${asset.data['video']}`
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
                  <h4 className="title-1">Select one NFT from each collection, or manually enter collection Ids in the provided fields.</h4>
                </div>
              )}
              {isLoading ? (
                <span className="flex gap-2 items-center p-4 body-2 font-bold text-white">
                  <CircleNotch
                    size={24}
                    weight="bold"
                    className="animate-spin"
                  />
                  Loading...
                </span>
              ) : (
                <button
                  type="submit"
                  className={`btn w-fit whitespace-nowrap ${isSaved && 'animate-pulse bg-emerald-600'
                    }`}
                >
                  {isSaved ? 'Saved' : 'Edit Storefront'}
                </button>
              )}
            </form>
            <div className="flex flex-col md:w-1/2 w-full">
              <div className="flex flex-col gap-8">
                <h3 className="headline-3">Select one NFT by collection</h3>

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
                        return (
                          <div
                            key={index}
                            className="w-full flex flex-col gap-4"
                          >
                            <div
                              className={`cursor-pointer ${selectedAssets.includes(asset) &&
                                'border-4 rounded-xl'
                                }`}
                            >
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
                        <h4 className="title-1">NFT not found</h4>
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
        <title>{`Transfer - ${appName}`}</title>
      </Head>

      {!ual?.activeUser && (
        <div className="mx-auto my-14 text-center">
          <h2 className="headline-2">Connect your wallet</h2>
          <p className="body-1 mt-2 mb-6">
            You need to connect your wallet to edit your Storefront
          </p>
          <button type="button" className="btn" onClick={handleLogin}>
            Connect Wallet
          </button>
        </div>
      )}
    </>
  );
}
