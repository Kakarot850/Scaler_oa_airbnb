import React from "react";
import Link from "next/link";
import { Globe, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#EBEBEB] bg-[#F7F7F7] text-sm text-[#222222] mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#EBEBEB]">
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#222222] mb-3">Support</h5>
            <ul className="space-y-2.5 text-xs text-[#717171]">
              <li><Link href="/" className="hover:underline">Help Center</Link></li>
              <li><Link href="/" className="hover:underline">AirCover</Link></li>
              <li><Link href="/" className="hover:underline">Anti-discrimination</Link></li>
              <li><Link href="/" className="hover:underline">Disability support</Link></li>
              <li><Link href="/" className="hover:underline">Cancellation options</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#222222] mb-3">Hosting</h5>
            <ul className="space-y-2.5 text-xs text-[#717171]">
              <li><Link href="/host" className="hover:underline">Airbnb your home</Link></li>
              <li><Link href="/host" className="hover:underline">AirCover for Hosts</Link></li>
              <li><Link href="/host" className="hover:underline">Hosting resources</Link></li>
              <li><Link href="/host" className="hover:underline">Community forum</Link></li>
              <li><Link href="/host" className="hover:underline">Hosting responsibly</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#222222] mb-3">Airbnb</h5>
            <ul className="space-y-2.5 text-xs text-[#717171]">
              <li><Link href="/" className="hover:underline">Newsroom</Link></li>
              <li><Link href="/" className="hover:underline">New features</Link></li>
              <li><Link href="/" className="hover:underline">Careers</Link></li>
              <li><Link href="/" className="hover:underline">Investors</Link></li>
              <li><Link href="/" className="hover:underline">Gift cards</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#222222] mb-3">Airbnb Clone Demo</h5>
            <p className="text-xs text-[#717171] leading-relaxed">
              Engineered with Next.js 14+ App Router, Tailwind CSS, FastAPI, and SQLAlchemy SQLite. Real-time booking availability collision prevention, wishlist sync, and host dashboard.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#717171] gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 Airbnb Clone, Inc.</span>
            <span>·</span>
            <Link href="/" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link href="/" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link href="/" className="hover:underline">Sitemap</Link>
          </div>

          <div className="flex items-center gap-6 font-semibold text-[#222222]">
            <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
            <div className="cursor-pointer hover:underline">
              $ USD
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
