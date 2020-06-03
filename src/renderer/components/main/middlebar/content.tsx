import * as React from "react";
import { connect } from "overstated";
import Main from "@renderer/containers/main";
import KeyedList from "@renderer/components/main/structures/keyed_list";
import Note from "./note";

const getHeight = () => window.innerHeight - 65, //UGLY: But it gets the job done, quickly
  getItemKey = (note) => note.filePath;

/**
 * middlebar的note标题列表
 */
const Content = ({ isLoading, notes }) => {
  if (isLoading) return null;

  return (
    <KeyedList
      className="list-notes layout-content"
      data={notes}
      getHeight={getHeight}
      getItemKey={getItemKey}
      fallbackEmptyMessage="No notes found"
    >
      {Note}
    </KeyedList>
  );
};

export default connect({
  container: Main,
  selector: ({ container }) => ({
    isLoading: container.loading.get(),
    notes: container.search.getNotes(),
  }),
})(Content);
