import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-2 p-0">
        <p className="border-2 p-1 text-center mt-0 text-4xl bg-lime-900 text-white font-bold">Logo Marketplace</p>
        <div className="flex mt-0 bg-green-800 border-2 p-2">
          <Link href="/">
            <a className="mr-6 text-white">
              Marketplace
            </a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-white">
              Sell Your Digital Asset
            </a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-white">
              My Digital Assets
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-white">
              My Dashboard
            </a>
          </Link>

        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp
