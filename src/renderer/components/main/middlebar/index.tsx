import React from 'react';
import {connect} from 'overstated';
import Main from '@renderer/containers/main';
import Content from './content';
import Header from './header';
import Toolbar from './toolbar';

/**
 * The middlebar shows you all notes contained in the currently active category
 */
const Middlebar = ({ isFocus, isZen }) => {

  if ( isFocus || isZen ) return null;

  return (
    <div className="middlebar layout column">
      <Toolbar />
      <Header />
      <Content />
    </div>
  );

};


export default connect ({
  container: Main,
  selector: ({ container }) => ({
    isFocus: container.window.isFocus (),
    isZen: container.window.isZen ()
  })
})( Middlebar );
