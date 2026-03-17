import CVContent from '@/components/CVContent';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-gray-200 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto border border-gray-800 rounded-lg shadow-2xl bg-[#0a0a0a] overflow-hidden">
        <CVContent />
      </div>
    </main>
  );
}
