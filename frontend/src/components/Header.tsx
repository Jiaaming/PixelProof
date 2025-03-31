"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
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
      </div>
    </header>
  );
}
