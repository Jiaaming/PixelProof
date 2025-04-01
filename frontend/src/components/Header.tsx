"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="w-full h-16 px-6 bg-white border-b flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Link href="/">
          <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="cursor-pointer" />
        </Link>
        <Link href="/workspace">
          <h1 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 cursor-pointer">
            PixelProof
          </h1>
        </Link>
        <nav className="flex space-x-4">
        <Link
          href="/workspace/embed"
          className={`${
            pathname === "/workspace/embed" ? "text-indigo-600 font-semibold" : "text-gray-600"
          } hover:text-indigo-700`}
        >
          Embed
        </Link>
        <Link
          href="/workspace/decode"
          className={`${
            pathname === "/workspace/decode" ? "text-indigo-600 font-semibold" : "text-gray-600"
          } hover:text-indigo-700`}
        >
          Decode
        </Link>
      </nav>
      </div>
    </header>
  );
}
