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

import { JSONSchema7, JSONSchema7Definition } from "json-schema";
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
  const [schema, setSchema] = useSyncedState("schema", {
    type: "object",
  } as JSONSchema7);

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
  setNeedsDisplay: () => void;
  onDelete: () => void;
};

function arrayView(context: Context) {
  return (
    <>
      <Tag
        value="array"
        onClick={() => {
          rotateType(context);
        }}
      />

      <RemoveButton
        onClick={() => {
          context.onDelete();
        }}
      />
    </>
  );
}

function compositionValueSectionView(args: {
  label: string;
  onClickTag: () => void;
  onClickAdd: () => void;
  onClickRemove: () => void;
  onClickUp: () => void;
  onClickDown: () => void;
}) {
  return (
    <>
      <Tag value={args.label} onClick={args.onClickTag} />
      <AddButton onClick={args.onClickAdd} />
      <RemoveButton onClick={args.onClickRemove} />
    </>
  );
}

function primitiveValueSectionView(context: Context) {
  const typeLabel = context.schema.type?.toString() || "unknown";

  return (
    <>
      <Tag
        value={typeLabel}
        onClick={() => {
          rotateType(context);
        }}
      />

      <RemoveButton
        onClick={() => {
          context.onDelete();
        }}
      />
    </>
  );
}

function rotateType(context: Context) {
  // to use same reference

  if (context.schema.oneOf) {
    context.schema.type = "object";
    delete context.schema.oneOf;
  } else {
    Object.getOwnPropertyNames(context.schema)
      .filter((key) => key !== "type")
      .forEach((key) => {
        delete (context.schema as any)[key];
      });

    switch (context.schema.type) {
      case "object":
        context.schema.type = "number";
        break;
      case "number":
        context.schema.type = "integer";
        break;
      case "integer":
        context.schema.type = "boolean";
        break;
      case "boolean":
        context.schema.type = "array";
        context.schema.items = { type: "object" };
        break;
      case "array":
        context.schema.type = "string";
        break;
      case "string":
        context.schema.oneOf = [];
        delete context.schema.type;
        break;
      default:
        context.schema.type = "object";
        break;
    }
  }

  console.log("rotate", context.schema);
  context.setNeedsDisplay();
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
        label: "object",
        onClickTag: () => {
          rotateType(context);
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
        onClickUp: () => {},
        onClickDown: () => {},
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
        label: "oneOf",
        onClickTag: () => {
          rotateType(context);
        },
        onClickAdd: () => {
          let schemas = context.schema.oneOf || [];

          schemas.push({ type: "object" });
          context.schema.oneOf = schemas;

          context.setNeedsDisplay();
        },
        onClickRemove: () => {},
        onClickUp: () => {},
        onClickDown: () => {},
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

function Tag(props: { value: string; onClick: () => void }) {
  return (
    <HStack
      onClick={props.onClick}
      padding={{ horizontal: 8, vertical: 4 }}
      cornerRadius={4}
      fill="#4f47e612"
    >
      <Text fill={"#4f47e6"}>{props.value}</Text>
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
