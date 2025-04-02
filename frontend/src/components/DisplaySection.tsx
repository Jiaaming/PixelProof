type Props = {
  mode: "embed" | "decode";
  preview: string;
  embeddedImg?: string;
  selectedChain?: string;
  extractedImg?: string;
  txHash?: string;
  imageHash?: string;
  link?: string; // Optional, retained for potential use elsewhere
};

export default function DisplaySection({ mode, preview, selectedChain, embeddedImg, extractedImg, txHash, imageHash, link }: Props) {
  return (
    <div>
      {/* Image Preview Section */}
      {preview && (
        <div className="mb-4">
          <p className="text-gray-700 font-medium">Image Preview:</p>
          <img src={preview} alt="Preview" className="max-w-full max-h-[400px] rounded shadow" />
        </div>
      )}

      {/* Embed Mode Section */}
      {mode === "embed" && (
        <>
          {embeddedImg && (
            <div className="mb-4">
              <p className="font-semibold text-gray-800">Embedded Image:</p>
              <img src={embeddedImg} alt="Embedded" className="max-w-full max-h-[400px] rounded shadow mt-2" />
              <a
                href={embeddedImg}
                download="embedded.jpg"
                className="mt-2 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                ⬇️ Download Embedded Image
              </a>
            </div>
          )}
          {extractedImg && (
            <div className="mb-4">
              <p className="font-semibold text-gray-800">Extracted Watermark:</p>
              <img src={extractedImg} alt="Extracted" className="max-w-full max-h-[400px] rounded shadow mt-2" />
              <a
                href={extractedImg}
                download="watermark.jpg"
                className="mt-2 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                ⬇️ Download Watermark
              </a>
            </div>
          )}
          {txHash && (
            <p className="text-sm text-gray-700">
              Transaction:{" "}
              <a
                href={
                  selectedChain === "ETH"
                    ? `https://sepolia.etherscan.io/tx/0x${txHash}`
                    : `https://explorer.solana.com/tx/${txHash}?cluster=devnet`
                }
                target="_blank"
                className="text-indigo-600 hover:underline"
              >
                {txHash}
              </a>
            </p>
          )}
          {imageHash && (
            <p className="text-sm text-gray-700">
              Image Hash: {imageHash} {/* Fixed: Removed invalid <a> tag */}
            </p>
          )}
        </>
      )}

      {/* Decode Mode Section */}
      {mode === "decode" && extractedImg && (
        <div className="mb-4">
          <p className="font-semibold text-gray-800">Extracted QR Code:</p>
          <img
            src={extractedImg}
            alt="Extracted QR Code"
            className="max-w-full max-h-[400px] rounded shadow mt-2"
          />
        </div>
      )}
    </div>
  );
}