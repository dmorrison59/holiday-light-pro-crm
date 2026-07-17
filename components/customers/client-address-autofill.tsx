"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

export interface AutofillResponse {
  features: Array<{
    geometry: { coordinates: number[] };
    properties: {
      address_line1?: string;
      address_level1?: string;
      address_level2?: string;
      postcode?: string;
    };
  }>;
}

const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((module) => module.AddressAutofill),
  { ssr: false },
);

export function ClientAddressAutofill({
  accessToken,
  children,
  onRetrieve,
}: {
  accessToken: string;
  children: ReactNode;
  onRetrieve: (response: AutofillResponse) => void;
}) {
  return (
    <AddressAutofill
      accessToken={accessToken}
      options={{ country: "US", language: "en" }}
      onRetrieve={onRetrieve}
    >
      {children}
    </AddressAutofill>
  );
}
