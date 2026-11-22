'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Store, Product, Bio } from '@/lib/types';
import { BioSection } from '@/components/preview/bio-section';
import { ProductCard } from '@/components/preview/product-card';
import { ShareDrawer } from '@/components/share-drawer';
import { useAutosave } from '@/hooks/use-autosave';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Plus,
  Undo2,
  Check,
  Loader2,
  ExternalLink,
  Share2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

function EditStoreContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [store, setStore] = useState<Store | null>(null);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Undo buffer (1 snapshot level deep)
  const [undoSnapshot, setUndoSnapshot] = useState<Store | null>(null);

  // Active section regeneration tracking
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [instructionModal, setInstructionModal] = useState<{
    isOpen: boolean;
    target: string;
    label: string;
  }>({ isOpen: false, target: '', label: '' });
  const [userInstruction, setUserInstruction] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);

  // 1. Initial Load & Token Discovery
  useEffect(() => {
    let activeToken = searchParams.get('t') || '';
    if (!activeToken && typeof window !== 'undefined') {
      activeToken = localStorage.getItem(`edit_token_${slug}`) || '';
    }

    if (activeToken) {
      setToken(activeToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`edit_token_${slug}`, activeToken);
      }
    }

    // Fetch initial store data
    async function loadStore() {
      try {
        const res = await fetch(`/api/store/${slug}`, {
          headers: activeToken ? { 'x-edit-token': activeToken } : {},
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load store');
        }
        setStore(data.store);
      } catch (err: any) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadStore();
    }
  }, [slug, searchParams]);

  // 2. Autosave Implementation
  const saveStoreChanges = useCallback(
    async (updatedStore: Store | null) => {
      if (!updatedStore || !token) return true;
      try {
        const res = await fetch(`/api/store/${slug}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-edit-token': token,
          },
          body: JSON.stringify({
            display_name: updatedStore.display_name,
            bio: updatedStore.bio,
            products: updatedStore.products,
            theme: updatedStore.theme,
            contact_url: updatedStore.contact_url,
          }),
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    },
    [slug, token]
  );

  const { isSaving, lastSaved } = useAutosave(store, saveStoreChanges, 1500);

  // 3. State update helpers
  const updateBio = (newBio: Bio, newName: string) => {
    if (!store) return;
    setStore({
      ...store,
      bio: newBio,
      display_name: newName,
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    if (!store) return;
    setStore({
      ...store,
      products: (store.products || []).map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
    });
  };

  const deleteProduct = (productId: string) => {
    if (!store || (store.products && store.products.length <= 1)) return;
    setStore({
      ...store,
      products: store.products.filter((p) => p.id !== productId),
    });
  };

  const addProduct = () => {
    if (!store || (store.products && store.products.length >= 4)) return;
    const newId = `prod_${Date.now()}`;
    const newProd: Product = {
      id: newId,
      title: 'New Digital Offer',
      format: 'ebook',
      price_inr: 299,
      billing: 'one_time',
      description: 'Practical actionable resources and guidelines for your audience.',
      outcomes: ['Clear step-by-step guidance', 'Immediate instant access', 'Simple actionable steps'],
      cta_label: 'Get Access Now',
      pricing_rationale: 'Frictionless entry pricing for first time buyers.',
    };
    setStore({
      ...store,
      products: [...(store.products || []), newProd],
    });
  };

  // 4. Regeneration with Undo
  const triggerRegeneration = async (target: string, instruction?: string) => {
    if (!store) return;
    setInstructionModal({ isOpen: false, target: '', label: '' });
    setUserInstruction('');
    setUndoSnapshot({ ...store });
    setRegeneratingSection(target);

    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          token,
          target,
          instruction,
          currentStore: {
            niche: store.niche,
            language: store.language,
            bio: store.bio,
            products: store.products,
          },
        }),
      });

      const json = await res.json();
      if (res.ok) {
        if (target === 'bio') {
          setStore((prev) => (prev ? { ...prev, bio: json.data } : null));
        } else if (target.startsWith('product:')) {
          const productId = target.replace('product:', '');
          setStore((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              products: (prev.products || []).map((p) => (p.id === productId ? json.data : p)),
            };
          });
        }
      }
    } catch (err) {
      console.error('Regeneration error:', err);
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handlePublish = async () => {
    if (!store || !token) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/store/${slug}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-edit-token': token,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to publish store');
      } else {
        setStore(data.store);
        setShowShareDrawer(true);
      }
    } catch (err: any) {
      alert(err.message || 'Publishing error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUndo = () => {
    if (undoSnapshot) {
      setStore(undoSnapshot);
      setUndoSnapshot(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
          <p className="text-sm font-medium text-neutral-600">Loading your storefront editor...</p>
        </div>
      </div>
    );
  }

  if (loadError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-neutral-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-neutral-900">Unable to load editor</h2>
          <p className="text-xs text-neutral-500">{loadError || 'This storefront does not exist or requires an edit link.'}</p>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            Create a New Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 pb-28">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-neutral-900">AI Storefront</span>
          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-semibold uppercase">
            Editor
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Autosave Indicator */}
          <div className="text-[11px] flex items-center gap-1.5 font-medium text-neutral-500">
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Saved</span>
              </>
            )}
          </div>

          {/* Undo Button */}
          {undoSnapshot && (
            <button
              onClick={handleUndo}
              type="button"
              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
          )}
        </div>
      </header>

      {/* Main Preview / Editor Area */}
      <main className="max-w-md mx-auto p-4 space-y-4 pt-6">
        {/* Info Banner */}
        <div className="bg-neutral-900 text-white p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-sm">
          <div>
            <p className="font-semibold">Tap any field to edit directly</p>
            <p className="text-neutral-400 text-[11px]">Changes autosave to your private store link.</p>
          </div>
          <span className="text-lg">✨</span>
        </div>

        {/* Bio Section */}
        <BioSection
          bio={store.bio}
          displayName={store.display_name}
          niche={store.niche}
          onChange={updateBio}
          onRegenerate={() =>
            setInstructionModal({
              isOpen: true,
              target: 'bio',
              label: 'Regenerate Bio',
            })
          }
          isRegenerating={regeneratingSection === 'bio'}
        />

        {/* Products Header & Add Button */}
        <div className="flex items-center justify-between pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Products ({store.products?.length || 0}/4)
          </h3>
          {(store.products?.length || 0) < 4 && (
            <button
              type="button"
              onClick={addProduct}
              className="text-xs text-neutral-900 hover:text-neutral-600 font-semibold flex items-center gap-1 bg-white border border-neutral-200 px-2.5 py-1 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          )}
        </div>

        {/* Products List */}
        <div className="space-y-3.5">
          {store.products?.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onChange={updateProduct}
              onDelete={() => deleteProduct(prod.id)}
              onRegenerate={() =>
                setInstructionModal({
                  isOpen: true,
                  target: `product:${prod.id}`,
                  label: `Regenerate "${prod.title}"`,
                })
              }
              isRegenerating={regeneratingSection === `product:${prod.id}`}
              canDelete={(store.products?.length || 0) > 1}
            />
          ))}
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-neutral-200 p-3 z-30">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <Button
            onClick={() =>
              setInstructionModal({
                isOpen: true,
                target: 'bio',
                label: 'Regenerate Store Profile',
              })
            }
            variant="outline"
            className="flex-1 text-xs font-semibold h-11 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
          </Button>

          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 text-xs font-semibold h-11 rounded-xl shadow-md bg-neutral-900 text-white"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Publishing...
              </>
            ) : store.status === 'published' ? (
              <>Share Store 🚀</>
            ) : (
              <>Publish Store 🚀</>
            )}
          </Button>
        </div>
      </div>

      {/* Share Drawer */}
      <ShareDrawer
        slug={slug}
        displayName={store.display_name}
        isOpen={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
      />

      {/* Regeneration Instruction Modal */}
      {instructionModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-xl border border-neutral-200 animate-in slide-in-from-bottom duration-200">
            <div>
              <h3 className="font-bold text-sm text-neutral-900">{instructionModal.label}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Optional: Tell AI how to change this section (or leave blank for natural rewrite).
              </p>
            </div>

            <input
              type="text"
              value={userInstruction}
              onChange={(e) => setUserInstruction(e.target.value)}
              placeholder="e.g. Make it cheaper, more friendly for beginners..."
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:border-neutral-900 outline-none"
            />

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setInstructionModal({ isOpen: false, target: '', label: '' })}
                className="flex-1 text-xs h-10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => triggerRegeneration(instructionModal.target, userInstruction)}
                className="flex-1 text-xs h-10 rounded-xl bg-neutral-900 text-white"
              >
                Regenerate Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
