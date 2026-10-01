'use client';

import React, { useState } from 'react';
import { MarketplaceListing } from '@/lib/marketplace';
import { CheckoutModal } from './CheckoutModal';
import { ShoppingBag } from 'lucide-react';

interface Props {
  listing: MarketplaceListing;
}

export function ListingBuyButton({ listing }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
      >
        <ShoppingBag className="w-3.5 h-3.5" /> Comprar
      </button>

      <CheckoutModal
        listing={listing}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
