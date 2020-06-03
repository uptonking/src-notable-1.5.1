import React from 'react';

/**
 * 简单router
 */
function Router({ routes }) {
  const route = new URLSearchParams(window.location.search).get('route') || 'default',
    Component = routes[route] || routes.default;

  return <Component />;
}

export { Router };
