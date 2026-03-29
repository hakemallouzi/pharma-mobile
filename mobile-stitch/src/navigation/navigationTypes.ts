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
  Orders: undefined;
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
  Checkout: { lines?: CheckoutCartLine[]; promoCode?: string } | undefined;
  OrderDetail: { orderId?: string };
  ProductList: { category?: string; query?: string };
  PharmacyList: undefined;
  BarcodeScan: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
