
import React from "react";
import {
  TextInput,
  StyleSheet,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";
import { Colors } from "../theme/colors";
import { Fonts } from "../theme/fonts";

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  editable?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
}

export default function AppInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  multiline = false,
  editable = true,
  autoCapitalize,
}: Props) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={Colors.gray}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      editable={editable}
      autoCapitalize={autoCapitalize}
      style={[styles.input, multiline && styles.multiline]}
      selectionColor={Colors.primary}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.white,
    color: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
