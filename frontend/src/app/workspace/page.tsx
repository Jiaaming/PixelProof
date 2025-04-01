// app/workspace/page.tsx
"use client";
import { useRouter } from "next/navigation";

export default function WorkspacePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Workspace</h1>
      <p className="text-lg text-gray-600 mb-10">Choose your action</p>
      <div className="flex space-x-6">
        <button
          onClick={() => router.push("/workspace/embed")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
        >
          Embed Watermark
        </button>
        <button
          onClick={() => router.push("/workspace/decode")}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 shadow"
        >
          Decode Watermark
        </button>
      </div>
    </main>
  );
}
