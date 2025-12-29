import Sidebar from '@/components/Sidebar';

export default function AIAssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

