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
  Menu,
  MenuItem,
  Chip,
  Slider,
  Typography,
  Grid,
} from "@mui/material";
import { Info, Settings } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import links from "./links.json";
import l_gadam_jobs_info from "./gadam_jobs_info.json";
import l_studies_info from "./studies_info.json";
import l_metapluslink from "./metapluslink.json";

function App() {
  const { href, host } = window.location, // get the URL so we can work out where we are running
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    webDavPrefix = "https://" + host + "/lsaf/webdav/repo", // prefix for webdav access to LSAF
    [openInfo, setOpenInfo] = useState(false),
    [openSettings, setOpenSettings] = useState(false),
    [gadamCounts, setGadamCounts] = useState({}),
    [studyCounts, setStudyCounts] = useState([]),
    [gadamJobsInfo, setGadamJobsInfo] = useState(null),
    r_gadam_jobs_info =
      "/general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.json",
    [studiesInfo, setStudiesInfo] = useState(null),
    r_studies_info = "/general/biostat/metadata/projects/studies_info.json",
    [metapluslink, setMetapluslink] = useState(null),
    r_metapluslink = "/general/biostat/metadata/projects/metapluslink.json",
    [repEventCounts, setRepEventCounts] = useState([]),
    [title] = useState("Statistical Programming Dashboard"),
    [hours, setHours] = useState(12),
    [weeks, setWeeks] = useState(4),
    [days, setDays] = useState(3),
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
      if (!data) return ;
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
        gadamCounts =
          counts.length > 0
            ? counts.reduce((acc, obj) => {
                let key = Object.keys(obj)[0];
                acc[key] = obj[key];
                return acc;
              })
            : {};
      console.log("gadamCounts", gadamCounts);
      setGadamCounts(gadamCounts);
    },
    // process data used in the studies info screen (studies_info.json)
    processStudiesInfoData = (data, weeks, days) => {
      if (!data) return ;
      console.log("data", data);
      const subset = data.filter((d) => {
          return (
            d.status === "ongoing" &&
            (d.days_since_last_adsl_refresh > weeks * 7 ||
              d.days_since_last_ae_refresh > weeks * 7 ||
              d.days_between >= days)
          );
        }),
        sc = subset.map((d) => {
          return {
            study: d.STUDYID,
            days_since_last_adsl_refresh: d.days_since_last_adsl_refresh,
            days_since_last_ae_refresh: d.days_since_last_ae_refresh,
            days_between: d.days_between,
          };
        });
      // sdtm_ae_refresh_date
      console.log("sc", sc);
      setStudyCounts(sc);
    },
    // process reporting event data (metapluslink.json)
    processRepEventData = (data, weeks) => {
      if (!data) return ;
      console.log("data", data);
      const subset = data.filter((d) => {
          return (
            d.status === "development" &&
            (d.reldays > weeks * 7 || d.refrmsg === "Yes" || d.ok === 0)
          );
        }),
        re = subset.map((d) => {
          return {
            study: d.study,
            re: d.re,
            reporting_event_path: d.reporting_event_path,
            reldays: d.reldays,
            refrmsg: d.refrmsg,
            ok: d.ok,
          };
        });
      // sdtm_ae_refresh_date
      console.log("re", re);
      setRepEventCounts(re);
    };

  useEffect(() => {
    console.log("mode", mode, "href", href, "webDavPrefix", webDavPrefix);
    document.title = "Statistical Programming Dashboard";
    if (mode === "local") {
      setGadamJobsInfo(l_gadam_jobs_info);
      setMetapluslink(l_metapluslink);
      setStudiesInfo(l_studies_info);
    } else {
      const Url1 = `${webDavPrefix}${r_gadam_jobs_info}`,
        Url2 = `${webDavPrefix}${r_studies_info}`,
        Url3 = `${webDavPrefix}${r_metapluslink}`;
      console.log("Url1", Url1, "Url2", Url2, "Url3", Url3);
      fetch(Url1)
        .then((response) => response.json())
        .then((data) => {
          setGadamJobsInfo(data);
          processGadamData(data.data, hours);
        });
      fetch(Url3)
        .then((response) => response.json())
        .then((data) => {
          setMetapluslink(data);
          processRepEventData(data.data, weeks);
        });
      fetch(Url2)
        .then((response) => response.json())
        .then((data) => {
          setStudiesInfo(data.data);
          processStudiesInfoData(data.data, weeks, days);
        });
    }
  }, [title, href, mode, webDavPrefix]);

  useEffect(() => {
    if (gadamJobsInfo && gadamJobsInfo.data) {
      processGadamData(gadamJobsInfo.data, hours);
    }
  }, [hours, gadamJobsInfo]);

  useEffect(() => {
    if (studiesInfo && studiesInfo.data && weeks && days) {
      processStudiesInfoData(studiesInfo.data, weeks, days);
    }
  }, [days, weeks, studiesInfo]);

  useEffect(() => {
    if (metapluslink && metapluslink.length > 0 && weeks && days) {
      processRepEventData(metapluslink, weeks);
    }
  }, [days, weeks, metapluslink]);

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
          <Tooltip title="Settings">
            <IconButton
              color="info"
              // sx={{ mr: 2 }}
              onClick={() => {
                setOpenSettings(true);
              }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
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
      <Grid container>
        <Grid item xs={6} sx={{ mt: 7 }}>
          <Box
            sx={{
              mr: 7,
              color: "blue",
              // fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Results from gADaM jobs run in the last <b>{hours}</b> hours
          </Box>
          <Box
            sx={{
              mb: 1,
              color: "blue",
              fontSize: 18,
            }}
          >
            {" "}
            using data updated at
            {gadamJobsInfo
              ? gadamJobsInfo.lastModified.replace("T", " at ").replace("Z", "")
              : "?"}
          </Box>
          {/* <Box sx={{ backgroundColor: "#eee",  mb: 2 }}> */}
          {Object.keys(gadamCounts)
            .filter((k) => !["SUCCESSFUL", "SKIPPED"].includes(k))
            .map((k) => (
              <Chip
                sx={{
                  mr: 1,
                  mt: 0.5,
                  backgroundColor:
                    k === "ERRORS"
                      ? "#ffdddd"
                      : k === "WARNINGS"
                      ? "#ddffdd"
                      : "lightyellow",
                }}
                label={`${gadamCounts[k]} x ${k}`}
                key={"gac" + k}
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/gadam_jobs/jobs.html",
                      "_blank"
                    )
                    .focus();
                }}
              />
            ))}
          {/* </Box> */}
        </Grid>
        <Grid item xs={6} sx={{ mt: 7 }}>
          <Box
            sx={{
              // mt: 7,
              mb: 1,
              // backgroundColor: "#eee",
              color: "blue",
              // fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Studies with data not updated in the last <b>{weeks}</b> weeks
          </Box>
          {/* <Box sx={{ backgroundColor: "#eee", }}> */}
          {studyCounts.length > 0 &&
            studyCounts
              .filter(
                (k) =>
                  k.days_since_last_adsl_refresh > weeks * 7 ||
                  k.days_since_last_ae_refresh > weeks * 7
              )
              .map((k) => (
                <Tooltip
                  key={k.study}
                  title={
                    k.days_since_last_adsl_refresh > weeks * 7 &&
                    k.days_since_last_ae_refresh > weeks * 7
                      ? `ADSL updated ${k.days_since_last_adsl_refresh} days ago and AE updated ${k.days_since_last_ae_refresh} days ago`
                      : k.days_since_last_adsl_refresh > weeks * 7
                      ? `ADSL updated ${k.days_since_last_adsl_refresh} days ago`
                      : `AE updated ${k.days_since_last_ae_refresh} days ago`
                  }
                >
                  <Chip
                    sx={{
                      mr: 1,
                      mt: 0.5,
                      mb: 1,
                      backgroundColor:
                        k.days_since_last_adsl_refresh > weeks * 7 &&
                        k.days_since_last_ae_refresh > weeks * 7
                          ? "#ffdddd"
                          : k.days_since_last_adsl_refresh > weeks * 7
                          ? "#ffe0b3"
                          : "#ffccff",
                    }}
                    label={`${k.study}`}
                    onClick={() => {
                      window
                        .open(
                          "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/study_info/studies_info.html",
                          "_blank"
                        )
                        .focus();
                    }}
                  />
                </Tooltip>
              ))}
          {/* </Box> */}
        </Grid>
        <Grid item xs={6}>
          <Box
            sx={{
              // mt: 7,
              mb: 1,
              // backgroundColor: "#eee",
              color: "blue",
              // fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Studies with more than <b>{days}</b> days between last SDTM and
            gADaM refresh
          </Box>
          {studyCounts.length > 0 &&
            studyCounts
              .filter((k) => k.days_between >= days)
              .map((k) => (
                <Tooltip
                  key={"days_between" + k.study}
                  title={`${k.days_between} days between last SDTM and gADaM refresh`}
                >
                  <Chip
                    sx={{
                      mr: 1,
                      mt: 0.5,
                      mb: 1,
                      backgroundColor: "yellow",
                    }}
                    label={`${k.study}`}
                    onClick={() => {
                      window
                        .open(
                          "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/study_info/studies_info.html",
                          "_blank"
                        )
                        .focus();
                    }}
                  />
                </Tooltip>
              ))}
        </Grid>
        <Grid item xs={6}>
          <Box
            sx={{
              // mt: 7,
              mb: 1,
              // backgroundColor: "#eee",
              color: "blue",
              // fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Reporting events not updated in more than <b>{weeks}</b> weeks
          </Box>
          {repEventCounts.length > 0 &&
            repEventCounts
              .filter((k) => k.reldays >= weeks * 7)
              .map((k) => (
                <Tooltip
                  key={"repEvent-" + k.study + "-" + k.re}
                  title={`${k.reldays} days since last update`}
                >
                  <Chip
                    sx={{
                      mr: 1,
                      mt: 0.5,
                      mb: 1,
                      backgroundColor: "yellow",
                    }}
                    label={`${k.study}`}
                    onClick={() => {
                      window
                        .open(
                          "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/study_info/studies_info.html",
                          "_blank"
                        )
                        .focus();
                    }}
                  />
                </Tooltip>
              ))}
        </Grid>
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
      {/* Settings dialog */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenSettings(false)}
        open={openSettings}
      >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Typography sx={{ ml: 5, fontWeight: "bold" }} gutterBottom>
            Hours of data to include
          </Typography>
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
          <Typography sx={{ ml: 5, fontWeight: "bold" }} gutterBottom>
            Weeks since last refresh
          </Typography>
          <Slider
            defaultValue={4}
            step={1}
            value={weeks}
            onChange={(e, v) => {
              setWeeks(v);
            }}
            min={1}
            max={52}
            valueLabelDisplay="auto"
            // marks={hoursRange}
            sx={{ ml: 3, width: 800 }}
          />
          <Typography sx={{ ml: 5, fontWeight: "bold" }} gutterBottom>
            Days between last SDTM and gADaM refresh
          </Typography>
          <Slider
            defaultValue={4}
            step={1}
            value={days}
            onChange={(e, v) => {
              setDays(v);
            }}
            min={1}
            max={7}
            valueLabelDisplay="auto"
            // marks={hoursRange}
            sx={{ ml: 3, width: 800 }}
          />
        </DialogContent>
      </Dialog>
      {/* Info dialog */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenInfo(false)}
        open={openInfo}
      >
        <DialogTitle>Info</DialogTitle>
        <DialogContent>
          <Typography sx={{ ml: 5, fontWeight: "bold" }} gutterBottom>
            File used
          </Typography>
          <ul>
            <li>gadam_jobs_info.json</li>
            <li>studies_info.json</li>
            <li> metapluslink.json</li>
          </ul>
        </DialogContent>
      </Dialog>{" "}
    </div>
  );
}
export default App;
