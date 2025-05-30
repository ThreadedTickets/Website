"use client";
import CheckboxInput from "@/components/inputs/CheckboxInput";
import DateInput from "@/components/inputs/DateInput";
import MultiSelectInput from "@/components/inputs/MultiSelectInput";
import NumberInput from "@/components/inputs/NumberInput";
import SelectInput from "@/components/inputs/SelectInput";
import TagSelectInput from "@/components/inputs/TagSelectInput";
import TextareaInput from "@/components/inputs/TextAreaInput";
import TextInput from "@/components/inputs/TextInput";
import { useState } from "react";
import PermissionToggle from "@/components/inputs/PermissionToggle";
import TimeInput from "@/components/inputs/TimeInput";
import DateTimeInput from "@/components/inputs/DateTimeInput";

const options = [
  {
    label: "Option 1",
    value: "opt1",
  },
  {
    label: "Option 2",
    value: "opt2",
  },
  {
    label: "Option 3",
    value: "opt3",
  },
  {
    label: "Option 4",
    value: "opt4",
  },
  {
    label: "Option 5",
    value: "opt5",
  },
  {
    label: "Option 6",
    value: "opt6",
  },
  {
    label: "Option 7",
    value: "opt7",
  },
  {
    label: "Option 8",
    value: "opt8",
  },
  {
    label: "Option 9",
    value: "opt9",
  },
  {
    label: "Option 10",
    value: "opt10",
  },
  {
    label: "Option 11",
    value: "opt11",
  },
  {
    label: "Option 12",
    value: "opt12",
  },
];

export default function PageInputs() {
  const [textInput, setTextInput] = useState("");
  const [textareaInput, setTextareaInput] = useState("");
  const [numberInput, setNumberInput] = useState(0);
  const [checkboxInput, setCheckboxInput] = useState(false);
  const [selectInput, setSelectInput] = useState("");
  const [multiselectInput, setMultiselectInput] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [tagInput, setTagInput] = useState<string[]>([]);
  const [permission, setPermission] = useState<"allow" | "neutral" | "deny">(
    "neutral"
  );

  return (
    <div className="flex gap-2 p-2 bg-amber-500 flex-wrap">
      <TextInput
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      />

      <CheckboxInput
        checked={checkboxInput}
        onChange={(e) => setCheckboxInput(e)}
      />

      <PermissionToggle value={permission} onChange={(e) => setPermission(e)} />

      <NumberInput
        value={numberInput}
        onChange={(e) => setNumberInput(e.target.valueAsNumber)}
      />

      <DateInput
        value={dateInput}
        onChange={(e) => setDateInput(e.target.value)}
      />
      <TimeInput
        value={timeInput}
        onChange={(e) => setTimeInput(e.target.value)}
      />
      <DateTimeInput
        value={dateTimeInput}
        onChange={(e) => setDateTimeInput(e.target.value)}
      />

      <TextareaInput
        value={textareaInput}
        onChange={(e) => setTextareaInput(e.target.value)}
        maxLength={250}
      />

      <SelectInput
        options={options}
        value={selectInput}
        onChange={(e) => setSelectInput(e)}
      />

      <MultiSelectInput
        options={options}
        value={multiselectInput}
        onChange={(e) => setMultiselectInput(e)}
        max={4}
      />

      <TagSelectInput
        options={options}
        selected={tagInput}
        onChange={(e) => setTagInput(e)}
        max={5}
      />
    </div>
  );
}
