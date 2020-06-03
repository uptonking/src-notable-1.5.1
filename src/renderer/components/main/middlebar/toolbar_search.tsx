import * as _ from "lodash";
import * as React from "react";
import { connect } from "overstated";
import Main from "@renderer/containers/main";

/** middlebar顶部的搜索条 */
class Search extends React.Component<
  { query: string; setQuery: Function; clear: any },
  {}
> {
  ref = React.createRef<HTMLInputElement>();

  componentDidUpdate() {
    if (!this.ref.current) return;

    if (this.props.query === this.ref.current.value) return;

    this.ref.current.value = this.props.query;
  }

  onChange = _.debounce(() => {
    if (!this.ref.current) return;

    this.props.setQuery(this.ref.current.value);
  }, 25);

  render() {
    const isSearching = !!this.props.query.length;

    return (
      <div className="multiple joined no-separators grow search">
        <input
          ref={this.ref}
          type="search"
          className="bordered grow small"
          placeholder="Search..."
          defaultValue={this.props.query}
          onChange={this.onChange}
        />
        <div
          className="label bordered compact xsmall"
          title={isSearching ? "Clear" : "Search"}
        >
          {/* 正在输入搜索词时右侧是x号关闭图标，否则默认是搜索放大镜图标 */}
          {isSearching ? (
            <i className="icon" onClick={this.props.clear}>
              close_circle
            </i>
          ) : (
            <i className="icon">magnify</i>
          )}
        </div>
      </div>
    );
  }
}

/* EXPORT */

export default connect({
  container: Main,
  selector: ({ container }) => ({
    query: container.search.getQuery(),
    setQuery: container.search.setQuery,
    clear: container.search.clear,
  }),
})(Search);
