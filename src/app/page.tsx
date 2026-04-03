import Image from "next/image";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Premium Landing Page</title>
        <meta name="description" content="Experience a modern, premium landing page built with Next.js" />
      </Head>
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/hero_background.png')" }}>
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 text-center p-8">
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">Welcome to Our Platform</h1>
          <p className="text-lg text-gray-200 mb-6 animate-fade-in delay-200">Discover cutting‑edge solutions crafted for you.</p>
          <a href="/signup" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 animate-bounce">
            Get Started
          </a>
        </div>
      </div>
    </>
  );
}
