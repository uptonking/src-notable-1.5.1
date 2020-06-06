import * as _ from "lodash";
import React from "react";
import { is } from "electron-util";
import { connect } from "overstated";
import Main from "@renderer/containers/main";
import UMonaco from "@renderer/utils/monaco";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import "monaco-editor/esm/vs/editor/contrib/dnd/dnd.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations.js";
import "monaco-editor/esm/vs/editor/contrib/multicursor/multicursor.js";
import "monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js";
import "monaco-editor/esm/vs/basic-languages/apex/apex.contribution.js";
import "monaco-editor/esm/vs/basic-languages/azcli/azcli.contribution.js";
import "monaco-editor/esm/vs/basic-languages/bat/bat.contribution.js";
import "monaco-editor/esm/vs/basic-languages/clojure/clojure.contribution.js";
import "monaco-editor/esm/vs/basic-languages/coffee/coffee.contribution.js";
import "monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js";
import "monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution.js";
import "monaco-editor/esm/vs/basic-languages/csp/csp.contribution.js";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution.js";
import "monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js";
import "monaco-editor/esm/vs/basic-languages/fsharp/fsharp.contribution.js";
import "monaco-editor/esm/vs/basic-languages/go/go.contribution.js";
import "monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution.js";
import "monaco-editor/esm/vs/basic-languages/handlebars/handlebars.contribution.js";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution.js";
import "monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js";
import "monaco-editor/esm/vs/basic-languages/java/java.contribution.js";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/kotlin/kotlin.contribution.js";
import "monaco-editor/esm/vs/basic-languages/less/less.contribution.js";
import "monaco-editor/esm/vs/basic-languages/lua/lua.contribution.js";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js";
import "monaco-editor/esm/vs/basic-languages/msdax/msdax.contribution.js";
import "monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution.js";
import "monaco-editor/esm/vs/basic-languages/objective-c/objective-c.contribution.js";
import "monaco-editor/esm/vs/basic-languages/pascal/pascal.contribution.js";
import "monaco-editor/esm/vs/basic-languages/perl/perl.contribution.js";
import "monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution.js";
import "monaco-editor/esm/vs/basic-languages/php/php.contribution.js";
import "monaco-editor/esm/vs/basic-languages/postiats/postiats.contribution.js";
import "monaco-editor/esm/vs/basic-languages/powerquery/powerquery.contribution.js";
import "monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution.js";
import "monaco-editor/esm/vs/basic-languages/pug/pug.contribution.js";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution.js";
import "monaco-editor/esm/vs/basic-languages/r/r.contribution.js";
import "monaco-editor/esm/vs/basic-languages/razor/razor.contribution.js";
import "monaco-editor/esm/vs/basic-languages/redis/redis.contribution.js";
import "monaco-editor/esm/vs/basic-languages/redshift/redshift.contribution.js";
import "monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution.js";
import "monaco-editor/esm/vs/basic-languages/rust/rust.contribution.js";
import "monaco-editor/esm/vs/basic-languages/sb/sb.contribution.js";
import "monaco-editor/esm/vs/basic-languages/scheme/scheme.contribution.js";
import "monaco-editor/esm/vs/basic-languages/scss/scss.contribution.js";
import "monaco-editor/esm/vs/basic-languages/shell/shell.contribution.js";
import "monaco-editor/esm/vs/basic-languages/solidity/solidity.contribution.js";
import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js";
import "monaco-editor/esm/vs/basic-languages/st/st.contribution.js";
import "monaco-editor/esm/vs/basic-languages/swift/swift.contribution.js";
import "monaco-editor/esm/vs/basic-languages/tcl/tcl.contribution.js";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js";
import "monaco-editor/esm/vs/basic-languages/vb/vb.contribution.js";
import "monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";

interface MonacoProps {
  filePath: string;
  language: string;
  theme: string;
  value: string;
  editorOptions?: monaco.editor.IEditorOptions;
  modelOptions?: monaco.editor.ITextModelUpdateOptions;
  className?: string;
  editorWillMount?: Function;
  editorDidMount?: Function;
  editorWillUnmount?: Function;
  editorDidUnmount?: Function;
  editorWillChange?: Function;
  onBlur?: Function;
  onFocus?: Function;
  onChange?: Function;
  onUpdate?: Function;
  onScroll?: Function;
  container: IMain;
}

