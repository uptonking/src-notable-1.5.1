import debugging from './debugging';
import render from './render';

debugging();
render();


if (module.hot) {

  module.hot.accept('./render', () => {
    require('./render').default();
  });

}
