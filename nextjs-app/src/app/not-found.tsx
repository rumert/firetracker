import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-xl mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link href="/">
          <Button variant="secondary">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}