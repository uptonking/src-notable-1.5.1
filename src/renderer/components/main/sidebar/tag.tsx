import * as _ from "lodash";
import * as React from "react";
import { connect } from "overstated";
import Main from "@renderer/containers/main";

/**
 * 每个根节点开始的顶级tag子树
 */
const Tag = ({ style, tag, level, isLeaf, isActive, set, toggleCollapse }) => {
  if (!tag) return null;

  const { name, path, collapsed, notes, icon, iconCollapsed } = tag,
    isRoot = level === 0,
    onClick = isActive ? _.noop : () => set(path),
    onCollapserClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleCollapse(path);
    };

  return (
    <div
      style={style}
      className={`tag ${
        isActive ? "active" : ""
      } level-${level} button list-item`}
      data-tag={path}
      data-has-children={!isLeaf}
      data-collapsed={collapsed}
      onClick={onClick}
    >
      {/* 是否折叠的标签 */}
      {isRoot ? (
        <i className="icon xsmall">
          {collapsed ? iconCollapsed || "tag_multiple" : icon || "tag"}
        </i>
      ) : null}
      {/* 非根节点，且非叶节点时的状态 */}
      {!isRoot && (!isLeaf || collapsed) ? (
        <i
          className={`icon xsmall collapser ${collapsed ? "rotate--90" : ""}`}
          onClick={onCollapserClick}
        >
          chevron_down
        </i>
      ) : null}{" "}
      {/* TODO: The collapser isn't animated because the whole list gets re-rendered */}
      {/* 非根节点，且是叶节点， 且非展开时的状态 */}
      {!isRoot && isLeaf && !collapsed ? (
        <i className="icon xsmall">invisible</i>
      ) : null}
      <span className="title small">{name}</span>
      {notes.length ? (
        <span className="counter xxsmall">{notes.length}</span>
      ) : null}
    </div>
  );
};

/* EXPORT */

export default connect({
  container: Main,
  selector: ({ container, style, itemKey, level, isLeaf }) => {
    const tag = container.tag.get(itemKey);

    if (!tag) return {};

    return {
      tag,
      style,
      level,
      isLeaf,
      isActive: container.tag.get() === tag,
      set: container.tag.set,
      toggleCollapse: container.tag.toggleCollapse,
    };
  },
})(Tag);
