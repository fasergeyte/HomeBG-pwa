import {
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

interface PlayersStatsCardProps {
  title: string;
  total: number;
  wins: number;
  defeats: number;
}

export function PlayersStatsCard(props: PlayersStatsCardProps) {
  const { title, defeats, total, wins } = props;
  return (
    <Card sx={{ p: 1, mb: 1 }}>
      <Typography variant="h6" color="primary">
        {title}
      </Typography>
      <Stack direction={"row"}>
        <Table size="small" sx={{ display: "contents" }}>
          <TableBody>
            <TableRow>
              <TableCell>Игры</TableCell>
              <TableCell>{total}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Победы</TableCell>
              <TableCell>{wins}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Поражения</TableCell>
              <TableCell>{defeats}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Винрейт</TableCell>
              <TableCell>
                {total ? `${Math.round((wins / total) * 100)}%` : "-"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Stack>
    </Card>
  );
}
