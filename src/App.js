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
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Grid,
} from "@mui/material";
import {
  Info,
  Settings,
  AccessAlarm,
  AdbTwoTone,
  AccessAlarmTwoTone,
  HistoryTwoTone,
  TvTwoTone,
  LocalPizza,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import links from "./links.json";
import l_gadam_jobs_info from "./gadam_jobs_info.json";
import l_studies_info from "./studies_info.json";
import l_metapluslink from "./metapluslink.json";
import { usePapaParse } from "react-papaparse";
import gadamCsv from "./gadam.csv";

function App() {
  const { href, host } = window.location, // get the URL so we can work out where we are running
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    webDavPrefix = "https://" + host + "/lsaf/webdav/repo", // prefix for webdav access to LSAF
    fileDownloadPrefix = "https://" + host + "/lsaf/filedownload/sdd%3A//", // prefix for webdav access to LSAF
    fileViewerPrefix =
      webDavPrefix + "/general/biostat/tools/fileviewer/index.html?file=",
    dashStudyPrefix =
      fileDownloadPrefix + "/general/biostat/tools/dashstudy/index.html?file=",
    { readString } = usePapaParse(),
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
    [gadamRefresh, setGadamRefresh] = useState(null),
    r_gadamRefresh =
      "/general/biostat/gadam/documents/gadam_dshb/gadam_events/gadam.csv",
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
    [daysRange] = useState([
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7" },
    ]),
    [weeksRange] = useState([
      { value: 1, label: "1" },
      { value: 4, label: "4" },
      { value: 8, label: "8" },
      { value: 12, label: "12" },
      { value: 26, label: "26" },
      { value: 52, label: "52" },
    ]),
    warningColor = "#ffffcc",
    backgroundColor = "#dddddd",
    errorColor = "#ffdddd",
    okColor = "#ddffdd",
    cardColor = "#f8f8f8",
    [anchorEl, setAnchorEl] = useState(null),
    handleClickMenu = (event) => {
      setAnchorEl(event.currentTarget);
    },
    handleCloseMenu = () => {
      setAnchorEl(null);
    },
    // process data used in the gADaM jobs screen
    processGadamData = (data, hours) => {
      if (!data) return;
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
      if (!data) return;
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
            product: d.product,
            indication: d.indication,
          };
        });
      // sdtm_ae_refresh_date
      console.log("sc", sc);
      setStudyCounts(sc);
    },
    // process reporting event data (metapluslink.json)
    processRepEventData = (data, weeks) => {
      if (!data) return;
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
    },
    processCsv = (data) => {
      console.log("data", data);
      readString(data, {
        worker: true,
        header: true,
        complete: (results) => {
          // take papaparse results and transform them to fit DataGridPro
          const keys = results.data[0],
            tempRows = results.data;
          console.log("processCsv", "keys", keys, "tempRows", tempRows);
          setGadamRefresh(tempRows);
        },
        error: (error, file) => {
          console.log("error", error, "file", file);
        },
      });
    },
    [warnings, setWarnings] = useState(null),
    processGadamRefresh = (data, days) => {
      const unique = [...new Set(data.map((item) => item.reas))],
        recent = data.filter((item) => {
          const date = new Date(item.date),
            ageDays = (new Date() - date) / (24 * 60 * 60 * 1000);
          // console.log('ageDays',ageDays)
          return ageDays <= days && item.type === "ADAM";
        }),
        warningData = recent.filter((item) => item.warning === "Y"),
        warningStudies = [...new Set(warningData.map((item) => item.study))],
        updates = recent.filter((item) => item.reas === "OK");
      setRefreshUpdates(updates);
      setWarnings(warningStudies);
      console.log(
        "processGadamRefresh",
        "recent",
        recent,
        "unique",
        unique,
        "warningStudies",
        warningStudies,
        "updates",
        updates
      );
    },
    [refreshUpdates, setRefreshUpdates] = useState(null);

  useEffect(() => {
    console.log("mode", mode, "href", href, "webDavPrefix", webDavPrefix);
    document.title = "Statistical Programming Dashboard";
    if (mode === "local") {
      setGadamJobsInfo(l_gadam_jobs_info);
      setMetapluslink(l_metapluslink);
      setStudiesInfo(l_studies_info);
      fetch(gadamCsv)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text);
        });
    } else {
      const Url1 = `${webDavPrefix}${r_gadam_jobs_info}`,
        Url2 = `${webDavPrefix}${r_studies_info}`,
        Url3 = `${webDavPrefix}${r_metapluslink}`,
        Url4 = `${webDavPrefix}${r_gadamRefresh}`;
      console.log("Url1", Url1, "Url2", Url2, "Url3", Url3, "Url4", Url4);
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
      fetch(Url4)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text);
        });
    }
    // eslint-disable-next-line
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

  useEffect(() => {
    if (gadamRefresh && gadamRefresh.length > 0 && days) {
      processGadamRefresh(gadamRefresh, days);
    }
  }, [days, gadamRefresh]);

  return (
    <div className="App">
      <AppBar position="fixed">
        <Toolbar variant="dense" sx={{ backgroundColor: backgroundColor }}>
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
          <Card sx={{ m: 3, backgroundColor: cardColor }}>
            <CardHeader
              sx={{
                color: "blue",
                fontSize: 18,
              }}
              title={`Results from gADaM jobs run in the last ${hours} hours`}
              subheader={`data updated at ${
                gadamJobsInfo
                  ? gadamJobsInfo.lastModified
                      .replace("T", " at ")
                      .replace("Z", "")
                  : "?"
              }`}
            />
            <CardContent>
              {Object.keys(gadamCounts)
                .filter((k) => !["SUCCESSFUL", "SKIPPED"].includes(k))
                .map((k) => (
                  <Chip
                    sx={{
                      mr: 1,
                      mt: 0.5,
                      backgroundColor:
                        k === "ERRORS"
                          ? errorColor
                          : k === "WARNINGS"
                          ? okColor
                          : warningColor,
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
            </CardContent>
            <CardActions>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/gadam_jobs/jobs.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<AccessAlarm />}
              >
                Jobs Chart
              </Button>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/view/index.html?lsaf=/general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.json&meta=/general/biostat/tools/view/gadam_jobs_info-metadata.json&key=data&title=GADAM%20Jobs",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<AccessAlarmTwoTone />}
              >
                Jobs Table
              </Button>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/gadam_events/gadam_dshb.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<HistoryTwoTone />}
              >
                Refresh
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={6} sx={{ mt: 7 }}>
          <Card sx={{ m: 3, backgroundColor: cardColor }}>
            <CardHeader
              sx={{
                color: "blue",
                fontSize: 18,
              }}
              title={`Studies with data not updated in the last ${weeks} weeks`}
              subheader={`click to open File Viewer`}
            />
            <CardContent>
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
                              ? errorColor
                              : k.days_since_last_adsl_refresh > weeks * 7
                              ? "#ffe0b3"
                              : "#ffccff",
                        }}
                        label={`${k.study}`}
                        onClick={() => {
                          console.log("k", k);
                          window
                            .open(
                              fileViewerPrefix +
                                "/clinical/" +
                                k.product +
                                "/" +
                                k.indication +
                                "/" +
                                k.study.toLowerCase() +
                                "/dm",
                              "_blank"
                            )
                            .focus();
                        }}
                      />
                    </Tooltip>
                  ))}
            </CardContent>
            <CardActions>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/study_info/studies_info.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<AdbTwoTone />}
              >
                Studies Summary
              </Button>
            </CardActions>{" "}
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ m: 3, backgroundColor: cardColor }}>
            <CardHeader
              sx={{
                color: "blue",
                fontSize: 18,
              }}
              title={`Studies with more than ${days} days between last SDTM and gADaM refresh`}
              subheader={`click to open File Viewer`}
            ></CardHeader>
            <CardContent>
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
                          backgroundColor: warningColor,
                        }}
                        label={`${k.study}`}
                        onClick={() => {
                          window
                            .open(
                              fileViewerPrefix +
                                "/clinical/" +
                                k.product +
                                "/" +
                                k.indication +
                                "/" +
                                k.study.toLowerCase() +
                                "/dm",
                              "_blank"
                            )
                            .focus();
                        }}
                      />
                    </Tooltip>
                  ))}
            </CardContent>{" "}
            <CardActions>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/study_info/studies_info.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<AdbTwoTone />}
              >
                Studies Summary
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ m: 3, backgroundColor: cardColor }}>
            <CardHeader
              sx={{
                color: "blue",
                fontSize: 18,
              }}
              title={`Reporting events not updated in more than ${weeks} weeks`}
              subheader={`click to open File Viewer, ctrl-click to open study dashboard`}
            ></CardHeader>
            <CardContent>
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
                          backgroundColor: warningColor,
                        }}
                        label={`${k.study}, ${k.re}`}
                        onClick={(e) => {
                          console.log("e", e);
                          if (e.ctrlKey) {
                            window
                              .open(
                                dashStudyPrefix +
                                  k.reporting_event_path +
                                  "/documents/meta/dashstudy.json",
                                "_blank"
                              )
                              .focus();
                          } else {
                            window
                              .open(
                                fileViewerPrefix + k.reporting_event_path,
                                "_blank"
                              )
                              .focus();
                          }
                        }}
                      />
                    </Tooltip>
                  ))}
            </CardContent>{" "}
            <CardActions>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/study_info/studies_info.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<AdbTwoTone />}
              >
                Studies Summary
              </Button>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/rep-events-dash/index.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<TvTwoTone />}
              >
                Reporting Events
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ m: 3, backgroundColor: cardColor }}>
            <CardHeader
              sx={{
                color: "blue",
                fontSize: 18,
              }}
              title={`GADAM Data Refresh Events in the last ${days} days`}
              subheader={`Yellow have warnings, click to open File Viewer`}
            ></CardHeader>
            <CardContent>
              {refreshUpdates &&
                refreshUpdates.length > 0 &&
                [...new Set(refreshUpdates.map((item) => item.study))].map(
                  (study) => (
                    <Chip
                      sx={{
                        mr: 1,
                        mt: 0.5,
                        mb: 1,
                        backgroundColor: warnings.includes(study)
                          ? warningColor
                          : okColor,
                      }}
                      label={`${study}`}
                      onClick={() => {
                        const s = study.split("-"),
                          product = s[0] + "-" + s[1],
                          indication = s[2].slice(1, -1),
                          stud = product + "-" + s[3];
                        window
                          .open(
                            fileViewerPrefix +
                              "/clinical/" +
                              product +
                              "/" +
                              indication +
                              "/" +
                              stud +
                              "/dm",
                            "_blank"
                          )
                          .focus();
                      }}
                    />
                  )
                )}
            </CardContent>
            <CardActions>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/gadam/documents/gadam_dshb/gadam_events/gadam_dshb.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<LocalPizza />}
              >
                GADAM Data Refresh Events
              </Button>
            </CardActions>
          </Card>
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
            marks={weeksRange}
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
            marks={daysRange}
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
