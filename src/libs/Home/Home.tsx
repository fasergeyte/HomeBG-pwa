import Tab from "@mui/material/Tab";
import { useRef, useState } from "react";
import { Box, Stack, Tabs } from "@mui/material";
import { Players } from "@libs/Players";
import { Games } from "@libs/Games";
import { Slider } from "@libs/Common";
import { PlayedGames } from "@libs/PlayedGames";

export function Home() {
  const [activeTab, setActiveTab] = useState<number>(1);

  const sliderRef = useRef<Slider | null>();
  return (
    <Stack height={1}>
      <Tabs
        variant="fullWidth"
        value={activeTab}
        onChange={(e, value) => sliderRef.current?.slickGoTo(value)}
      >
        <Tab value={0} label="Игры" />
        <Tab value={1} label="Партии" />
        <Tab value={2} label="Игроки" />
      </Tabs>
      <Slider
        infinite={false}
        arrows={false}
        initialSlide={1}
        ref={(c) => {
          sliderRef.current = c;
        }}
        afterChange={(index) => setActiveTab(index)}
        slidesToShow={1}
        slidesToScroll={1}
      >
        <Games />
        <PlayedGames />
        <Box sx={{ height: 1 }}>
          <Players />
        </Box>
      </Slider>
    </Stack>
  );
}
