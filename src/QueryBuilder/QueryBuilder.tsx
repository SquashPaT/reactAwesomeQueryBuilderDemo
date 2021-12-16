import React, { useState } from "react";
import { Query, Builder, Utils as QbUtils } from "react-awesome-query-builder";
// types
import {
  JsonGroup,
  Config,
  ImmutableTree,
  BuilderProps,
} from "react-awesome-query-builder";

// For AntDesign widgets only:
import AntdConfig from "react-awesome-query-builder/lib/config/antd";
import MaterialConfig from "react-awesome-query-builder/lib/config/material";
//import "antd/dist/antd.css"; // or import "react-awesome-query-builder/css/antd.less";
// For Material-UI widgets only:
// import MaterialConfig from "react-awesome-query-builder/lib/config/material";

import AntdWidgets from "react-awesome-query-builder/lib/components/widgets/antd";
// import MaterialWidgets from 'react-awesome-query-builder/lib/components/widgets/material';
const { TextWidget, NumberWidget } = AntdWidgets;
import "react-awesome-query-builder/lib/css/styles.css";
import "react-awesome-query-builder/lib/css/compact_styles.css"; //optional, for more compact styles

// Choose your skin (ant/material/vanilla):
const InitialConfig = MaterialConfig; //AntdConfig; // or MaterialConfig or BasicConfig

// You need to provide your own config. See below 'Config format'
// add custom data types.
// add custom data types.
const config: Config = {
  ...InitialConfig,
  conjunctions: { ...InitialConfig.conjunctions },
  widgets: {
    ...InitialConfig.widgets,
    text: {
      type: "text",
      valueSrc: "value",
      factory: (props) => <TextWidget {...props} />,
      formatValue: (val, _fieldDef, _wgtDef, isForDisplay) =>
        isForDisplay ? val.toString() : JSON.stringify(val),
      mongoFormatValue: (val, _fieldDef, _wgtDef) => val,
      sqlFormatValue: (sqlValue) => {
        return sqlValue + "PAT";
      },
      // Options:
      valueLabel: "Text",
      valuePlaceholder: "Enter text",
      // Custom props (https://ant.design/components/input/):
      customProps: {
        maxLength: 10,
      },
    },
  },
  operators: {
    ...InitialConfig.operators,
    equal: {
      label: "test",
      reversedOp: "not_equal",
      labelForFormat: "===",
      cardinality: 1,
      formatOp: (field, _op, value, _valueSrc, _valueType, opDef) =>
        `${field} ${opDef.labelForFormat} ${value}`,
      mongoFormatOp: (field, op, value) => ({ [field]: { $eq: value } }),
    },
  },
  funcs: {
    lower: {
      label: "Lowercase",
      sqlFunc: "LOWER",
      mongoFunc: "$toLower",
      returnType: "text",
      args: {
        str: {
          type: "text",
          valueSources: ["value", "field"],
        },
      },
    },
  },
  fields: {
    qty: {
      label: "Qty",
      type: "number",
      fieldSettings: {
        min: 0,
      },
      valueSources: ["value"],
      preferWidgets: ["number"],
    },
    pat: {
      label: "pat",
      type: "text",
      fieldSettings: {},
      valueSources: ["value"],
      preferWidgets: ["text"],
    },
    reifen: {
      label: "Reifen",
      type: "number",
      fieldSettings: {
        min: 0,
      },
      valueSources: ["value"],
      preferWidgets: ["number"],
    },
    price: {
      label: "Price",
      type: "number",
      valueSources: ["value"],
      fieldSettings: {
        min: 10,
        max: 100,
      },
      preferWidgets: ["slider", "rangeslider"],
    },
    color: {
      label: "Color",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        listValues: [
          { value: "yellow", title: "Yellow" },
          { value: "green", title: "Green" },
          { value: "orange", title: "Orange" },
        ],
      },
    },
    is_promotion: {
      label: "Promo?",
      type: "boolean",
      operators: ["equal"],
      valueSources: ["value"],
    },
  },
};

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue: JsonGroup = { id: QbUtils.uuid(), type: "group" };

export const QueryBuilder: React.FC = () => {
  const [state, setState] = useState({
    tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
    config: config,
  });

  const onChange = (immutableTree: ImmutableTree, config: Config) => {
    // Tip: for better performance you can apply `throttle` - see `examples/demo`
    setState({ tree: immutableTree, config: config });

    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    // `jsonTree` can be saved to backend, and later loaded to `queryValue`
  };

  const renderBuilder = (props: BuilderProps) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  );

  return (
    <div>
      <h1>Query Builder</h1>
      <Query
        {...config}
        value={state.tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
      <div className="query-builder-result">
        {/* <div>
          Query string:{" "}
          <pre>
            {JSON.stringify(QbUtils.queryString(state.tree, state.config))}
          </pre>
        </div>
        <div>
          MongoDb query:{" "}
          <pre>
            {JSON.stringify(QbUtils.mongodbFormat(state.tree, state.config))}
          </pre>
        </div> */}
        <div>
          SQL where:{" "}
          <pre>
            {JSON.stringify(QbUtils.sqlFormat(state.tree, state.config))}
          </pre>
        </div>

        <div>
          JsonLogic:{" "}
          <pre>
            {JSON.stringify(QbUtils.jsonLogicFormat(state.tree, state.config))}
          </pre>
        </div>
      </div>
    </div>
  );
};
