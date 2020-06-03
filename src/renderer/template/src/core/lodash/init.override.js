// Avoiding using 2 instances of lodash, improves performance
const lodash = require("lodash");

// Closing it because some of its methods are re-implemented
window._ = lodash.clone(lodash);
