import { useState, useEffect, FormEvent, useRef } from 'react';
import { UploadSimple, CircleNotch } from 'phosphor-react';
import { withUAL } from 'ual-reactjs-renderer';
import { GetServerSideProps } from 'next';
import { Tab, Disclosure } from '@headlessui/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { ipfsEndpoint, appName } from '@configs/globalsConfig';

import { editCollectionService } from '@services/collection/editCollectionService';
import { uploadImageToIpfsService } from '@services/collection/uploadImageToIpfsService';
import {
  getCollectionService,
  CollectionProps,
} from '@services/collection/getCollectionService';

import { Table } from '@components/Table';
import { Input } from '@components/Input';
import { Textarea } from '@components/Textarea';
import { Header } from '@components/Header';
import { Select } from '@components/Select';
import { Modal } from '@components/Modal';

const informationValidations = yup.object().shape({
  displayName: yup.string().required().label('Display name'),
  description: yup.string(),
});

const marketFeeValidations = yup.object().shape({
  marketFee: yup
    .number()
    .typeError('Must be between 0% and 15%. Only numbers.')
    .min(0, 'Must be between 0% and 15%.')
    .max(15, 'Must be between 0% and 15%.')
    .label('Market fee'),
});

const authorizationValidations = yup.object().shape({
  account: yup.string().eosName(),
});

const notificationValidations = yup.object().shape({
  account: yup.string().eosName(),
});

interface InformationProps {
  image: File;
}

interface InformationOnlyProps {
  displayName: string;
  website: string;
  description: string;
  socials: SocialProps;
}

interface SocialProps {
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  instagram?: string;
  youtube?: string;
  tikTok?: string;
  snipcoins?: string;
  linkedIn?: string;
  medium?: string;
}

interface EditCollectionProps {
  ual: any;
  initialCollection: CollectionProps;
  chainKey: string;
}

interface AccountProps {
  account: string;
}

interface MarketFeeProps {
  marketFee: number;
}

interface ModalProps {
  title: string;
  message?: string;
  details?: string;
  isError?: boolean;
}

