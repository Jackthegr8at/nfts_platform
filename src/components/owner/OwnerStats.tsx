import { collectionTabs } from '@utils/collectionTabs';
import {
  TwitterLogo,
  MediumLogo,
  FacebookLogo,
  GithubLogo,
  DiscordLogo,
  YoutubeLogo,
  TelegramLogo,
  InstagramLogo,
  LinkedinLogo,
  TiktokLogo,
  ChatCircleText,
  Storefront,
  RedditLogo,
} from 'phosphor-react';

interface UserInfo {
  acc: string;
  name: string;
  avatar: string;
  verified: number;
  date: number;
  verifiedon: number;
  verifier: string;
  raccs: [];
  aacts: [];
  ac: [];
  kyc: [
    {
      kyc_provider: string;
      kyc_level: string;
      kyc_date: number;
    }
  ];
}


interface AccountInfo {
  account_name: string;
  head_block_num: number;
  head_block_time: string;
  privileged: boolean;
  last_code_update: string;
  created: string;
  ram_quota: number;
  net_weight: number;
  cpu_weight: number;
  net_limit: any;
  cpu_limit: any;
  ram_usage: number;
  permissions: any;
  total_resources: any;
  self_delegated_bandwidth: any;
  refund_request: any;
  voter_info: any;
  rex_info: any;
  subjective_cpu_bill_limit: any;
  eosio_any_linked_actions: any[];
}

interface SocialLink {
  key: string;
  value: string;
}

interface OwnerStatsProps {
  usersinfo: UserInfo;
  account: AccountInfo;
  protonLink: SocialLink[];
  storefront: any;
}



export function OwnerStats({ usersinfo, account, protonLink, storefront }: OwnerStatsProps) {
  if (!usersinfo) return null;

  //console.log('protonLink infos from ownerStats:', protonLink);

  function handleSocialIcon(protonLink) {
    switch (protonLink) {
      case 'twitter':
        return <TwitterLogo size={24} />;
        break;
      case 'facebook':
        return <FacebookLogo size={24} />;
        break;
      case 'medium':
        return <MediumLogo size={24} />;
        break;
      case 'github':
        return <GithubLogo size={24} />;
        break;
      case 'discord':
        return <DiscordLogo size={24} />;
        break;
      case 'youtube':
        return <YoutubeLogo size={24} />;
        break;
      case 'telegram':
        return <TelegramLogo size={24} />;
        break;
      case 'instagram':
        return <InstagramLogo size={24} />;
        break;
      case 'discord':
        return <DiscordLogo size={24} />;
        break;
      case 'linkedin':
        return <LinkedinLogo size={24} />;
        break;
      case 'tikTok':
        return <TiktokLogo size={24} />;
        break;
      case 'snipcoins':
        return <ChatCircleText size={24} />;
        break;
      case 'Digital-Galaxy':
        return <Storefront size={24} />;
        break;
      case 'protonmint':
        return <Storefront size={24} />;
        break;
      case 'snip':
        return <Storefront size={24} />;
        break;
      case 'protonmarket':
        return <Storefront size={24} />;
        break;
      case 'soonmarket':
        return <Storefront size={24} />;
        break;
      case 'reddit':
        return <RedditLogo size={24} />;
        break;

      default:
        break;
    }
  }

  const hasSocials =
    protonLink && protonLink.filter((item) => item.key !== 'intro' && item.value !== '').length > 0;


  const producers = account.voter_info ? account.voter_info.producers : [];
  const firstHalf = producers.slice(0, Math.ceil(producers.length / 2));
  const secondHalf = producers.slice(Math.ceil(producers.length / 2), producers.length);

  const statsContent = [
    ['Name', usersinfo.name],
    ['Wallet', usersinfo.acc],
    ['Created', new Date(account.created).toLocaleString()],
    ['KYC', usersinfo.kyc && usersinfo.kyc.length > 0 ? new Date(usersinfo.kyc[0].kyc_date * 1000).toLocaleString() : 'No KYC'],
    ['Producers', firstHalf.join(', ')],
    ['', secondHalf.join(', ')], // Empty label for the second half
  ];

  return (
    <section className="container">
      <div className="flex flex-col py-8 gap-12">
        <h2 className="headline-2">{collectionTabs[0].name}</h2>
        <div className="flex flex-col md:flex-row gap-24">
          <div className="flex-1">
            <h3 className="headline-3 mb-4">Welcome to the Storefront!</h3>
            <p className="body-1">
              {`${storefront && storefront.description ? storefront.description : "This is your gateway to an array of fascinating and unique items, all held by this account. Our 'Buy Now' tab showcases every item currently available for sale. So why wait? Take a step into this digital marketplace and discover something extraordinary today!"}`}
            </p>
          </div>
          <div className="flex-1">
            <h3 className="headline-3 mb-4">Stats</h3>
            {statsContent.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between py-3 body-2 text-white border-b border-neutral-700"
              >
                <span>{label}</span>
                <span className="font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
        {hasSocials && (
          <div className="flex flex-col md:flex-row gap-24">
            <div className="flex-1">
              <h3 className="headline-3 mb-4">Social medias</h3>
              {protonLink.map((item, index) => {
                if (item && item.key !== "intro" && item.key !== "order" && item.key !== "rpm") {
                  return (
                    <a
                      key={item.key}
                      href={item.value}
                      target="_blank"
                      className="font-bold underline"
                      rel="noreferrer"
                    >
                      <div className="flex justify-start gap-4 py-3 body-2 text-white border-b border-neutral-700">
                        {handleSocialIcon(item.key)}
                        <span className="font-bold">{item.value}</span>
                      </div>
                    </a>
                  );
                }
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
