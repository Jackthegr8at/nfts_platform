import Head from 'next/head';
import { FlyingSaucer } from 'phosphor-react';

export default function PageNotFound() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
        <title>Error - Please Try Again</title>
      </Head>

      <div className="flex flex-col justify-center items-center h-[calc(100vh-15rem)]">
        <div>
          <h1 className="font-bold text-7xl uppercase text-center text-neutral-800">
            Oops! Something Went Wrong
          </h1>
        </div>
        <div className="flex flex-col justify-center items-center">
          <FlyingSaucer size={128} />
          <span className="headline-2 block font-bold skew-y-12 tracking-widest">
            Error
          </span>
          <p className="mt-4 text-2xl text-white">
            Please try reloading the page.
          </p>
        </div>
      </div>
    </>
  );
}