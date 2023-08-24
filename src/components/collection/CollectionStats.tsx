import { collectionTabs } from '@utils/collectionTabs';
import { useUnlockBotKeyOwnership } from "@utils/checkUnlockKeyOwnership";
import { useBotKeyOwnership } from "@utils/checkBotKeyOwnership";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
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
} from 'phosphor-react';
import { CollectionProps } from '@services/collection/getCollectionService';
import { chainKeyDefault } from '@configs/globalsConfig';

import Slider from "react-slick";

interface CollectionStatsProps {
  stats: {
    assets: number;
    burned: number;
    burned_by_template: {
      burned: number;
      template_id: number;
    }[];
    burned_by_schema: {
      burned: number;
      schema_name: string;
    }[];
    templates: number;
    schemas: number;
  };
  collection: CollectionProps;
  socials: any;
}

export function CollectionStats({ stats, collection, socials }: CollectionStatsProps) {
  const router = useRouter();
  const chainKey = router.query.chainKey ?? chainKeyDefault;
  const [isBotOwner, setBotOwner] = useState(false);
  const [isUnlockOwner, setIsUnlockOwner] = useState(false);
  const { authorized: unlockKeyAuthorized, loading: unlockKeyLoading } = useUnlockBotKeyOwnership(collection.author, collection.collection_name, chainKey);
  const { authorized: botKeyAuthorized, loading: botKeyLoading } = useBotKeyOwnership(collection.author, collection.collection_name, chainKey);
  const unlocked = isBotOwner ? 'Unlocked' : 'Locked';
  const fullunlocked = isUnlockOwner ? 'Unlocked' : 'Locked';


  useEffect(() => {
    setIsUnlockOwner(unlockKeyAuthorized);
  }, [unlockKeyAuthorized]);

  useEffect(() => {
    setBotOwner(botKeyAuthorized);
  }, [botKeyAuthorized]);

  const features = [['AbstraktsNotifBot Unlocked', unlocked],
  ['Full Feature Unlocked', fullunlocked],
  ];


  const statsContent = [
    ['Name', collection.collection_name],
    ['Created', new Date(Number(collection.created_at_time)).toLocaleString()],
    ['Assets', stats.assets ?? 0],
    ['Burned', stats.burned ?? 0],
    ['Templates', stats.templates],
    ['Schemas', stats.schemas],
    ['Fee', `${(collection.market_fee * 100).toFixed(2)}%`],
  ];

  const market = [
    ['Soon.Market', `https://soon.market/collections/${collection.collection_name}`],
    ['ProtonMint', `https://protonmint.com/${collection.collection_name}`],
    ['Proton Market', `https://www.protonmarket.com/${collection.collection_name}`],
  ];

  const hasSocials =
    socials &&
    socials.filter((item) => item.platform !== 'website' && item.url !== '').length > 0;

  //console.log(collection.data.url);
  //console.log('socials:', socials);
  //console.log('hasSocials:', hasSocials);

  function handleSocialIcon(social) {
    switch (social) {
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
      case 'linkedIn':
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
      case 'ProtonMint':
        return <Storefront size={24} />;
        break;
      case 'snipcoins':
        return <Storefront size={24} />;
        break;
      case 'Proton Market':
        return <Storefront size={24} />;
        break;

      default:
        break;
    }
  }

  const socialsArray = hasSocials ? socials.filter((item) => item.platform !== "website") : [];

  const [posts, setPosts] = useState([]);


  const [medium, setMedium] = useState(hasSocials ? socials.filter((item) => item.platform == "medium").map((item) => item.url) : []);

  useEffect(() => {
    let mediumUrl = medium[0];

    if (mediumUrl) {
      if (!mediumUrl.startsWith("http://") && !mediumUrl.startsWith("https://")) {
        mediumUrl = "https://" + mediumUrl;
      }

      const url = new URL(mediumUrl);
      const mediumHandle = url.pathname.split('@')[1];

      const rssUrl = mediumHandle ? `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@${mediumHandle}` : '';

      if (rssUrl) {
        fetch(rssUrl)
          .then((res) => res.json())
          .then((data) => {
            setPosts(data.items);
          });
      }
    }
  }, [medium]);


  function toText(node) {
    let tag = document.createElement("div");
    tag.innerHTML = node;
    node = tag.innerText;
    return node;
  }

  function shortenText(text, startingPoint, maxLength) {
    return text.length > maxLength
      ? text.slice(startingPoint, maxLength)
      : text;
  }

  //console.log(posts);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 821,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 640,
        settings: {
          initialSlide: 0,
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  };

  return (
    <section className="container">
      <div className="flex flex-col py-8 gap-12">
        <h2 className="headline-2">{collectionTabs[0].name}</h2>

        <div className="flex flex-col md:flex-row gap-24">
          <div className="flex-1">
            <h3 className="headline-3 mb-4">Description</h3>
            <p className="body-1">{collection.data.description}</p>
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
        
        <div className="flex flex-col md:flex-row gap-24">
        <div className="flex-1">
            <h3 className="headline-3 mb-4">Authorized accounts</h3>
            <div className="flex flex-row gap-2 flex-wrap">
              {collection.authorized_accounts.map((item, index) => (
                <span key={item} className="body-1">
                  {item}
                  {index !== collection.authorized_accounts.length - 1
                    ? ','
                    : '.'}
                </span>
              ))}
            </div>
          </div>
          </div>

        <div className="flex flex-col md:flex-row gap-24">

          {hasSocials && (
            <div className="flex-1">
              <h3 className="headline-3 mb-4">Social medias</h3>
              {socials.map((item, index) => {
                if (item && item.platform !== "website") {
                  return (
                    <a
                      key={item.platform}
                      href={item.url}
                      target="_blank"
                      className="font-bold underline"
                      rel="noreferrer"
                    >
                      <div className="flex justify-start gap-4 py-3 body-2 text-white border-b border-neutral-700">
                        {handleSocialIcon(item.platform)}
                        <span className="font-bold">{item.url}</span>
                      </div>
                    </a>
                  );
                }
              })}
            </div>
          )}


        </div>

        {chainKey !== 'xprnetwork-test' && (
          <div className="flex-1">
            <h3 className="headline-3 mb-4">XPR Markets</h3>
            {market.map((item, index) => {
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
        )}

        {posts && posts.length > 0 ? <h3 className="headline-3">Medium Posts</h3> : null}
        <div className="pl-4 pr-4">
          <Slider {...settings}>
            {posts.map((item) => (
              <div key={item.title}>
                <a href={item.link}>
                  <img
                    src={item.thumbnail.startsWith('https://medium.com/') ? '/medium.png' : item.thumbnail}
                    alt={item.title}
                    className="max-w-full"
                  />
                  <div className="p-2">
                    <div className="blog_preview">
                      <h2 className="mt-0 text-lg">
                        {shortenText(item.title, 0, 30) + "..."}
                      </h2>
                      <p className="leading-relaxed">
                        {"..." + shortenText(toText(item.content), 60, 300) + "..."}
                      </p>
                    </div>
                    <hr />
                    <div className="font-light">
                      <span className="text-sm mr-2">{item.author}</span>
                      <span className="text-xs">
                        {shortenText(item.pubDate, 0, 10)}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
