import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Tab } from '@headlessui/react';
import { withUAL } from 'ual-reactjs-renderer';
import { GetServerSideProps } from 'next';
import { getTableRowusersinfo } from '@services/account/getTableRowusersinfo';
import { getAccount } from '@services/account/getAccount';
import { getTableRowProtonLink } from '@services/account/getTableRowProtonLink';
import { getTableRowStorefront } from '@services/account/getTableRowStorefront';
import { OwnerAssetsSalesList } from '@components/owner/OwnerAssetsSalesList';
import { Editstorefront } from '@components/owner/edit';
import { OwnerStats } from '@components/owner/OwnerStats';
import { ownerTabs } from '@utils/ownerTabs';
import { Header } from '@components/Header';

import { appName } from '@configs/globalsConfig';
interface CollectionPageProps {
  ual: any;
  chainKey: string;
  collectionName: string;
  owner: string;
  usersinfo: any;
  getAccountuser: any;
  protonLink: any;
  storefrontInfo: any;
}

function Owner({
  ual,
  chainKey,
  owner,
  usersinfo,
  getAccountuser,
  protonLink,
  storefrontInfo,
}: CollectionPageProps) {
  const router = useRouter();
  const selectedTabIndex = ownerTabs.findIndex(
    (tab) => tab.key == router.query.tab
  );

  const tabsRef = useRef(null);
  const [isAddBackground, setIsAddBackground] = useState(false);

  useEffect(() => {
    const tabsElement = tabsRef.current;

    window.addEventListener('scroll', () => {
      const { top } = tabsElement.getBoundingClientRect();
      setIsAddBackground(top <= 88);
    });
  }, []);

  function handleSelectedTabIndex(tabIndex: number) {
    router.push(
      `/${chainKey}/owner/${owner}?tab=${ownerTabs[tabIndex].key}`,
      undefined,
      { shallow: true }
    );
  }

  //console.log('usersinfo infos:', usersinfo);
  //console.log('getAccountuser infos:', getAccountuser);
  //console.log('protonLink infos:', protonLink);
  //console.log('storefrontInfo infos:', storefrontInfo);
  //console.log('ual infos:', ual);


  let storefront;
  if (storefrontInfo && storefrontInfo[0]) {
    storefront = storefrontInfo[0].values.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }

  //console.log('storefront infos:', storefront);

  const website = storefront && storefront.website ? storefront.website : (protonLink && protonLink[0]) ? `https://proton.link/${owner}` : null;
  const ownerimp = 'data:image/jpeg;base64,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'

  return (
    <>
      <Head>
        <title>{`${owner} - ${appName}`}</title>
      </Head>

      <Header.Root
        breadcrumb={[
          ['Explorer', `/${chainKey}/explorer`],
          [owner],
        ]}
      >
        {
          usersinfo && usersinfo.length > 0 ?
            <Header.Content
              title={`${storefront && storefront.title ? storefront.title : usersinfo[0].name}`}
              subtitle={`${usersinfo[0].acc.toLowerCase() === usersinfo[0].name.toLowerCase() ? '' : usersinfo[0].acc} - Storefront`}
            >
              {usersinfo[0].kyc && usersinfo[0].kyc.length > 0 ? (
                <p className="mt-2 text-sm text-yellow-500 font-bold hover:text-yellow-600">
                  KYC on {new Date(usersinfo[0].kyc[0].kyc_date * 1000).toLocaleDateString()}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-4 mt-4">
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    Website
                  </a>
                )}
              </div>
            </Header.Content>
            :
            <Header.Content title={owner} subtitle="Storefront">
              <div className="flex flex-wrap gap-4 mt-4">
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    Website
                  </a>
                )}
              </div>
            </Header.Content>
        }
        {
          usersinfo && usersinfo.length > 0 && usersinfo[0].avatar ?
            <Header.Banner base64Data={`data:image/jpeg;base64,${usersinfo[0].avatar}`} />
            :
            <Header.Banner base64Data={ownerimp} /> // some default image or behavior
        }
      </Header.Root>

      <Tab.Group
        selectedIndex={selectedTabIndex}
        defaultIndex={0}
        onChange={handleSelectedTabIndex}
      >
        <Tab.List
          ref={tabsRef}
          className={`tab-list sticky top-[5.5rem] z-20 duration-75 ${isAddBackground ? 'bg-neutral-900' : ''
            }`}
        >
          <Tab className="tab">{ownerTabs[0].name}</Tab>
          <Tab className="tab">{ownerTabs[1].name}</Tab>
          {owner === (ual?.activeUser?.accountName || '') && <Tab className="tab">{ownerTabs[2].name}</Tab>}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <OwnerStats
              usersinfo={usersinfo[0]}
              account={getAccountuser}
              protonLink={(protonLink && protonLink[0]) ? protonLink[0].values : []}
              storefront={(storefront) ? storefront : []}
            />
          </Tab.Panel>
          <Tab.Panel>
            <OwnerAssetsSalesList
              ual={ual}
              chainKey={chainKey}
              owner={owner}
              storefront={(storefront) ? storefront : []}
            />
          </Tab.Panel>
          {owner === (ual?.activeUser?.accountName || '') &&
            <Tab.Panel>
              <Editstorefront
                ual={ual}
                chainKey={chainKey}
                owner={owner}
                storefront={(storefront) ? storefront : []}
              />
            </Tab.Panel>
          }
        </Tab.Panels>
      </Tab.Group>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const chainKey = context.params.chainKey as string;
  const ownerName = context.params.ownerName as string;

  try {
    const [
      { rows: usersinfo },
      getAccountuser,
      { rows: protonLink },
      { rows: storefrontInfo },
    ] = await Promise.all([
      getTableRowusersinfo(chainKey, { accountName: ownerName }),
      getAccount(chainKey, { accountName: ownerName }),
      getTableRowProtonLink(chainKey, { accountName: ownerName }),
      getTableRowStorefront(chainKey, { accountName: ownerName }),
    ]);

    return {
      props: {
        chainKey,
        owner: ownerName,
        usersinfo: usersinfo,
        getAccountuser: getAccountuser,
        protonLink: protonLink,
        storefrontInfo: storefrontInfo,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default withUAL(Owner);
