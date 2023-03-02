const { widget } = figma;
const { AutoLayout, Frame, Input } = widget;
import * as Icons from "./icons";

function property() {
  return (
    <AutoLayout direction={"horizontal"} padding={{ bottom: 10 }}>
      <Input
        placeholder={"Enter your name"}
        onTextEditEnd={() => {}}
        value="Hello"
      />
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
  );
}

function Widget() {
  return (
    <AutoLayout direction={"vertical"}>
      {property()}
      <AutoLayout padding={{ left: 30 }} direction={"vertical"}>
        {property()}
      </AutoLayout>
      {property()}
    </AutoLayout>
  );
}

widget.register(Widget);
