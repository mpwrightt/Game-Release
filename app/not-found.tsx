import Link from 'next/link'
import { ArrowRight, Gamepad2 } from 'lucide-react'

export default function NotFoundPage() {
    return (
        <section className="h-screen w-screen flex flex-col items-center justify-center bg-background">
            <Gamepad2 className="h-20 w-20 text-muted-foreground mb-6" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground text-center">
                Page not found
            </h1>
            <p className="text-muted-foreground mt-2">
                The page you're looking for doesn't exist.
            </p>
            <Link href="/">
                <div className="mt-8 bg-primary text-primary-foreground text-lg font-medium flex items-center justify-center px-6 py-3 rounded-full hover:bg-primary/90 transition-colors">
                    <span>Back to Games</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                </div>
            </Link>
        </section>
    )
}