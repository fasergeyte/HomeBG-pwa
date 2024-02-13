import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export * from "react-slick";
import SliderOriginal from "react-slick";
import { styled } from "@mui/material";

export const Slider = styled(SliderOriginal)({
  height: "100%",
  position: "relative",
  "& .slick-list, & .slick-track": {
    height: "100%",
  },
  "& .slick-slide": {
    height: "100%",
    position: "relative",
  },
  "& .slick-slide > div": {
    height: "100%",
    position: "relative",
  },
});
export type Slider = SliderOriginal;
