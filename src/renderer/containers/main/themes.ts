import { Container, autosuspend } from 'overstated';

/**
 *
 */
class Themes extends Container<ThemesState, MainCTX> {


  state = {
    themes: ['light', 'dark']
  };


  constructor() {

    super();

    autosuspend(this);

  }

  /* API */

  get = (): string[] => {

    return this.state.themes;

  }

  set = (themes: string[]) => {

    return this.setState({ themes });

  }

}

/* EXPORT */

export default Themes;
