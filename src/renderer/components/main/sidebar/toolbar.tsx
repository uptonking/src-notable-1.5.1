import {is} from 'electron-util';
import * as React from 'react';
import {connect} from 'overstated';
import Main from '@renderer/containers/main';

/**
 * macOS独有的工具条
 */
const Toolbar = ({ isFullscreen }) => {

  // 若不是macOS, 则返回null
  if ( !is.macos || isFullscreen ) return null;

  return <div className="layout-header toolbar"></div>;

};

/* EXPORT */

export default connect ({
  container: Main,
  selector: ({ container }) => ({
    isFullscreen: container.window.isFullscreen ()
  })
})( Toolbar );
