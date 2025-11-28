import Sidebar from '@/components/Sidebar';

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 h-full">
                {children}
            </main>
        </div>
    );
}

