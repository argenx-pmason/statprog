import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Toolbar,
  IconButton,
  AppBar,
  Grid,
  Menu,
  MenuItem,
  Slider,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import links from "./links.json";
import gadam_jobs_info from "./gadam_jobs_info.json";
import studies_info from "./studies_info.json";

function App() {
  const [openInfo, setOpenInfo] = useState(false),
    [gadamCounts, setGadamCounts] = useState({}),
    [title] = useState("Statistical Programming Dashboard"),
    [hours, setHours] = useState(12),
    [hoursRange] = useState([
      { value: 6, label: "6" },
      { value: 12, label: "12" },
      { value: 18, label: "18" },
      { value: 24, label: "24" },
      { value: 48, label: "48" },
      { value: 72, label: "72" },
    ]),
    [anchorEl, setAnchorEl] = useState(null),
    handleClickMenu = (event) => {
      setAnchorEl(event.currentTarget);
    },
    handleCloseMenu = () => {
      setAnchorEl(null);
    },
    // process data used in the gADaM jobs screen
    processGadamData = (data, hours) => {
      const subset = data.filter((d) => {
        const completedDate = new Date(d.completedDateSAS),
          now = new Date(),
          diff = now - completedDate,
          actualHours = diff / 1000 / 60 / 60;
        return actualHours < hours;
      });
      const detailStatus = subset.map((d) => d.detailStatus),
        uniqueDetailStatus = [...new Set(detailStatus)],
        counts = uniqueDetailStatus.map((k) => {
          const l = subset.filter((d) => d.detailStatus === k).length;
          return { [k]: l };
        }),
        gadamCounts = counts.reduce((acc, obj) => {
          let key = Object.keys(obj)[0];
          acc[key] = obj[key];
          return acc;
        });
      console.log("gadamCounts", gadamCounts);
      return gadamCounts;
    },
    // process data used in the studies info screen
    processStudiesInfoData = (data, hours) => {
      const subset = data.filter((d) => {
        const completedDate = new Date(d.completedDateSAS),
          now = new Date(),
          diff = now - completedDate,
          actualHours = diff / 1000 / 60 / 60;
        return actualHours < hours;
      });
      const detailStatus = subset.map((d) => d.detailStatus),
        uniqueDetailStatus = [...new Set(detailStatus)],
        counts = uniqueDetailStatus.map((k) => {
          const l = subset.filter((d) => d.detailStatus === k).length;
          return { [k]: l };
        }),
        gadamCounts = counts.reduce((acc, obj) => {
          let key = Object.keys(obj)[0];
          acc[key] = obj[key];
          return acc;
        });
      console.log("gadamCounts", gadamCounts);
      return gadamCounts;
    };

  useEffect(() => {
    document.title = "Statistical Programming Dashboard";
  }, [title]);

  useEffect(() => {
    setGadamCounts(processGadamData(gadam_jobs_info.data, hours));
  }, [hours]);

  return (
    <div className="App">
      <AppBar position="fixed">
        <Toolbar variant="dense" sx={{ backgroundColor: "#cccccc" }}>
          <Tooltip title="Menu">
            <IconButton
              edge="start"
              color="success"
              sx={{ mr: 2 }}
              onClick={handleClickMenu}
              aria-label="menu"
              aria-controls={anchorEl ? "View a table" : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? "true" : undefined}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Box
            sx={{
              backgroundColor: "#eeeeee",
              color: "green",
              fontWeight: "bold",
              boxShadow: 3,
              fontSize: 16,
            }}
          >
            &nbsp;&nbsp;{title}&nbsp;&nbsp;
          </Box>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Information about this screen">
            <IconButton
              color="info"
              // sx={{ mr: 2 }}
              onClick={() => {
                setOpenInfo(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Grid container spacing={2}>
        <Grid sx={{ mt: 8 }} item xs={12}>
          <Slider
            defaultValue={12}
            step={null}
            value={hours}
            onChange={(e, v) => {
              setHours(v);
            }}
            min={6}
            max={72}
            valueLabelDisplay="auto"
            marks={hoursRange}
            sx={{ ml: 3, width: 800 }}
          />
        </Grid>
        <Grid sx={{ mt: 0 }} item xs={2}>
          <Box sx={{ color: "blue", fontWeight: "bold" }}>gADaM jobs</Box>
        </Grid>
        {Object.keys(gadamCounts)
          .filter((k) => !["SUCCESSFUL", "SKIPPED"].includes(k))
          .map((k) => (
            <Grid sx={{ mt: 0 }} item xs={2} key={k}>
              <Box sx={{ color: "blue" }}>
                <b>{k}:</b> {gadamCounts[k]}
              </Box>
            </Grid>
          ))}
      </Grid>
      <Menu
        anchorEl={anchorEl}
        id="link-menu"
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {links.map((t, id) => (
          <MenuItem key={"menuItem" + id} onClick={handleCloseMenu}>
            <Tooltip key={"tt" + id}>
              <Box
                color={"success"}
                size="small"
                variant="outlined"
                onClick={() => {
                  window.open(t.url, "_blank").focus();
                  // handleCloseMenu();
                }}
                // sx={{ mb: 1 }}
              >
                {t.name}
              </Box>
            </Tooltip>
          </MenuItem>
        ))}
      </Menu>
      {/* Dialog with General info about this screen */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenInfo(false)}
        open={openInfo}
      >
        <DialogTitle>Info about this screen</DialogTitle>
        <DialogContent>
          <Box sx={{ color: "blue", fontSize: 10 }}>details</Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export default App;
