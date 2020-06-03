// import {debug, HMR} from 'overstated';
import { HMR } from 'overstated';
import logUpdates from 'react-log-updates';
import Environment from '@common/environment';


async function debugging() {

  logUpdates({
    enabled: Environment.isDevelopment,
    exclude: /^(Consumer|ContainersProvider|PropsChangeComponent|pure\(|SelectorComponent|Subscribe)/i
  });

  // debug.isEnabled = Environment.isDevelopment;
  // debug.logStateChanges = false;

  HMR.isEnabled = Environment.isDevelopment;

}


export default debugging;
