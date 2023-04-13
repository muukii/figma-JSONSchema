const { widget } = figma;
const {
  AutoLayout,
  Text,
  Frame,
  Input,
  Span,
  useSyncedState,
  usePropertyMenu,
  useEffect,
} = widget;
import { AddButton, DownButton, UpButton, RemoveButton } from "./buttons";

import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7TypeName,
} from "json-schema";
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

type DisplayMode = "preview" | "editing";

function Widget() {
  const [schema, setSchema] = useSyncedState("schema", {
    type: "object",
  } as JSONSchema7);

  const [displayMode, setDisplayMode] = useSyncedState(
    "displayMode",
    "preview" as DisplayMode
  );

  usePropertyMenu(
    [
      {
        itemType: "action",
        tooltip: "Edit Mode",
        propertyName: "use-edit-mode",
      },
      {
        itemType: "action",
        tooltip: "Preview Mode",
        propertyName: "use-preview-mode",
      },
      {
        itemType: "action",
        tooltip: "Code Editor",
        propertyName: "settings",
      },
    ],
    (event) => {
      switch (event.propertyName) {
        case "use-edit-mode":
          setDisplayMode("editing");
          return;
        case "use-preview-mode":
          setDisplayMode("preview");
          return;
        case "settings":
          return new Promise((resolve) => {
            figma.showUI(__uiFiles__.settings, {
              width: 800,
              height: 400,
              title: "Schema JSON",
            });
            figma.ui.postMessage({
              type: "schema-json",
              code: JSON.stringify(schema, null, 2),
            });
            figma.ui.onmessage = (message) => {
              if (message.type === "editor.onChange") {
                console.log("message", message.schema);
                setSchema(message.schema);
              }
            };
          });
      }
    }
  );

  return entrypoint(schema, displayMode, () => {
    console.log("schema", JSON.stringify(schema, null, 2));
    setSchema(schema);
  });
}

function entrypoint(
  schema: JSONSchema7,
  displayMode: DisplayMode,
  onChange: () => void
) {
  let views: any[] = [];

  propertyView({
    inoutViews: views,
    indent: 0,
    schema,
    displayMode: displayMode,
    named: null,
    setNeedsDisplay: onChange,
    onDelete: () => {},
  });

  console.log(views.length);

  return (
    <VStack
      stroke={"#D4D4D4"}
      fill={"#FFFFFF"}
      padding={24}
      cornerRadius={8}
      width="hug-contents"
    >
      {views}
    </VStack>
  );
}

type Named = {
  name: string;
  onRename: (name: string) => void;
};

type Context = {
  inoutViews: any[];
  indent: number;
  schema: JSONSchema7;
  named: Named | null;
  displayMode: DisplayMode;
  setNeedsDisplay: () => void;
  onDelete: () => void;
};

function arrayView(context: Context) {
  switch (context.displayMode) {
    case "preview":
      return (
        <>
          <TypeLabel isSelected={true} value="array" onClick={() => {}} />
        </>
      );
    case "editing":
      return (
        <>
          <TypeSelection
            type="array"
            onClick={(type) => rotateType(type, context)}
          />

          <RemoveButton
            onClick={() => {
              context.onDelete();
            }}
          />
        </>
      );
  }
}

function compositionValueSectionView(args: {
  displayMode: DisplayMode;
  type: ProperyType;
  onClickTag: (ProperyType) => void;
  onClickAdd: () => void;
  onClickRemove: () => void;
}) {
  switch (args.displayMode) {
    case "preview":
      return (
        <>
          <TypeLabel value={args.type} isSelected={true} onClick={() => {}} />
        </>
      );
    case "editing":
      return (
        <>
          <TypeSelection
            type={args.type}
            onClick={(type) => args.onClickTag(type)}
          />
          <AddButton onClick={args.onClickAdd} />
          <RemoveButton onClick={args.onClickRemove} />
        </>
      );
  }
}

