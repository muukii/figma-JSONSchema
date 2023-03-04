import { useState } from "react";

import Editor from "@monaco-editor/react";

export default (args: {
  onChange: (key: string, value: string) => void;
  language: string;
  code: string;
  theme: string;
}) => {
  const [value, setValue] = useState(args.code || "");

  return (
    <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl">
      <Editor
        height="85vh"
        width={`100%`}
        language={args.language || "javascript"}
        value={value}
        theme={args.theme}
        defaultValue="// some comment"
        onChange={(value) => {
          // if value is string
          if (typeof value === "string") {
            setValue(value);
            args.onChange("code", value);
          }
        }}
      />
    </div>
  );
};
