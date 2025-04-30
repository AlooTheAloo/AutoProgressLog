import { View } from "react-native";

interface PillShapeIconProps {
  iconSymbol: React.ReactNode;
  focused: boolean;
}

export default function PillShapeIcon(props: PillShapeIconProps) {
  return (
    <View
      style={{
        backgroundColor: props.focused ? "#22A7D1" : "",
        borderRadius: 999,
        width: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {props.iconSymbol}
    </View>
  );
}
