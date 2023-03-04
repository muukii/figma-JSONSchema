const { widget } = figma;
const {
  AutoLayout,
  Text,
  Frame,
  Input,
  useSyncedState,
  usePropertyMenu,
  useEffect,
} = widget;
import * as Icons from "./icons";
import { JSONSchema7 } from "json-schema";

// const schema: JSONSchema = {
//   title: "foo",
//   type: "object",
//   properties: {
//     data: {
//       type: "array",
//       items: {
//         type: "object",
//         properties: {
//           image: {
//             type: "object",
//             required: ["url"],
//             properties: {
//               url: {
//                 type: "string",
//               },
//             },
//           },
//           deeplink: {
//             type: "string",
//           },
//         },
//         required: ["image", "deeplink"],
//       },
//     },
//     "": {
//       type: ["object"],
//       properties: {
//         "": {
//           type: "string",
//         },
//       },
//     },
//   },
//   required: ["data"],
// };

function Widget() {
  usePropertyMenu(
    [
      {
        itemType: "action",
        tooltip: "Settings",
        propertyName: "settings",
      },
    ],
    (event) => {
      switch (event.propertyName) {
        case "settings":
          return new Promise((resolve) => {
            figma.showUI(__uiFiles__.settings);
          });
          break;
      }
    }
  );

  const [schema, setSchema] = useSyncedState("schema", {
    type: "object",
  } as JSONSchema7);

  return entrypoint(schema, () => {
    console.log("schema", JSON.stringify(schema, null, 2));
    setSchema(schema);
  });
}

function entrypoint(schema: JSONSchema7, onChange: () => void) {
  let views: any[] = [];

  propertyView({
    inoutViews: views,
    indent: 0,
    schema,
    name: "root",
    onChange,
    onRename: () => {},
    onDelete: () => {},
  });
  return <VStack>{views.reverse()}</VStack>;
}

function viewObject(args: {
  inoutViews: any[];
  indent: number;
  schema: JSONSchema7;
  propertyName: string;
  onChange: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const { schema } = args;

  let properties: any[] = [];

  if (schema.properties) {
    properties = Object.entries(schema.properties).map(([name, member]) => {
      const _member = member as JSONSchema7;

      const isRequiredProperty = schema.required?.includes(name);
      const isNullable = _member.type?.includes("null");

      propertyView({
        inoutViews: args.inoutViews,
        indent: args.indent + 1,
        schema: _member,
        name: name,
        onChange: args.onChange,
        onRename: (newName) => {
          console.log("rename", name, newName);
          if (schema.properties) {
            schema.properties[newName] = schema.properties[name];
            delete schema.properties[name];
            args.onChange();
          }
        },
        onDelete: () => {
          if (schema.properties) {
            delete schema.properties[name];
            args.onChange();
          }
        },
      });
    });
  }

  args.inoutViews.push(
    <VStack
      key={args.propertyName}
      padding={{ left: 10 * args.indent }}
      width="fill-parent"
    >
      <HStack padding={{ bottom: 10 }} spacing={10} height="hug-contents">
        <Tag value="Object" />

        <Input
          placeholder={"name"}
          onTextEditEnd={(newValue) => {
            args.onRename(newValue.characters);
          }}
          value={args.propertyName}
          fill="#000"
        />

        <AddButton
          onClick={() => {
            const newPropertyName = "new property";

            let properties = schema.properties || {};

            // find distinct name with newPropertyName

            let i = 0;
            let found = true;
            let name = "";
            while (found == true) {
              name = `${newPropertyName} ${i}`;
              found = properties[name] != undefined;
              i++;
            }

            properties[name] = { type: "object" };
            schema.properties = properties;

            console.log("add", schema);

            args.onChange();
          }}
        />
        <RemoveButton
          onClick={() => {
            args.onDelete();
          }}
        />
        <UpButton onClick={() => {}} />
        <DownButton onClick={() => {}} />
      </HStack>
    </VStack>
  );
}

function propertyView(args: {
  inoutViews: any[];
  indent: number;
  schema: JSONSchema7;
  name?: string;
  onChange: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  if (args.schema.type === "object") {
    return viewObject({
      inoutViews: args.inoutViews,
      indent: args.indent,
      schema: args.schema,
      propertyName: args.name ?? "",
      onChange: args.onChange,
      onRename: args.onRename,
      onDelete: args.onDelete,
    });
  }

  return <Text onClick={() => {}}>Not implemented</Text>;
}

function Tag(props: { value: string }) {
  return <Text>{props.value}</Text>;
}

function VStack(props: AutoLayoutProps) {
  const composed = props;
  composed.direction = "vertical";
  return <AutoLayout {...composed} />;
}

function HStack(props: AutoLayoutProps) {
  const composed = props;
  composed.direction = "horizontal";
  return <AutoLayout {...composed} />;
}

function AddButton(props: { onClick: () => void }) {
  return (
    <AutoLayout
      onClick={() => {
        props.onClick();
      }}
      direction={"horizontal"}
    >
      {Icons.plus()}
    </AutoLayout>
  );
}

function RemoveButton(props: { onClick: () => void }) {
  return (
    <AutoLayout
      onClick={() => {
        props.onClick();
      }}
      direction={"horizontal"}
    >
      {Icons.remove()}
    </AutoLayout>
  );
}

function UpButton(props: { onClick: () => void }) {
  return (
    <AutoLayout
      onClick={() => {
        props.onClick();
      }}
      direction={"horizontal"}
    >
      {Icons.up()}
    </AutoLayout>
  );
}

function DownButton(props: { onClick: () => void }) {
  return (
    <AutoLayout
      onClick={() => {
        props.onClick();
      }}
      direction={"horizontal"}
    >
      {Icons.down()}
    </AutoLayout>
  );
}

widget.register(Widget);