function primitiveValueSectionView(context: Context) {
  const typeLabel = context.schema.type?.toString() || "unknown";

  switch (context.displayMode) {
    case "preview":
      return (
        <TypeLabel
          isSelected={true}
          value={typeLabel as ProperyType}
          onClick={() => {}}
        />
      );
    case "editing":
      return (
        <>
          <TypeSelection
            type={typeLabel as ProperyType}
            onClick={(type) => rotateType(type, context)}
          />

          <RemoveButton
            onClick={() => {
              context.onDelete();
            }}
          />
        </>
      );
  }
}

function propertyView(context: Context) {
  function push(view: any) {
    const propertyNameView = (() => {
      if (context.named) {
        return (
          <PropertyName
            value={context.named.name}
            onEdit={(newValue) => {
              context.named!.onRename(newValue);
            }}
          />
        );
      } else {
        return <></>;
      }
    })();

    context.inoutViews.push(
      <Section indent={context.indent} key={""}>
        {propertyNameView}

        {view}
      </Section>
    );
  }

  if (context.schema.type == "integer") {
    push(primitiveValueSectionView(context));
    return;
  }

  if (context.schema.type === "number") {
    push(primitiveValueSectionView(context));
    return;
  }

  if (context.schema.type === "boolean") {
    push(primitiveValueSectionView(context));
    return;
  }

  if (context.schema.type === "object") {
    push(
      compositionValueSectionView({
        displayMode: context.displayMode,
        type: "object",
        onClickTag: (type) => {
          rotateType(type, context);
        },
        onClickAdd: () => {
          const newPropertyName = "<#Property Name#>";

          let properties = context.schema.properties || {};

          // find distinct name with newPropertyName

          let i = 0;
          let found = true;
          let name = "";
          while (found == true) {
            name = `<#Property Name ${i}#>`;
            found = properties[name] != undefined;
            i++;
          }

          properties[name] = { type: "object" };
          context.schema.properties = properties;

          console.log("add", context.schema);

          context.setNeedsDisplay();
        },
        onClickRemove: context.onDelete,
      })
    );

    if (context.schema.properties) {
      Object.entries(context.schema.properties).map(([name, member]) => {
        const _member = member as JSONSchema7;

        const isRequiredProperty = context.schema.required?.includes(name);
        const isNullable = _member.type?.includes("null");

        propertyView({
          inoutViews: context.inoutViews,
          indent: context.indent + 1,
          schema: _member,
          displayMode: context.displayMode,
          named: {
            name,
            onRename: (newName) => {
              if (name == newName) return;

              console.log("rename", name, newName);

              if (context.schema.properties) {
                context.schema.properties[newName] =
                  context.schema.properties[name];
                delete context.schema.properties[name];
                context.setNeedsDisplay();
              }
            },
          },
          setNeedsDisplay: context.setNeedsDisplay,
          onDelete: () => {
            if (context.schema.properties) {
              delete context.schema.properties[name];
              context.setNeedsDisplay();
            }
          },
        });
      });
    }

    return;
  }

  if (context.schema.type === "array") {
    push(arrayView(context));

    if (context.schema.items) {
      if (Array.isArray(context.schema.items)) {
        context.schema.items.forEach((item) => {
          propertyView({
            inoutViews: context.inoutViews,
            indent: context.indent + 1,
            schema: item as JSONSchema7,
            named: null,
            displayMode: context.displayMode,
            setNeedsDisplay: context.setNeedsDisplay,
            onDelete: () => {
              // remove _member from array
              let array = context.schema.items as JSONSchema7Definition[];
              const index = array.indexOf(item);
              array.splice(index, 1);

              context.setNeedsDisplay();
            },
          });
        });
      } else if (typeof context.schema.items === "object") {
        propertyView({
          inoutViews: context.inoutViews,
          indent: context.indent + 1,
          schema: context.schema.items as JSONSchema7,
          displayMode: context.displayMode,
          named: null,
          setNeedsDisplay: context.setNeedsDisplay,
          onDelete: () => {},
        });
      }
    }

    return;
  }

  if (context.schema.oneOf) {
    push(
      compositionValueSectionView({
        displayMode: context.displayMode,
        type: "oneOf",
        onClickTag: (type) => {
          rotateType(type, context);
        },
        onClickAdd: () => {
          let schemas = context.schema.oneOf || [];

          schemas.push({ type: "object" });
          context.schema.oneOf = schemas;

          context.setNeedsDisplay();
        },
        onClickRemove: () => {},
      })
    );

    if (context.schema.oneOf) {
      context.schema.oneOf.forEach((member) => {
        const _member = member as JSONSchema7;

        propertyView({
          inoutViews: context.inoutViews,
          indent: context.indent + 1,
          schema: _member,
          named: null,
          displayMode: context.displayMode,
          setNeedsDisplay: context.setNeedsDisplay,
          onDelete: () => {
            // remove _member from array
            const index = context.schema.oneOf!.indexOf(_member);
            context.schema.oneOf!.splice(index, 1);
            context.setNeedsDisplay();
          },
        });
      });
    }

    return;
  }

  if (context.schema.type === "string") {
    push(primitiveValueSectionView(context));
    return;
  }

  push(<Text onClick={() => {}}>Not implemented</Text>);
}

