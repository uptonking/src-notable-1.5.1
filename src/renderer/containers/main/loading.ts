import { Container, autosuspend } from "overstated";

class Loading extends Container<LoadingState, MainCTX> {
  state = {
    loading: true,
  };

  constructor() {
    super();
    autosuspend(this);
  }

  /* API */

  get = (): boolean => {
    return this.state.loading;
  };

  set = (loading: boolean) => {
    return this.setState({ loading });
  };
}

export default Loading;
