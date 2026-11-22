import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 w-full space-y-6">
        <div className="w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✨
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            AI Storefront Generator
          </h1>
          <p className="text-sm text-neutral-600 mt-2">
            Phase 1 Foundation Operational
          </p>
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg text-left text-xs font-mono space-y-1 border border-neutral-100">
          <p className="text-emerald-700 font-semibold">✓ Next.js App Router</p>
          <p className="text-emerald-700 font-semibold">✓ Tailwind CSS & shadcn/ui</p>
          <p className="text-emerald-700 font-semibold">✓ Supabase Schemas & Client</p>
          <p className="text-emerald-700 font-semibold">✓ Zod Validation Schemas</p>
          <p className="text-emerald-700 font-semibold">✓ Security Tokens & Slug Engine</p>
        </div>

        <Button className="w-full">
          Get Started
        </Button>
      </div>
    </main>
  );
}
