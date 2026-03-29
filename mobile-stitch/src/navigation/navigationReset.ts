import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

/** After login / OTP, clear the auth stack and land on main tabs. */
export function resetToMain(navigation: NavigationProp<ParamListBase>) {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    })
  );
}