function EditCollection({
  ual,
  initialCollection,
  chainKey,
}: EditCollectionProps) {
  const router = useRouter();
  const modalRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [collection, setCollection] = useState(initialCollection);
  const [modal, setModal] = useState<ModalProps>({
    title: '',
    message: '',
    details: '',
    isError: false,
  });

  const socials = collection.data.url && collection.data.url.includes('\n') ? collection.data.url.split('\n').map((line) => {
    if (line.includes('https:') || line.includes('www.')) {
      const colonIndex = line.indexOf(':', line.indexOf('https:') > -1 ? 6 : 5);
      const platform = line.substring(0, colonIndex);
      let url = line.substring(colonIndex + 1);
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      return { platform, url };
    }
    return null;
  }).filter((item) => item !== null) : [];

  //console.log('socials:', socials);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(informationValidations),
  });

  const {
    register: registerMarketFee,
    formState: { errors: marketFeeErrors },
    handleSubmit: handleSubmitMarketFee,
  } = useForm({
    resolver: yupResolver(marketFeeValidations),
  });

  const {
    register: registerAuthorization,
    formState: { errors: authorizationErrors },
    handleSubmit: handleSubmitAuthorization,
  } = useForm({
    resolver: yupResolver(authorizationValidations),
  });

  const {
    register: registerNotification,
    formState: { errors: notificationErrors },
    handleSubmit: handleSubmitNotifications,
  } = useForm({
    resolver: yupResolver(notificationValidations),
  });

  const image = watch('image');
  //console.log(image);
  //console.log(collection.img);

  useEffect(() => {
    if (typeof image !== 'string' && image && image.length > 0) {
      handleImageSource(image[0]);
    }
  }, [image]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaved(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isSaved]);

  const handleImageSource = (img) => {
    if (img) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setImageSrc(fileReader.result);
      };
      fileReader.readAsDataURL(img);
    }
  };

  if (!ual?.activeUser || ual?.activeUser?.accountName !== collection?.author) {
    return (
      <>
        {collection ? (
          <div className="container mx-auto px-8 py-24 text-center">
            <h4 className="headline-3">
              You don't have authorization to edit this collection.
            </h4>
          </div>
        ) : (
          <div className="container mx-auto flex justify-center py-32">
            <span className="flex gap-2 items-center p-4 body-2 font-bold text-white">
              <CircleNotch size={24} weight="bold" className="animate-spin" />
              Loading...
            </span>
          </div>
        )}
      </>
    );
  }


  async function onSubmitPicture({
    image,
  }: InformationProps) {
    setIsLoading(true);

    try {
      const ipfsData = await uploadImageToIpfsService(image[0]);
      //console.log('ipfsData:', ipfsData);
      const imgHash = ipfsData['IpfsHash'];
      //console.log('imgHash:', imgHash);

      const editedInformation = await editCollectionService({
        action: 'setcoldata',
        activeUser: ual.activeUser,
        data: {
          collection_name: collection.collection_name,
          data: [
            {
              key: 'description',
              value: ['string', collection.data.description],
            },
            {
              key: 'name',
              value: ['string', collection.data.name],
            },
            {
              key: 'img',
              value: ['string', imgHash],
            },
            {
              key: 'url',
              value: ['string', collection.data.url],
            },
          ],
        },
      });

      setIsSaved(true);

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to edit collection, make sure you added a new image';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }


  async function onSubmitInformation({
    displayName,
    website,
    description,
    telegram,
    twitter,
    instagram,
    discord,
    youtube,
    linkedIn,
    tikTok,
    snipcoins,
    medium,
  }: InformationOnlyProps & SocialProps) {
    setIsLoading(true);

    try {
      const socialLinks = [
        { name: 'website', link: website },
        { name: 'twitter', link: twitter },
        { name: 'telegram', link: telegram },
        { name: 'instagram', link: instagram },
        { name: 'youtube', link: youtube },
        { name: 'discord', link: discord },
        { name: 'linkedIn', link: linkedIn },
        { name: 'tikTok', link: tikTok },
        { name: 'snipcoins', link: snipcoins },
        { name: 'medium', link: medium },
      ];

      const socials = socialLinks
        .map((link) => {
          const trimmedLink = link.link ? link.link.trim().replace(/\/+$/, '') : '';
          return `${link.name}:${trimmedLink}`;
        })
        .join('\n');

      const editedInformation = await editCollectionService({
        action: 'setcoldata',
        activeUser: ual.activeUser,
        data: {
          collection_name: collection.collection_name,
          data: [
            {
              key: 'description',
              value: ['string', description],
            },
            {
              key: 'name',
              value: ['string', displayName],
            },
            {
              key: 'img',
              value: ['string', collection.img],
            },
            {
              key: 'url',
              value: ['string', `${socials}\n`],
            },
          ],
        },
      });

      setIsSaved(true);

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to edit collection';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }

  async function onSubmitMarketFee({ marketFee }: MarketFeeProps) {
    setIsLoading(true);

    try {
      await editCollectionService({
        action: 'setmarketfee',
        activeUser: ual.activeUser,
        data: {
          collection_name: collection.collection_name,
          market_fee: marketFee / 100.0,
        },
      });

      setIsSaved(true);

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to edit collection market fee';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }

  async function onSubmitAddAccountAuthorization({ account }: AccountProps) {
    setIsLoading(true);

    try {
      await editCollectionService({
        action: 'addcolauth',
        activeUser: ual.activeUser,
        data: {
          collection_name: collection.collection_name,
          account_to_add: account,
        },
      });

      setIsSaved(true);

      setCollection((state) => {
        state.authorized_accounts = [...state.authorized_accounts, account];
        return { ...state };
      });

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to add account to authorization list';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }

  async function onSubmitRemoveAccountAuthorization(account: string) {
    setIsLoading(true);

    try {
      await editCollectionService({
        action: 'remcolauth',
        activeUser: ual.activeUser,
        data: {
          collection_name: collection.collection_name,
          account_to_remove: account,
        },
      });

      setIsSaved(true);

      setCollection((state) => {
        const accountIndex = state.authorized_accounts.findIndex(
          (item) => item === account
        );
        state.authorized_accounts.splice(accountIndex, 1);
        return { ...state };
      });

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to remove account from authorization list';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }

  async function onSubmitNotificationAccount({ account }: AccountProps) {
    setIsLoading(true);

    try {
      await editCollectionService({
        action: 'addnotifyacc',
        activeUser: ual.activeUser,
        data: {
          collection_name: collection.collection_name,
          account_to_add: account,
        },
      });

      setIsSaved(true);

      setCollection((state) => {
        state.notify_accounts = [...state.notify_accounts, account];
        return { ...state };
      });

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to add account to notification list';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }

  async function onSubmitRemoveNotificationAccount(account: string) {
    setIsLoading(true);

    try {
      await editCollectionService({
        action: 'remnotifyacc',
        activeUser: ual.activeUser,
        data: {
          collection_name: collection.collection_name,
          account_to_remove: account,
        },
      });

      setIsSaved(true);

      setCollection((state) => {
        const accountIndex = state.notify_accounts.findIndex(
          (item) => item === account
        );
        delete state.notify_accounts[accountIndex];
        return { ...state };
      });

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to remove account from notification list';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }

  async function onSubmitNotify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await editCollectionService({
        action: 'forbidnotify',
        activeUser: ual.activeUser,
        data: {
          collection_name: collection.collection_name,
        },
      });

      setIsSaved(true);

      modalRef.current?.openModal();
      const title = 'Notifications were forbidden';
      const message = 'Please wait while we reload the page.';

      setModal({
        title,
        message,
      });

      setTimeout(() => {
        router.reload();
        setIsSaved(false);
      }, 3000);
    } catch (e) {
      modalRef.current?.openModal();
      const jsonError = JSON.parse(JSON.stringify(e));
      const details = JSON.stringify(e, undefined, 2);
      const message =
        jsonError?.cause?.json?.error?.details[0]?.message ??
        'Unable to forbid notifications';

      setModal({
        title: 'Error',
        message,
        details,
        isError: true,
      });
    }
    setIsLoading(false);
  }

  function handlePrependHttps(event) {
    const { value } = event.target;

    if (
      !value.startsWith('https://') &&
      event.nativeEvent.inputType !== 'deleteContentBackward'
    ) {
      return 'https://' + value;
    }

    return value;
  }

  if (collection) {
    return (
      <>
        <Head>
          <title>{`Update ${collection.collection_name} - ${appName}`}</title>
        </Head>
        <Header.Root
          breadcrumb={[
            ['My Collections', `/${chainKey}`],
            [
              collection.collection_name,
              `/${chainKey}/collection/${collection.collection_name}`,
            ],
            ['Update Collection'],
          ]}
        >
          <Header.Content title={collection.collection_name} />
        </Header.Root>

        <Modal ref={modalRef} title={modal.title}>
          <p className="body-2 mt-2">{modal.message}</p>
          {modal.details && (
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

        <Tab.Group>
          <Tab.List className="tab-list mb-4 md:mb-8">
            <Tab className="tab">Image</Tab>
            <Tab className="tab">Information</Tab>
            <Tab className="tab">Market Fee</Tab>
            <Tab className="tab">Authorization</Tab>
            <Tab className="tab">Notifications</Tab>
            <Tab className="tab">Advanced</Tab>
          </Tab.List>
          <Tab.Panels className="container">


            <Tab.Panel>
              <form
                onSubmit={handleSubmit(onSubmitPicture)}
                className="flex md:flex-row flex-col gap-8 w-full md:items-start items-center"
              >
                <div className="flex flex-col">
                  <label
                    htmlFor="file"
                    className="w-80 h-80 flex flex-col justify-center items-center gap-md bg-neutral-800 rounded-xl overflow-hidden cursor-pointer p-4"
                  >
                    {imageSrc || collection.img ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={imageSrc ?? `${ipfsEndpoint}/${collection.img}`}
                          fill
                          className="object-contain"
                          alt=""
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center text-center p-4 gap-2">
                        <UploadSimple size={56} weight="bold" />
                        <p className="title-1">Add Collection Image</p>
                        <p className="body-3">
                          Transparent backgrounds are recommended
                        </p>
                      </div>
                    )}
                    <input
                      id="file"
                      {...register('image')}
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex flex-col w-full gap-8">

                  <div className="hidden">
                    <Input
                      {...register('displayName')}
                      error={errors.displayName?.message}
                      type="text"
                      defaultValue={collection.data.name}
                      label="Display Name"
                    />
                  </div>


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
                      className={`btn w-fit ${isSaved && 'animate-pulse bg-emerald-600'
                        }`}
                    >
                      {isSaved ? 'Saved' : 'Update image'}
                    </button>
                  )}
                </div>
              </form>
            </Tab.Panel>

            <Tab.Panel>
              <form
                onSubmit={handleSubmit(onSubmitInformation)}
                className="flex md:flex-row flex-col gap-8 w-full md:items-start items-center"
              >
                <div className="flex flex-col w-full gap-8">
                  <Input
                    type="text"
                    defaultValue={collection.collection_name}
                    label="Collection Name"
                    readOnly
                    disabled
                    hint="Collection name cannot be edited."
                  />
                  <Input
                    {...register('displayName')}
                    error={errors.displayName?.message}
                    type="text"
                    defaultValue={collection.data.name}
                    label="Display Name"
                  />
                  <Input
                    {...register('website')}
                    error={errors.website?.message}
                    type="text"
                    defaultValue={socials?.find((item) => item.platform === 'website')?.url ?? ''}
                    label="Website"
                  />
                  <Textarea
                    {...register('description')}
                    error={errors.description?.message}
                    defaultValue={collection.data.description}
                    label="Description"
                  />
                  <div className="flex flex-col gap-8 mt-4">
                    <div className="flex flex-row gap-2 items-baseline">
                      <span className="title-1">Social Media</span>
                      <span className="body-1">(optional)</span>
                    </div>
                    <Controller
                      control={control}
                      name="twitter"
                      defaultValue={socials?.find((item) => item.platform === 'twitter')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="Twitter"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://twitter.com/@handle"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="telegram"
                      defaultValue={socials?.find((item) => item.platform === 'telegram')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="Telegram"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://t.me/username"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="instagram"
                      defaultValue={socials?.find((item) => item.platform === 'instagram')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="Instagram"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://www.instagram.com/username"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="youtube"
                      defaultValue={socials?.find((item) => item.platform === 'youtube')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="Youtube"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://youtube.com/channel/channelurl"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="discord"
                      defaultValue={socials?.find((item) => item.platform === 'discord')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="Discord"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://discord.gg/invite/channel"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="linkedIn"
                      defaultValue={socials?.find((item) => item.platform === 'linkedIn')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="LinkedIn"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://www.linkedin.com/in/username"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="tikTok"
                      defaultValue={socials?.find((item) => item.platform === 'tikTok')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="tikTok"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://tikTok.com/@username"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="snipcoins"
                      defaultValue={socials?.find((item) => item.platform === 'snipcoins')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="Snipcoins"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://snipcoins.com/username"
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="medium"
                      defaultValue={socials?.find((item) => item.platform === 'medium')?.url ?? ''}
                      render={({ field }) => (
                        <Input
                          label="Medium"
                          value={field.value}
                          onChange={(event) => {
                            const value = handlePrependHttps(event);
                            field.onChange(value);
                          }}
                          type="text"
                          placeholder="https://medium.com/@username"
                        />
                      )}
                    />
                  </div>
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
                      className={`btn w-fit ${isSaved && 'animate-pulse bg-emerald-600'
                        }`}
                    >
                      {isSaved ? 'Saved' : 'Update collection'}
                    </button>
                  )}
                </div>
              </form>
            </Tab.Panel>

            <Tab.Panel>
              <form
                onSubmit={handleSubmitMarketFee(onSubmitMarketFee)}
                className="flex flex-col gap-8 w-full"
              >
                <Input
                  {...registerMarketFee('marketFee')}
                  error={marketFeeErrors.marketFee?.message}
                  type="number"
                  defaultValue={(collection.market_fee * 100.0).toFixed(2)}
                  label="Market fee"
                  hint="Must be between 0% and 15%."
                  min="0"
                  max="15"
                  step="0.1"
                />
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
                    className={`btn w-fit ${isSaved && 'animate-pulse bg-emerald-600'
                      }`}
                  >
                    {isSaved ? 'Saved' : 'Update Market Fee'}
                  </button>
                )}
              </form>
            </Tab.Panel>

            <Tab.Panel>
              <div className="flex flex-col gap-8 w-full md:items-start items-center">
                <div className="flex flex-col gap-2">
                  <span className="headline-3">Authorized Accounts</span>
                  <span className="body-2 text-gray-300">
                    only the accounts within this list will be able to create
                    and edit assets.
                  </span>
                </div>
                {collection.authorized_accounts.length > 0 ? (
                  <Table
                    list={collection.authorized_accounts}
                    exception={collection.author}
                    action={onSubmitRemoveAccountAuthorization}
                  />
                ) : (
                  <div className="bg-neutral-800 px-8 py-16 text-center rounded-xl w-full">
                    <h4 className="title-1">
                      There are no authorized accounts.
                    </h4>
                  </div>
                )}
                <form
                  onSubmit={handleSubmitAuthorization(
                    onSubmitAddAccountAuthorization
                  )}
                  className="flex md:flex-row gap-4 w-full md:items-start items-center"
                >
                  <div className="flex flex-col w-full gap-4 justify-center mb-8">
                    <Input
                      {...registerAuthorization('account')}
                      error={authorizationErrors.account?.message}
                      type="text"
                      label="Account name"
                      maxLength={13}
                    />
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
                        {isSaved ? 'Saved' : 'Add account'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              {collection.allow_notify ? (
                <div className="flex flex-col gap-8 w-full md:items-start items-center">
                  <span className="headline-3">Notified Accounts</span>
                  {collection.notify_accounts.length > 0 ? (
                    <Table
                      list={collection.notify_accounts}
                      action={onSubmitRemoveNotificationAccount}
                    />
                  ) : (
                    <div className="bg-neutral-800 px-8 py-16 text-center rounded-xl w-full">
                      <h4 className="title-1">
                        There is no accounts to notify.
                      </h4>
                    </div>
                  )}
                  <form
                    onSubmit={handleSubmitNotifications(
                      onSubmitNotificationAccount
                    )}
                    className="flex md:flex-row gap-4 w-full md:items-start items-center"
                  >
                    <div className="flex flex-col w-full gap-4 justify-center mb-8">
                      <Input
                        {...registerNotification('account')}
                        error={notificationErrors.account?.message}
                        type="text"
                        label="Account name"
                      />
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
                          {isSaved ? 'Saved' : 'Add account'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-neutral-800 px-8 py-24 text-center rounded-xl">
                  <h4 className="title-1">Notifications were forbidden.</h4>
                </div>
              )}
            </Tab.Panel>

            <Tab.Panel>
              {collection.allow_notify ? (
                <div className="flex flex-col gap-4 w-full md:items-start items-center">
                  <form
                    onSubmit={onSubmitNotify}
                    className="flex flex-col gap-8 w-full md:items-start items-center"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="headline-3 whitespace-nowrap">
                        Forbid Notify
                      </span>
                      <span className="body-2 text-gray-300">
                        Only possible if the "Notified Accounts" list is empty.
                        Notify is enabled by default.
                      </span>
                      <span className="body-2 text-gray-300">
                        Notifications are required by certain Dapps to work
                        properly. However, the same system could also be abused;
                        for example, to block transfers, against the user's
                        will.
                      </span>
                      <span className="body-2 text-amber-400">
                        This action can not be undone, please be sure you want
                        to forbid notify.
                      </span>
                    </div>
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
                        disabled={collection.notify_accounts.length > 0}
                      >
                        {isSaved ? 'Saved' : 'Forbid Notify'}
                      </button>
                    )}
                  </form>
                </div>
              ) : (
                <div className="bg-neutral-800 px-8 py-24 text-center rounded-xl">
                  <h4 className="title-1">Notifications were forbidden.</h4>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const chainKey = context.params.chainKey as string;
  const collectionName = context.params.collectionName as string;

  const { data: collection } = await getCollectionService(chainKey, {
    collectionName,
  });

  return {
    props: {
      initialCollection: collection.data,
      chainKey,
    },
  };
};

export default withUAL(EditCollection);
