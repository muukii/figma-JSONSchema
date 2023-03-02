const { widget } = figma;
const { AutoLayout, Frame, Input } = widget;
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

type Member = JSONObject | JSONArray | JSONString | JSONNumber | JSONBoolean;

type JSONObject = {
  type: "object";
  name: string;
  properties: Record<string, Member>;
};

type JSONNumber = {
  type: "number";
  name: string;
};

type JSONArray = {
  type: "array";
  name: string;
};

type JSONString = {
  type: "string";
  name: string;
};

type JSONBoolean = {
  type: "boolean";
  name: string;
};

function view(schema: JSONSchema7, name: string, nested: boolean = false) {
  if (schema.type === "object") {
  }

  let properties: any[] = [];

  if (schema.properties) {
    properties = Object.entries(schema.properties).map(([name, member]) => {
      const _member = member as JSONSchema7;

      const isRequiredProperty = schema.required?.includes(name);
      const isNullable = _member.type?.includes("null");

      return view(_member, name, true);
    });
  }

  return (
    <AutoLayout direction={"vertical"} padding={{ left: nested ? 10 : 0 }}>
      <AutoLayout
        direction={"horizontal"}
        padding={{ bottom: 10 }}
        height="hug-contents"
      >
        <Input placeholder={"name"} onTextEditEnd={() => {}} value={name} />
        <AutoLayout onClick={() => {}} direction={"horizontal"}>
          {Icons.plus()}
        </AutoLayout>
        <AutoLayout onClick={() => {}} direction={"horizontal"}>
          {Icons.remove()}
        </AutoLayout>
        <AutoLayout onClick={() => {}} direction={"horizontal"}>
          {Icons.up()}
        </AutoLayout>
        <AutoLayout onClick={() => {}} direction={"horizontal"}>
          {Icons.down()}
        </AutoLayout>
      </AutoLayout>

      {properties}
    </AutoLayout>
  );
}

function Widget() {
  return view(
    {
      title: "SearchPartner",
      "x-stoplight": {
        id: "ok8jf7zdntwf1",
      },
      type: "object",
      description:
        "DUX Search Normal / Search Grouping で使用するお相手ユーザーschema",
      properties: {
        id: {
          type: "string",
          description: "ユーザーID(rand)",
          example: "3AQTaduKvYWFUK3mwjHCehyGPL3cURSUtePEwhKd26tH",
        },
        nickname: {
          type: "string",
          description: "ユーザー名",
        },
        age: {
          type: "integer",
          description: "年齢",
          example: 25,
        },
        residence_state_id: {
          type: "integer",
          description: "居住地ID",
          example: 1,
        },
        last_login_id: {
          $ref: "#/components/schemas/LastLoginID",
          description: "最終ログインID",
        },
        images: {
          type: "array",
          description: "ユーザー画像",
          items: {
            $ref: "#/components/schemas/PartnerImage",
          },
        },
        is_new: {
          type: "integer",
          description: "新規ユーザーかどうか",
        },
        states: {
          type: "object",
          required: ["favorite", "commit_membership_status"],
          properties: {
            favorite: {
              type: "integer",
              description: "マイリスト追加済み（旧お気に入り）かどうか",
            },
            commit_membership_status: {
              type: "integer",
              description: "コミットメンバーシップステータス",
            },
          },
        },
      },
      required: [
        "id",
        "nickname",
        "age",
        "residence_state_id",
        "last_login_id",
        "images",
        "is_new",
        "states",
      ],
    } as JSONSchema7,
    "root"
  );
}

widget.register(Widget);
