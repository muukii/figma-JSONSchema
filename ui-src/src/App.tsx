import { useState } from "react";

import Editor from "@monaco-editor/react";

function App() {
  return (
    <div className="App">
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
      />
    </div>
  );
}

export default App;