type ProperyType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "oneOf";

function TypeLabel(props: {
  isSelected: boolean;
  value: ProperyType;
  onClick: () => void;
}) {
  return (
    <HStack
      opacity={props.isSelected ? 1 : 0.5}
      onClick={props.onClick}
      padding={{ horizontal: 8, vertical: 4 }}
      cornerRadius={4}
      fill="#4f47e612"
    >
      <Text fill={"#4f47e6"}>{props.value}</Text>
    </HStack>
  );
}

function rotateType(targetType: ProperyType, context: Context) {
  // to use same reference

  Object.getOwnPropertyNames(context.schema)
    .filter((key) => key !== "type")
    .forEach((key) => {
      delete (context.schema as any)[key];
    });

  switch (targetType) {
    case "object":
      context.schema.type = "object";
      delete context.schema.oneOf;
      break;
    case "number":
      context.schema.type = "number";
      delete context.schema.oneOf;
      break;
    case "integer":
      context.schema.type = "integer";
      delete context.schema.oneOf;
      break;
    case "boolean":
      context.schema.type = "boolean";
      delete context.schema.oneOf;
      break;
    case "array":
      context.schema.type = "array";
      context.schema.items = { type: "object" };
      delete context.schema.oneOf;
      break;
    case "string":
      context.schema.type = "string";
      delete context.schema.oneOf;
    case "oneOf":
      context.schema.oneOf = [];
      delete context.schema.type;
      break;
  }

  console.log("rotate", context.schema);
  context.setNeedsDisplay();
}

function TypeSelection(props: {
  type: ProperyType;
  onClick: (type: ProperyType) => void;
}) {
  return (
    <HStack spacing={8}>
      {(
        [
          "object",
          "array",
          "string",
          "number",
          "integer",
          "boolean",
          "oneOf",
        ] as ProperyType[]
      ).map((type) => (
        <TypeLabel
          value={type}
          isSelected={props.type == type}
          onClick={() => {
            props.onClick(type);
          }}
        />
      ))}
    </HStack>
  );
}

function Section(props: { indent: number } & AutoLayoutProps) {
  const composed = props;
  composed.padding = {
    top: 6,
    bottom: 6,
  };
  composed.direction = "horizontal";

  const width = props.indent;

  const indent = Array.from({ length: width }, (_, i) => (
    <VStack padding={8}>
      <Frame
        width={4}
        height={4}
        fill="#000"
        opacity={i == width - 1 ? 0.3 : 0.1}
        cornerRadius={2}
      />
    </VStack>
  ));

  return (
    <AutoLayout
      verticalAlignItems="center"
      horizontalAlignItems={"center"}
      {...composed}
      spacing={8}
    >
      {indent}
      {props.children}
    </AutoLayout>
  );
}

function PropertyName(props: {
  value: string;
  onEdit: (newValue: string) => void;
}) {
  // check if value contains token
  const isToken = props.value.startsWith("<#") && props.value.endsWith("#>");
  return (
    <Input
      placeholder={"name"}
      onTextEditEnd={(newValue) => {
        props.onEdit(newValue.characters);
      }}
      value={isToken ? null : props.value}
      fill="#2b2b2b"
    />
  );
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

widget.register(Widget);
