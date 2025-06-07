import { Box, Fab, Typography } from "@mui/material";
import { useStoreGetAll } from "@libs/Store";
import AddIcon from "@mui/icons-material/Add";
import { PlayedGameListItemShell } from "./PlayedGameListItem";
import { useMemo } from "react";
import { orderBy } from "lodash";

import { PlayedGamesRouter } from "./PlayedGamesRouter";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { paths } from "@libs/Routing";
import { Link } from "react-router";

export const PlayedGames = function PlayedGames() {
  const { data: playedGames } = useStoreGetAll("playedGame");

  const sortedGames = useMemo(
    () => orderBy(playedGames?.sort(), ["date", "id"], ["desc", "desc"]),
    [playedGames]
  );

  const renderRow = ({ index, style }: ListChildComponentProps) => {
    const playedGame = sortedGames[index];
    return (
      <div style={style}>
        <PlayedGameListItemShell playedGame={playedGame} />
      </div>
    );
  };

  return (
    <Box height={"100%"} px={1} position={"relative"}>
      <PlayedGamesRouter />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          left: 0,
          top: 0,
          px: 1,
          py: 0,
          overflowX: "hidden",
        }}
      >
        {sortedGames?.length === 0 ? (
          <Typography variant="h6" color={"GrayText"} textAlign={"center"}>
            Список пуст
          </Typography>
        ) : (
          <FixedSizeList
            height={window.innerHeight}
            width="100%"
            itemSize={72}
            itemCount={sortedGames.length}
            overscanCount={5}
          >
            {renderRow}
          </FixedSizeList>
        )}
      </Box>
      <Link
        to={paths.playedGameDialog.getUrl()}
        style={{
          textDecoration: "none", // Убираем подчёркивание
          display: "inline-flex", // Чтобы Fab не терял форму
        }}
      >
        <Fab
          sx={{ bottom: 16, right: 16, position: "absolute" }}
          color="primary"
        >
          <AddIcon />
        </Fab>
      </Link>
    </Box>
  );
};
