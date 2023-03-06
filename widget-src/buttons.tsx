const { widget } = figma;
const { AutoLayout } = widget;
import * as Icons from "./icons";

export function AddButton(props: { onClick: () => void }) {
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

export function RemoveButton(props: { onClick: () => void }) {
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

export function UpButton(props: { onClick: () => void }) {
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

export function DownButton(props: { onClick: () => void }) {
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
