import { Box, Autocomplete as MuiAutocomplete } from "@mui/material";
import { ComponentProps, forwardRef, useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

/**
 * MUI Autocomplete with extension for mobile.
 * First click opens popup and second sets focus and open keyboard,
 * To Avoid opening keyboard when user wants choose value.
 */
export const Autocomplete = forwardRef(function CustomAutocomplete(
  props: ComponentProps<typeof MuiAutocomplete>,
  ref: ComponentProps<typeof MuiAutocomplete>["ref"]
) {
  const [open, setOpen] = useState(false);
  const { sx, ...autocompleteProps } = props;

  const coverRef = useRef<HTMLElement>(null);
  useOnClickOutside(coverRef, () => setTimeout(() => setOpen(false)));

  return (
    <Box
      ref={coverRef}
      sx={[
        {
          position: "relative",
          width: 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      onClick={(e) => {
        if (!open) {
          setOpen(true);
        } else {
          e.stopPropagation();
        }
      }}
    >
      <MuiAutocomplete
        ref={ref}
        open={open}
        {...autocompleteProps}
        onBlur={(e) => {
          autocompleteProps.onBlur?.(e);
          setOpen(false);
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: open ? "none" : "block",
        }}
      ></Box>
    </Box>
  );
}) as typeof MuiAutocomplete;
