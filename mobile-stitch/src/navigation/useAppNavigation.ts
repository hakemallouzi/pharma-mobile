import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigationTypes';

/**
 * Stack routes (ProductList, Addresses, etc.) live on the root stack while tab
 * screens sit under `Main`. This returns the stack navigator so `navigate` works
 * from tab children and from stack screens alike.
 */
export function useAppNavigation(): NativeStackNavigationProp<RootStackParamList> {
  const navigation = useNavigation();
  const parent = navigation.getParent();
  return (parent ?? navigation) as NativeStackNavigationProp<RootStackParamList>;
}
