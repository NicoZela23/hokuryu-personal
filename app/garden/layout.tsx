import { Nav } from '@/components/garden/Nav'

export default function GardenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper dark:bg-forest">
      <Nav />
      {children}
    </div>
  )
}
