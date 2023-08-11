import Image from 'next/image';
import Link from 'next/link';
import { ImageSquare, CaretRight } from 'phosphor-react';
import { ReactNode, useState, useRef } from 'react';
import ZoomImageModal from '@components/ZoomImageModal';
import { ipfsEndpoint, ipfsGateway } from '@configs/globalsConfig';

interface HeaderRootProps {
  border?: boolean;
  breadcrumb?: Array<string[]>;
  children?: ReactNode;
}

interface HeaderContentProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

interface HeaderSearchProps {
  children?: ReactNode;
}

interface HeaderAudioProps {
  audioIpfs?: string;
}

interface HeaderModelProps {
  modelIpfs?: string;
}

interface HeaderBannerProps {
  imageIpfs?: string;
  videoIpfs?: string;
  audioIpfs?: string;
  modelIpfs?: string;
  title?: string;
  subtitle?: string;
  base64Data?: string;
}

function HeaderRoot({ border, breadcrumb, children }: HeaderRootProps) {
  return (
    <header
      className={`${breadcrumb ? 'pb-4 md:pb-8' : 'py-4 md:py-8'} ${border ? 'border-b border-neutral-700' : ''
        }`}
    >
      {breadcrumb && (
        <nav className="container py-2" aria-label="Breadcrumb">
          <ul className="flex flex-wrap gap-2 items-center body-2 font-bold">
            {breadcrumb.map(([label, href], index) => (
              <li
                key={index}
                className="flex gap-2 items-center text-neutral-400"
              >
                {index !== 0 && <CaretRight size={16} weight="bold" />}
                {href ? (
                  <Link
                    href={href}
                    className="block text-neutral-400 hover:text-white py-2"
                  >
                    {label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-white">
                    {label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="container flex gap-4 md:gap-8 flex-col md:flex-row md:items-center overflow-x-hidden sm:overflow-x-visible">
        {children}
      </div>
    </header>
  );
}

function HeaderContent({ title, subtitle, children }: HeaderContentProps) {
  return (
    <div className="flex-1">
      {subtitle && <p className="title-1">{subtitle}</p>}
      <h1 className="headline-1">{title ?? 'No name'}</h1>
      {children}
    </div>
  );
}

function HeaderSearch({ children }: HeaderSearchProps) {
  return <div className="flex-1 md:max-w-[16rem]">{children}</div>;
}

function HeaderAudio({ audioIpfs }: HeaderAudioProps) {
  return (
    <div className="flex-1 mt-4 md:max-w-[16rem]">
      {audioIpfs ? (
        <audio controls>
          <source src={`${ipfsEndpoint}/${audioIpfs}`} type="audio/mp3" />
        </audio>
      ) : (
        ' '
      )}
    </div>
  );
}

function HeaderBanner({
  imageIpfs,
  videoIpfs,
  modelIpfs,
  title,
  base64Data,
}: HeaderBannerProps) {
  const modalRef = useRef<HTMLInputElement | any>(null);

  const handleImageClick = () => {
    modalRef.current.openModal();
  };

  return (
    <div className="flex-1">
      <div className="relative w-full md:max-w-[14rem] lg:max-w-sm mx-auto aspect-square">
        {modelIpfs ? (
          <>
            <div className="flex-1 justify-center">
              <model-viewer
                src={`${ipfsEndpoint}/${modelIpfs}`}
                poster={`${ipfsEndpoint}/${imageIpfs}`}
                alt={`${title} 3D model`}
                auto-play
                ar-modes="webxr scene-viewer quick-look"
                environment-image="neutral"
                quick-look-browsers="safari chrome"
                auto-rotate
                camera-controls
                shadow-intensity="1"
                shadow-softness="1"
                style={{
                  height: '480px',
                  width: '480px',
                }}
              />
            </div>
            <div className="absolute blur-3xl -z-10 w-[calc(100%+4rem)] h-[calc(100%+4rem)] -left-[2rem] -top-[2rem] hidden md:block">
              <Image
                src={`${ipfsEndpoint}/${imageIpfs}`}
                fill
                className="object-contain"
                quality={1}
                alt=""
                sizes="max-w-2xl"
                priority
              />
            </div>
          </>
        ) : imageIpfs ? (
          <>
            <img
              src={`${ipfsGateway}/${imageIpfs}`}
              alt="Banner Image"
              className="zoom-cursor"
              onClick={handleImageClick}
            />
            <ZoomImageModal ref={modalRef} imageIpfs={`${ipfsEndpoint}/${imageIpfs}`} />
            <div className="absolute blur-3xl -z-10 w-[calc(100%+4rem)] h-[calc(100%+4rem)] -left-[2rem] -top-[2rem] hidden md:block">
              <Image
                src={`${ipfsEndpoint}/${imageIpfs}`}
                fill
                className="object-contain"
                quality={1}
                alt=""
                sizes="max-w-2xl"
                priority
              />
            </div>
          </>
        ) : videoIpfs ? (
          <video
            muted
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={`${ipfsEndpoint}/${videoIpfs}`} type="video/mp4" />
          </video>
        ) : base64Data ? (
          base64Data.startsWith('data:image') ? (
            <>
              <img
                src={base64Data}
                alt="Banner Image"
                className="zoom-cursor"
                style={{
                  width: '24rem',
                  height: 'auto'
                }}
                onClick={handleImageClick}
              />
              <ZoomImageModal ref={modalRef} imageIpfs={base64Data} />
              <div className="absolute blur-3xl -z-10 w-[calc(100%+4rem)] h-[calc(100%+4rem)] -left-[2rem] -top-[2rem] hidden md:block">
                <Image
                  src={base64Data}
                  fill
                  className="object-contain"
                  quality={1}
                  alt=""
                  sizes="max-w-2xl"
                  priority
                />
              </div>
            </>
          ) : base64Data.startsWith('data:video') ? (
            <video
              muted
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={base64Data} type="video/mp4" />
            </video>
          ) : null
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-700 text-white rounded-xl">
            <ImageSquare size={64} />
          </div>
        )}
      </div>
    </div>
  );
}


export const Header = {
  Root: HeaderRoot,
  Content: HeaderContent,
  Banner: HeaderBanner,
  Search: HeaderSearch,
  Audio: HeaderAudio,
};