/**
 * 根据微软Monaco编辑器封装成的组件，render返回的只是一个div。
 * 主要涉及react组件的生命周期、editor的生命周期、monaco的生命周期，周期包括初始化、更新、卸载。
 * 其中componentWillMount中会初始化Monaco，Monaco的操作逻辑在utils/monaco.ts文件。
 */
class Monaco extends React.Component<MonacoProps, {}> {
  /** render中返回div的DOM节点的引用 */
  ref = React.createRef<HTMLDivElement>();
  /** 编辑器对象 */
  editor?: MonacoEditor;
  _currentValue: string = "";
  _currentChangeDate: Date | undefined = undefined;
  _preventOnChangeEvent: boolean = false;
  _onChangeDebounced?: Function;
  _zoneTopId?: number;

  componentWillMount() {
    // 设置manoco的默认主题、md分词器
    UMonaco.init();

    if (this.props.onChange) {
      this._onChangeDebounced = _.debounce(this.props.onChange as any, 25); //TSC
    }

    this._currentChangeDate = undefined;
    this._currentChangeDate = undefined;

    $.$window.on("monaco:update", this.editorUpdateDebounced);
  }

  componentDidMount() {
    this._currentValue = this.props.value;

    // 组件首次挂载，会初始化编辑器
    this.initMonaco();
  }

  componentDidUpdate(prevProps) {
    this.editorUpdate();

    if (this.props.value !== this._currentValue)
      this.updateValue(this.props.value);

    if (prevProps.language !== this.props.language)
      this.updateLanguage(this.props.language);

    if (prevProps.theme !== this.props.theme)
      this.updateTheme(this.props.theme);

    if (
      this.props.editorOptions &&
      !_.isEqual(prevProps.editorOptions, this.props.editorOptions)
    )
      this.updateEditorOptions(this.props.editorOptions);

    if (
      this.props.modelOptions &&
      !_.isEqual(prevProps.modelOptions, this.props.modelOptions)
    )
      this.updateModelOptions(this.props.modelOptions);
  }

  componentWillUnmount() {
    $.$window.off("monaco:update", this.editorUpdateDebounced);

    this.destroyMonaco();
  }

  shouldComponentUpdate(nextProps) {
    //TODO: Most of these update* functions should run in `componentDidMount`, but ensuring that the "value" doesn't get reset unnecessarily

    this.editorUpdate();

    if (nextProps.filePath !== this.props.filePath) this.editorWillChange();

    if (nextProps.language !== this.props.language)
      this.updateLanguage(nextProps.language);

    if (nextProps.theme !== this.props.theme) this.updateTheme(nextProps.theme);

    if (
      nextProps.editorOptions &&
      !_.isEqual(this.props.editorOptions, nextProps.editorOptions)
    )
      this.updateEditorOptions(nextProps.editorOptions);

    if (
      nextProps.modelOptions &&
      !_.isEqual(this.props.modelOptions, nextProps.modelOptions)
    )
      this.updateModelOptions(nextProps.modelOptions);

    return (
      nextProps.value !== this.props.value &&
      nextProps.value !== this._currentValue
    ); //FIXME: This check might not be perfect
  }

  /* EDITOR LIFECYCLE */

  // 在initMonaco()中被调用
  editorWillMount() {
    const { editorWillMount } = this.props;

    if (!editorWillMount) return;

    return editorWillMount(monaco);
  }

  editorDidMount(editor: MonacoEditor) {
    const {
      editorDidMount,
      editorDidUnmount,
      onBlur,
      onFocus,
      onScroll,
    } = this.props;

    editor.onDidChangeModel(() => {
      delete this._zoneTopId; // Zones are reset when changing the model

      this.editorUpdate();
    });

    if (editorDidMount) {
      editorDidMount(editor, monaco);
    }

    if (onBlur) {
      editor.onDidBlurEditorWidget(onBlur as any); //TSC
    }

    if (onFocus) {
      editor.onDidFocusEditorWidget(onFocus as any); //TSC
    }

    if (onScroll) {
      editor.onDidScrollChange(_.debounce(onScroll as any, 25)); //TSC
    }

    if (editorDidUnmount) {
      editor.onDidDispose(editorDidUnmount as any); //TSC
    }

    editor.onDidChangeModelContent((event) => {
      const value = editor.getValue();

      this._currentValue = value;
      this._currentChangeDate = new Date();

      if (this._onChangeDebounced && !this._preventOnChangeEvent) {
        this._onChangeDebounced(value, event);
      }
    });
  }

