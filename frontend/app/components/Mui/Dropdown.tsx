import React from "react";
import type { SelectChangeEvent } from "@mui/material/Select";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

export default function SimpleDropdown() {
  const [value, setValue] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value);
  };

  return (
    <FormControl fullWidth variant="outlined" sx={{ height: '100%', width: '250px' }}>
      <InputLabel
    id="select-label"
    sx={{
      // Override default positioning for centered label
      top: "-17%",
      left: 0,
      margin: 0,
      padding: 0,
      // Optional: set width for proper centering
      width: "100%",
      backgroundColor: "transparent",
    }}
  >
    Select Option
  </InputLabel>
      <Select
        labelId="select-label"
        id="select"
        value={value}
        label="Select Option"
        onChange={handleChange}
        className="bg-slate-800 h-full flex justify-center items-center text-gray-100 border border-gray-700 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:placeholder-gray-400"
         sx={{
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent', // Remove MUI border to let Tailwind show border
          },
          color: 'inherit', // Inherit text color from tailwind text-gray-100
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={"option1"}>Option 1</MenuItem>
        <MenuItem value={"option2"}>Option 2</MenuItem>
        <MenuItem value={"option3"}>Option 3</MenuItem>
      </Select>
    </FormControl>
  );
}
