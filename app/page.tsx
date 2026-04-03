"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Cpu, BarChart3, ShieldCheck, Phone, Mail, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { motion } from "framer-motion";

export default function Home() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ["publicOverview"],
    queryFn: async () => {
      const res = await api.get("/public/dashboard/overview");
      return res.data.data;
    },
  });

  const formatCompact = (n: number) =>
    new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

  return (
    <main className="min-h-screen bg-offwhite flex flex-col">
      {/* ═══════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-offwhite/80 backdrop-blur-xl border-b border-gray-200/30">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center">
              <Leaf size={18} className="text-lime" />
            </div>
            <span className="text-gray-900 font-bold text-xl tracking-tight" style={{ fontFamily: "var(--font-mono)" }}>
              AGROSEVA
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-10">
            {["Home", "Schemes", "Technology", "About"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : item === "Schemes" ? "/schemes" : `/${item.toLowerCase()}`}
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:block text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Sign in
            </Link>
            <Link href="/login" className="btn-lime">
              Contact Us
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════
          HERO — Split Screen
      ═══════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[90vh] flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-20 bg-offwhite relative">
          {/* Decorative bracket */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bracket-label text-forest-light">[We Are AgroSeva]</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mt-6 mb-8 leading-[1.05] tracking-tight"
          >
            Smarter
            <br />
            Farming
            <br />
            <span className="text-forest">Starts Here</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-600 text-lg max-w-md mb-10 leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Empowering farmers with transparent access to government agricultural schemes,
            AI-driven claim processing, and real-time grievance resolution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/login" className="btn-lime flex items-center gap-2">
              Start a Demo <ArrowRight size={16} />
            </Link>
            <Link href="/schemes" className="btn-outline">
              Learn More
            </Link>
          </motion.div>

          {/* Decorative sprout icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute bottom-12 right-12 hidden lg:block"
          >
            <Leaf size={180} className="text-forest" />
          </motion.div>
        </div>

        {/* Right Column — Hero Image */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <Image
            src="/hero-farmer-field.png"
            alt="Modern farmer using technology in agricultural field"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Overlay stats on image */}
          <div className="absolute bottom-8 left-8 right-8 flex gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="glass rounded-xl px-5 py-4 flex-1"
            >
              <span className="bracket-label text-gray-500">[01]</span>
              <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                {isLoading ? "—" : formatCompact(overview?.totalFarmers || 12400)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Farmers Onboarded</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="glass rounded-xl px-5 py-4 flex-1"
            >
              <span className="bracket-label text-gray-500">[02]</span>
              <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                98%
              </p>
              <p className="text-xs text-gray-500 mt-1">Resolution Rate</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          IMPACT STATS — 2×2 Grid
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="text-center mb-16">
            <span className="bracket-label text-forest-light">[Our Impact]</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
              Measurable Results
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              {
                num: "[01]",
                value: isLoading ? "—" : formatCompact(overview?.totalFarmers || 12400),
                label: "Farmers Registered",
                desc: "Across multiple states and districts",
              },
              {
                num: "[02]",
                value: isLoading ? "—" : `${overview?.grievancesResolvedRate || 98}%`,
                label: "Grievance Resolution",
                desc: "Issues resolved within 48 hours",
              },
              {
                num: "[03]",
                value: isLoading ? "—" : formatCompact(overview?.claimsProcessed || 8500),
                label: "Claims Processed",
                desc: "Transparent and verified digitally",
              },
              {
                num: "[04]",
                value: isLoading ? "—" : formatCompact(overview?.schemesActive || 45),
                label: "Active Schemes",
                desc: "Government programs available now",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-start p-8 border-l border-gray-100 first:border-l-0"
              >
                <span className="bracket-label text-forest/40 mb-3">{stat.num}</span>
                <span className="stat-number">{stat.value}</span>
                <span className="text-gray-900 font-semibold text-base mt-3 mb-1">{stat.label}</span>
                <span className="text-gray-500 text-sm leading-relaxed">{stat.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SERVICES — Image + Text Alternating
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-offwhite">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="text-center mb-20">
            <span className="bracket-label text-forest-light">[What We Offer]</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
              Our Services
            </h2>
          </div>

          {/* Service 1 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-12 items-center mb-24"
          >
            <div className="flex-1 img-zoom rounded-2xl overflow-hidden">
              <Image
                src="/agri-drone.png"
                alt="Agricultural drone technology"
                width={700}
                height={500}
                className="w-full h-[400px] object-cover rounded-2xl"
              />
            </div>
            <div className="flex-1 lg:pl-8">
              <span className="bracket-label text-forest/40">[01]</span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-4">
                Precision Agriculture
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-6" style={{ fontFamily: "var(--font-inter)" }}>
                Leverage AI-powered crop monitoring, drone-based field analysis, and satellite imagery
                to make data-driven decisions. Our platform integrates real-time weather data and soil
                analytics to optimize yield and reduce waste.
              </p>
              <Link href="/schemes" className="btn-outline text-sm">
                Explore <ArrowRight size={14} className="inline ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Service 2 — Reversed */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row-reverse gap-12 items-center mb-24"
          >
            <div className="flex-1 img-zoom rounded-2xl overflow-hidden">
              <Image
                src="/smart-greenhouse.png"
                alt="Smart greenhouse technology"
                width={700}
                height={500}
                className="w-full h-[400px] object-cover rounded-2xl"
              />
            </div>
            <div className="flex-1 lg:pr-8">
              <span className="bracket-label text-forest/40">[02]</span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-4">
                Digital Scheme Access
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-6" style={{ fontFamily: "var(--font-inter)" }}>
                One-click access to all government agricultural schemes. Upload documents directly from
                your phone, track application status in real-time, and receive instant notifications on
                approvals and disbursements.
              </p>
              <Link href="/schemes" className="btn-outline text-sm">
                View Schemes <ArrowRight size={14} className="inline ml-1" />
              </Link>
            </div>
          </motion.div>

          {/* Service 3 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-12 items-center"
          >
            <div className="flex-1 img-zoom rounded-2xl overflow-hidden">
              <Image
                src="/hero-drone.png"
                alt="AI-driven farming insights"
                width={700}
                height={500}
                className="w-full h-[400px] object-cover rounded-2xl"
              />
            </div>
            <div className="flex-1 lg:pl-8">
              <span className="bracket-label text-forest/40">[03]</span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-4">
                Grievance Resolution
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-6" style={{ fontFamily: "var(--font-inter)" }}>
                File and track grievances transparently with our AI-assisted resolution engine.
                Every complaint is logged, assigned, and resolved with full visibility — ensuring
                accountability at every step.
              </p>
              <Link href="/login" className="btn-outline text-sm">
                File Grievance <ArrowRight size={14} className="inline ml-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES — Grid Cards
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="bracket-label text-forest-light">[Technology]</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
                Built For Speed & Simplicity
              </h2>
              <p className="text-gray-600 text-lg" style={{ fontFamily: "var(--font-inter)" }}>
                We've rebuilt the agricultural support system from the ground up to
                deliver what farmers need — when they need it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "AI Verification",
                desc: "Document checking and approval within 48 hours instead of months.",
                icon: Cpu,
              },
              {
                title: "Real-Time Tracking",
                desc: "Always know where your application stands via our live dashboard.",
                icon: BarChart3,
              },
              {
                title: "Secure & Private",
                desc: "Bank-grade encryption for all your personal and financial data.",
                icon: ShieldCheck,
              },
              {
                title: "Mobile First",
                desc: "Snap and upload Aadhaar, land records, and bank details from your phone.",
                icon: Phone,
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card p-8 rounded-2xl group cursor-default"
              >
                <div className="w-14 h-14 rounded-xl bg-lime/50 flex items-center justify-center text-forest mb-6 group-hover:bg-lime transition-colors duration-300">
                  <feature.icon size={26} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 normal-case">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA BANNER — Lime Green Background
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-lime relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-[1400px] mx-auto px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <span className="bracket-label text-forest/60">[Partner With Us]</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-6 leading-tight">
              Let&apos;s Build a Smarter Farm, Together
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
              Whether you&apos;re a farmer looking for government support or an organization
              aiming to modernize agriculture — AgroSeva is your gateway.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login" className="btn-forest flex items-center gap-2">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link href="/schemes" className="btn-outline">
              About Us
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CONTACT SECTION
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left — Info */}
            <div className="flex-1">
              <span className="bracket-label text-forest-light">[Get In Touch]</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6">
                Contact Us
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-10" style={{ fontFamily: "var(--font-inter)" }}>
                Have questions about our platform or need help with your application?
                Our support team is here to assist you every step of the way.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-lime/50 flex items-center justify-center text-forest flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Email</p>
                    <a href="mailto:support@agroseva.gov.in" className="text-gray-500 text-sm hover:text-forest transition-colors">
                      support@agroseva.gov.in
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-lime/50 flex items-center justify-center text-forest flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Phone</p>
                    <a href="tel:1800-123-4567" className="text-gray-500 text-sm hover:text-forest transition-colors">
                      1800-123-4567 (Toll Free)
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-lime/50 flex items-center justify-center text-forest flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Address</p>
                    <p className="text-gray-500 text-sm">
                      Ministry of Agriculture, Krishi Bhawan,
                      <br />
                      New Delhi, India — 110001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="flex-1">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b-2 border-gray-200 focus:border-forest py-3 text-gray-900 outline-none transition-colors placeholder-gray-400"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b-2 border-gray-200 focus:border-forest py-3 text-gray-900 outline-none transition-colors placeholder-gray-400"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-transparent border-b-2 border-gray-200 focus:border-forest py-3 text-gray-900 outline-none transition-colors placeholder-gray-400"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full bg-transparent border-b-2 border-gray-200 focus:border-forest py-3 text-gray-900 outline-none transition-colors placeholder-gray-400"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full bg-transparent border-b-2 border-gray-200 focus:border-forest py-3 text-gray-900 outline-none transition-colors placeholder-gray-400 resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button type="submit" className="btn-lime w-full sm:w-auto">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER — Aerial Farm Background
      ═══════════════════════════════════════════════ */}
      <footer className="relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/aerial-farm.png"
            alt="Aerial view of agricultural farmland"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-8 pt-20 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            {/* Brand */}
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-lime flex items-center justify-center">
                  <Leaf size={18} className="text-forest" />
                </div>
                <span className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-mono)" }}>
                  AGROSEVA
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                Empowering the agricultural backbone of India with modern,
                transparent, and accessible government support.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-16">
              <div className="flex flex-col gap-3">
                <span className="text-white font-semibold text-sm mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                  PLATFORM
                </span>
                <Link href="/schemes" className="text-gray-400 hover:text-lime transition-colors text-sm">
                  Schemes
                </Link>
                <Link href="/login" className="text-gray-400 hover:text-lime transition-colors text-sm">
                  Apply Now
                </Link>
                <Link href="/dashboard" className="text-gray-400 hover:text-lime transition-colors text-sm">
                  Dashboard
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-white font-semibold text-sm mb-2" style={{ fontFamily: "var(--font-mono)" }}>
                  COMPANY
                </span>
                <Link href="/about" className="text-gray-400 hover:text-lime transition-colors text-sm">
                  About
                </Link>
                <a href="mailto:support@agroseva.gov.in" className="text-gray-400 hover:text-lime transition-colors text-sm">
                  Contact
                </a>
                <a href="#" className="text-gray-400 hover:text-lime transition-colors text-sm">
                  Help Center
                </a>
              </div>
            </div>

            {/* Keep In Touch */}
            <div className="max-w-xs">
              <span className="text-white font-semibold text-sm mb-4 block" style={{ fontFamily: "var(--font-mono)" }}>
                KEEP IN TOUCH
              </span>
              <p className="text-gray-400 text-sm mb-4" style={{ fontFamily: "var(--font-inter)" }}>
                Subscribe for the latest updates on agricultural schemes and technology.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-white/10 border border-white/20 rounded-l-full px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-lime transition-colors"
                />
                <button className="bg-lime text-forest-dark px-5 py-2.5 rounded-r-full font-semibold text-sm hover:bg-lime-hover transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} AgroSeva — Government Agriculture Department. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-lime transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-lime transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-lime transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
