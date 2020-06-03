import React from "react";
import List from "./list";

const KeyedList = (props) => <List {...props} isKeyed={true} />;

export default KeyedList;
