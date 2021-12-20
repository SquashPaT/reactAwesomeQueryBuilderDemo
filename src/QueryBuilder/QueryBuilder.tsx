import React, { useState } from "react";
import moment from "moment";
import {
  Query,
  Builder,
  Utils as QbUtils,
  OperatorProximity,
  DateTimeFieldSettings,
  Utils,
} from "react-awesome-query-builder";
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
const demoListValues = [
  { title: "A", value: "a" },
  { title: "AA", value: "aa" },
  { title: "AAA1", value: "aaa1" },
  { title: "AAA2", value: "aaa2" },
  { title: "B", value: "b" },
  { title: "C", value: "c" },
  { title: "D", value: "d" },
  { title: "E", value: "e" },
  { title: "F", value: "f" },
  { title: "G", value: "g" },
  { title: "H", value: "h" },
  { title: "I", value: "i" },
  { title: "J", value: "j" },
];
const { simulateAsyncFetch } = Utils;
const simulatedAsyncFetch = simulateAsyncFetch(demoListValues, 3);
// Choose your skin (ant/material/vanilla):
const InitialConfig = MaterialConfig; //AntdConfig; // or MaterialConfig or BasicConfig

const proximity: OperatorProximity = {
  ...InitialConfig.operators.proximity,
  valueLabels: [
    { label: "Word 1", placeholder: "Enter first word" },
    { label: "Word 2", placeholder: "Enter second word" },
  ],
  textSeparators: [
    //'Word 1',
    //'Word 2'
  ],
  options: {
    ...InitialConfig.operators.proximity.options,
    optionLabel: "Near", // label on top of "near" selectbox (for config.settings.showLabels==true)
    optionTextBefore: "Near", // label before "near" selectbox (for config.settings.showLabels==false)
    optionPlaceholder: "Select words between", // placeholder for "near" selectbox
    minProximity: 2,
    maxProximity: 10,
    defaults: {
      proximity: 2,
    },
    customProps: {},
  },
};
// You need to provide your own config. See below 'Config format'
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
  types: {
    ...InitialConfig.types,
    time: {
      valueSources: ["value", "field", "func"],
      defaultOperator: "equal",
      widgets: {
        time: {
          operators: ["equal", "between"],
          widgetProps: {
            valuePlaceholder: "Time",
            timeFormat: "h:mm:ss A",
            use12Hours: true,
          },
          opProps: {
            between: {
              valueLabels: ["Time from", "Time to"],
            },
          },
        },
      },
    },
  },
  operators: {
    ...InitialConfig.operators,
    equal: {
      label: "testEqual",
      reversedOp: "not_equal",
      labelForFormat: "==",
      cardinality: 1,
      formatOp: (field, _op, value, _valueSrc, _valueType, opDef) =>
        `${field} ${opDef.labelForFormat} ${value}`,
      mongoFormatOp: (field, op, value) => ({ [field]: { $eq: value } }),
    },
    proximity,
    between: {
      ...InitialConfig.operators.between,
      valueLabels: ["Value from", "Value to"],
      textSeparators: ["from", "to"],
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
          type: "time",
          valueSources: ["value", "field"],
        },
      },
    },
  },
  fields: {
    bio: {
      label: "Bio",
      type: "text",
      preferWidgets: ["textarea"],
      fieldSettings: {
        maxLength: 1000,
      },
    },
    qty: {
      label: "Qty",
      type: "number",
      fieldSettings: {
        min: 0,
      },
      valueSources: ["value"],
      preferWidgets: ["number"],
    },
    time: {
      label: "time",
      type: "time",
      fieldSettings: {
        min: 0,
      },
      valueSources: ["value"],
      preferWidgets: ["number"],
    },
    tiger: {
      label: "tiger",
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
    date: {
      label: "Date",
      type: "date",
      valueSources: ["value"],
      fieldSettings: {
        dateFormat: "DD-MM-YYYY",
        validateValue: (val, fieldSettings: DateTimeFieldSettings) => {
          // example of date validation
          const dateVal = moment(val, fieldSettings.valueFormat);
          return dateVal.year() != new Date().getFullYear()
            ? "Please use current year"
            : null;
        },
      },
    },
    color: {
      label: "Color",
      type: "select",
      valueSources: ["value"],
      funcs: ["Lowercase"],
      fieldSettings: {
        listValues: [
          { value: "YELLOW", title: "YELLOW" },
          { value: "GREEN", title: "GREEN" },
          { value: "ORANGE", title: "ORANGE" },
        ],
      },
    },
    autocomplete: {
      label: "SomeName",
      type: "select",
      valueSources: ["value"],
      fieldSettings: {
        asyncFetch: simulatedAsyncFetch,
        useAsyncSearch: true,
        useLoadMore: true,
        forceAsyncSearch: false,
        allowCustomValues: true,
      },
    },
    stock: {
      label: "In stock",
      type: "boolean",
      defaultValue: true,
      mainWidgetProps: {
        labelYes: "+",
        labelNo: "-",
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
