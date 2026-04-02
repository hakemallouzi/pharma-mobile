import type { NavigatorScreenParams } from '@react-navigation/native';

/** Serializable cart payload for checkout (from Cart or restored session). */
export type CheckoutCartLine = {
  id: string;
  title: string;
  sub: string;
  /** Unit price without currency symbol, e.g. "42.00" */
  price: string;
  qty: number;
  image: string;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Chat: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  AuthGate: undefined;
  Login: undefined;
  Signup: undefined;
  SendOtp: undefined;
  VerifyOtp: undefined;
  Addresses: undefined;
  Checkout:
    | {
        lines?: CheckoutCartLine[];
        promoCode?: string;
        /** When opening from menu, auto-open the Visa modal for add/update. */
        openVisaModal?: boolean;
        /** Initial step inside Visa modal. */
        visaModalStep?: 'menu' | 'form';
      }
    | undefined;
  OrderDetail: { orderId?: string };
  ProductList: { category?: string; query?: string };
  ProductDetail: {
    item: {
      category: string;
      title: string;
      titleAr?: string;
      sub: string;
      subAr?: string;
      price: string;
      priceValue: number;
      /** Optional dose/pack variants (e.g. 200gm, 500gm). */
      doses?: Array<{
        label: string;
        price?: string;
        priceValue?: number;
      }>;
      badge?: string;
      tertiary?: boolean;
      image: string;
    };
  };
  PharmacyList:
    | {
        focusMap?: boolean;
        pharmacyName?: string;
        pharmacyInfo?: string;
        latitude?: number;
        longitude?: number;
      }
    | undefined;
  PharmacyDetail: {
    pharmacyName: string;
    pharmacyInfo?: string;
    pharmacyImage?: string;
    address?: string;
    hours?: string;
    delivery?: string;
    services?: string;
    contact?: string;
    latitude?: number;
    longitude?: number;
  };
  SpecialistChat: {
    topic?: 'prescription' | 'general';
    /** Optional text to prefill the chat input when opening from item/share. */
    initialMessage?: string;
    /** Optional image to show as preview before sending. */
    initialImageUri?: string;
  };
  OrdersHistory: undefined;
  BarcodeScan: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
