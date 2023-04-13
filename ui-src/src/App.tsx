import { useState } from "react";

import Editor from "@monaco-editor/react";

let foo = (value: any) => {};

window.onmessage = async (event) => {
  console.log("[UI]", event);

  if (event.data.pluginMessage.type === "schema-json") {
    const { code } = event.data.pluginMessage;

    console.log(code);

    foo(code);
  }
};

function App() {
  const [json, setJSON] = useState("");

  const handleJSONChange = (e: any) => {
    setJSON(e);
  };

  foo = handleJSONChange;

  return (
    <div className="App">
      <Editor
        options={{
          cursorStyle: "line",
          formatOnPaste: true,
          formatOnType: true,
          wordWrap: "on",
        }}
        height="90vh"
        language="json"
        defaultValue={json}
        onMount={(editor, monaco) => {
          setTimeout(function () {
            editor?.getAction("editor.action.formatDocument")?.run();
          }, 300);
        }}
        onChange={(value) => {
          if (value) {
            try {
              let schema = JSON.parse(value);

              parent.postMessage(
                {
                  pluginMessage: {
                    type: "editor.onChange",
                    schema: schema,
                  },
                },
                "*"
              );
            } catch (e) {
              console.log("Invalid JSON");
              return;
            }
          }
        }}
      />
    </div>
  );
}

export default App;
