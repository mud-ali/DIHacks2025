import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import darulIslah from "@/assets/darulislah.jpg";
import minhaj from "@/assets/minhaj.jpg";
import nidaUlIslam from "@/assets/nidaulislam.png"
import masjidAlWali from "@/assets/wali.jpg"

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <Header />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Muslim.Online
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover your local masjid community. Find prayer times, events, and stay updated with everything happening at your masjid.
          </p>
        </div>

        {/* get started Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6  justify-center mb-20 max-w-md mx-auto">
          <Link
            href="/create"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-lg text-center"
          >
            Register a Masjid
          </Link>
          <Link
            href="/find"
            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-lg text-center"
          >
            Find Your Masjid
          </Link>
        </div>

        {/* Featured Masajid Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Featured Masajid
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group overflow-hidden rounded-xl">
              <Image
                src={darulIslah}
                alt="Darul Islah Mosque"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-semibold text-lg">Darul Islah</h3>
                <p className="text-slate-300 text-sm">Muslim Center of Bergen County</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl">
              <Image
                src={minhaj}
                alt="Minhaj Mosque"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-semibold text-lg">Minhaj Ul Quran</h3>
                <p className="text-slate-300 text-sm">Hackensack, NJ</p>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl">
              <Image
                src={nidaUlIslam}
                alt="Teaneck Mosque"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-semibold text-lg">Nida Ul Islam</h3>
                <p className="text-slate-300 text-sm">Teaneck, NJ</p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-xl">
              <Image
                src={masjidAlWali}
                alt="Minhaj Mosque Branch"
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-white font-semibold text-lg">Masjid Al-Wali</h3>
                <p className="text-slate-300 text-sm">Edison, NJ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Prayer Times</h3>
            <p className="text-slate-400">Get accurate prayer times for your location</p>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Find Nearby</h3>
            <p className="text-slate-400">Locate masajid in your area</p>
          </div>
          
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
            <p className="text-slate-400">Connect with your local community</p>
          </div>
        </div>
      </div>
    </div>
  );
}
