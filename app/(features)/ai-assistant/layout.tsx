import Sidebar from '@/components/Sidebar';

export default function AIAssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