  editorWillUnmount = () => {
    if (this.props.editorWillUnmount) {
      this.props.editorWillUnmount();
    }
  };

  editorWillChange = () => {
    if (this.props.editorWillChange) {
      this.props.editorWillChange();
    }
  };

  editorUpdate = () => {
    if (!this.editor) return;

    this.editor.layout();
    this.editorUpdateZones();
  };

  editorUpdateDebounced = _.debounce(this.editorUpdate, 25);

  editorUpdateZones = () => {
    if (!this.editor) return;

    const needTopZone =
      is.macos &&
      this.props.container.window.isZen() &&
      !this.props.container.window.isFullscreen();

    if (needTopZone) {
      if (this._zoneTopId) return;

      this.editor.changeViewZones((accessor) => {
        this._zoneTopId = accessor.addZone({
          domNode: document.createElement("div"),
          afterLineNumber: 0,
          heightInPx: 38,
          suppressMouseDown: true,
        });
      });
    } else {
      if (!this._zoneTopId) return;

      this.editor.changeViewZones((accessor) => {
        accessor.removeZone(this._zoneTopId as number); //TSC
        delete this._zoneTopId;
      });
    }
  };

  /* MONACO LIFECYCLE */

  /**
   * 初始化编辑器，给editor对象传递文件路径及元数据
   */
  initMonaco() {
    const { language, theme, value, editorOptions, modelOptions } = this.props;
    const dynamicOptions = this.editorWillMount();
    const finalEditorOptions =
      editorOptions || dynamicOptions
        ? _.merge(
            {},
            UMonaco.editorOptions,
            editorOptions || {},
            dynamicOptions || {},
            { model: null }
          )
        : UMonaco.editorOptions;

    // 实例化
    this.editor = (monaco.editor.create(
      this.ref.current!,
      finalEditorOptions
    ) as unknown) as MonacoEditor; //TSC //UGLY

    this.editor.getFilePath = () => this.props.filePath; //UGlY
    this.editor.getChangeDate = () => this._currentChangeDate; //UGlY

    if (theme) {
      monaco.editor.setTheme(theme);
    }

    //
    const model = monaco.editor.createModel(value, language);

    if (model) {
      const finalModelOptions = modelOptions
        ? _.merge({}, UMonaco.modelOptions, modelOptions || {})
        : UMonaco.modelOptions;

      model.updateOptions(finalModelOptions);
    }

    this.editor.setModel(model);

    this.editorUpdateZones();

    this.editorDidMount(this.editor);
  }

  destroyMonaco() {
    this.editorWillUnmount();

    if (!this.editor) return;

    this.editor.dispose();

    delete this.editor;
  }

  /* UPDATE */

  updateValue(value: string) {
    this._currentValue = value;

    if (!this.editor) return;

    this._preventOnChangeEvent = true;

    this.editor.setValue(this._currentValue);

    if (this.props.onUpdate) {
      this.props.onUpdate(this._currentValue);
    }

    this._preventOnChangeEvent = false;
  }

  updateLanguage(language: string) {
    if (!this.editor) return;

    const model = this.editor.getModel();

    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }
  }

  updateTheme(theme: string) {
    monaco.editor.setTheme(theme);
  }

  updateEditorOptions(editorOptions: monaco.editor.IEditorOptions) {
    if (!this.editor) return;

    this.editor.updateOptions(editorOptions);
  }

  updateModelOptions(modelOptions: monaco.editor.ITextModelUpdateOptions) {
    if (!this.editor) return;

    const model = this.editor.getModel();

    if (model) {
      model.updateOptions(modelOptions);
    }
  }

  render() {
    const { className } = this.props;

    return (
      <div
        ref={this.ref}
        className={`monaco-editor-wrapper ${className || ""}`}
      />
    );
  }
}

export default connect({
  container: Main,
  selector: ({ containers, container, ...others }) => ({
    container,
    ...others,
  }), //UGLY: We have to filter out `containers`, because otherwise the component will re-render as the previous and new `containers` won't technically be the same object
})(Monaco);
