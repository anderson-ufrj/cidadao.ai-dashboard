import { Dashboard } from '@/components/dashboard/Dashboard';
import { Header } from '@/components/layout/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <Dashboard />
        </div>
      </main>
    </>
  );
}
