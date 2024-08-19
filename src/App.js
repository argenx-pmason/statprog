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
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Paper,
} from "@mui/material";
import {
  Info,
  Settings,
  AccessAlarm,
  AdbTwoTone,
  AccessAlarmTwoTone,
  HistoryTwoTone,
  Add,
  Remove,
  TvTwoTone,
  LocalPizza,
  Build,
  Brush,
} from "@mui/icons-material";
import { Masonry } from "@mui/lab";
import MenuIcon from "@mui/icons-material/Menu";
import alasql from "alasql";
import links from "./links.json";
import l_gadam_jobs_info from "./gadam_jobs_info.json";
import l_studies_info from "./studies_info.json";
import l_metapluslink from "./metapluslink.json";
import { usePapaParse } from "react-papaparse";
import gadamCsv from "./gadam.csv";
import l_day1 from "./day1.csv";
import l_day2 from "./day2.csv";
import l_day3 from "./day3.csv";
import l_day4 from "./day4.csv";
import l_day5 from "./day5.csv";
import l_day6 from "./day6.csv";
import l_day7 from "./day7.csv";

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
    [columns, setColumns] = useState(3),
    r_gadam_jobs_info =
      "/general/biostat/gadam/documents/gadam_dshb/gadam_jobs/gadam_jobs_info.json",
    [studiesInfo, setStudiesInfo] = useState(null),
    r_studies_info = "/general/biostat/metadata/projects/studies_info.json",
    [metapluslink, setMetapluslink] = useState(null),
    r_metapluslink = "/general/biostat/metadata/projects/metapluslink.json",
    [gadamRefresh, setGadamRefresh] = useState(null),
    r_gadamRefresh =
      "/general/biostat/gadam/documents/gadam_dshb/gadam_events/gadam.csv",
    [resources, setResources] = useState(null),
    [day1, setDay1] = useState([]),
    [day2, setDay2] = useState([]),
    [day3, setDay3] = useState([]),
    [day4, setDay4] = useState([]),
    [day5, setDay5] = useState([]),
    [day6, setDay6] = useState([]),
    [day7, setDay7] = useState([]),
    r_day1 = "/general/biostat/metadata/projects/resources_monitoring/day1.csv",
    r_day2 = "/general/biostat/metadata/projects/resources_monitoring/day2.csv",
    r_day3 = "/general/biostat/metadata/projects/resources_monitoring/day3.csv",
    r_day4 = "/general/biostat/metadata/projects/resources_monitoring/day4.csv",
    r_day5 = "/general/biostat/metadata/projects/resources_monitoring/day5.csv",
    r_day6 = "/general/biostat/metadata/projects/resources_monitoring/day6.csv",
    r_day7 = "/general/biostat/metadata/projects/resources_monitoring/day7.csv",
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
    backgroundColor = "#f7f7f7",
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
    processCsv = (data, setFunc) => {
      console.log("data", data);
      readString(data, {
        worker: true,
        header: true,
        complete: (results) => {
          // take papaparse results and transform them to fit DataGridPro
          const keys = results.data[0],
            tempRows = results.data;
          console.log("processCsv", "keys", keys, "tempRows", tempRows);
          setFunc(tempRows);
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
          processCsv(text, setGadamRefresh);
        });
      fetch(l_day1)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay1);
        });
      fetch(l_day2)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay2);
        });
      fetch(l_day3)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay3);
        });
      fetch(l_day4)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay4);
        });
      fetch(l_day5)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay5);
        });
      fetch(l_day6)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay6);
        });
      fetch(l_day7)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay7);
        });
    } else {
      const Url1 = `${webDavPrefix}${r_gadam_jobs_info}`,
        Url2 = `${webDavPrefix}${r_studies_info}`,
        Url3 = `${webDavPrefix}${r_metapluslink}`,
        Url4 = `${webDavPrefix}${r_gadamRefresh}`,
        urlday1 = `${webDavPrefix}${r_day1}`,
        urlday2 = `${webDavPrefix}${r_day2}`,
        urlday3 = `${webDavPrefix}${r_day3}`,
        urlday4 = `${webDavPrefix}${r_day4}`,
        urlday5 = `${webDavPrefix}${r_day5}`,
        urlday6 = `${webDavPrefix}${r_day6}`,
        urlday7 = `${webDavPrefix}${r_day7}`;
      console.log(
        "Url1",
        Url1,
        "Url2",
        Url2,
        "Url3",
        Url3,
        "Url4",
        Url4,
        "urlday1",
        urlday1,
        "urlday2",
        urlday2,
        "urlday3",
        urlday3,
        "urlday4",
        urlday4,
        "urlday5",
        urlday5,
        "urlday6",
        urlday6,
        "urlday7",
        urlday7
      );
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
          processCsv(text, setGadamRefresh);
        });
      fetch(urlday1)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay1);
        });
      fetch(urlday2)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay2);
        });
      fetch(urlday3)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay3);
        });
      fetch(urlday4)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay4);
        });
      fetch(urlday5)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay5);
        });
      fetch(urlday6)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay6);
        });
      fetch(urlday7)
        .then((response) => response.text())
        .then((text) => {
          processCsv(text, setDay7);
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

  // once we have all the days, then put them together and calculate the stats we want
  useEffect(() => {
    if (
      days &&
      day1 &&
      day1.length > 0 &&
      day2 &&
      day2.length > 0 &&
      day3 &&
      day3.length > 0 &&
      day4 &&
      day4.length > 0 &&
      day5 &&
      day5.length > 0 &&
      day6 &&
      day6.length > 0 &&
      day7 &&
      day7.length > 0
    ) {
      const tempDays = [
        ...day1,
        ...day2,
        ...day3,
        ...day4,
        ...day5,
        ...day6,
        ...day7,
      ]
        .filter((d) => {
          const date = new Date(d.date),
            ageDays = (new Date() - date) / (24 * 60 * 60 * 1000);
          return ageDays <= days;
        })
        .map((d) => {
          const swap = Number(d.swap_pct_used),
            cpu = Number(d.cpu_pct_used),
            mem = Number(d.mem_pct_used),
            xythos = Number(d.xythosfs_pct_used),
            workspace = Number(d.workspace_pct_used),
            transient = Number(d.transient_pct_used);
          return {
            ...d,
            swap: swap,
            cpu: cpu,
            mem: mem,
            xythos: xythos,
            workspace: workspace,
            transient: transient,
          };
        });
      console.log("tempDays", tempDays);
      const sql =
          "select  count(*)/12/24 as days," +
          " count(*)/12 as hours," +
          ` (${days}*24) - (count(*)/12) as down_time_hours,` +
          " min(cpu) as min_cpu, avg(cpu) as avg_cpu, max(cpu) as max_cpu," +
          " min(mem) as min_mem, avg(mem) as avg_mem, max(mem) as max_mem," +
          " min(swap) as min_swap, avg(swap) as avg_swap, max(swap) as max_swap," +
          " min(xythos) as min_xythos, avg(xythos) as avg_xythos, max(xythos) as max_xythos," +
          " min(transient) as min_transient, avg(transient) as avg_transient, max(transient) as max_transient," +
          " min(workspace) as min_workspace, avg(workspace) as avg_workspace, max(workspace) as max_workspace" +
          " from ?",
        res = alasql(sql, [tempDays]);
      console.log("res", res[0]);
      setResources(res[0]);
    }
  }, [day1, day2, day3, day4, day5, day6, day7, days]);

  return (
    <div className="App">
      <AppBar position="fixed">
        <Toolbar variant="dense" sx={{ backgroundColor: backgroundColor }}>
          <Tooltip title="Menu">
            <IconButton
              edge="start"
              color="info"
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
              border: 1,
              borderRadius: 2,
              color: "black",
              fontWeight: "bold",
              boxShadow: 3,
              fontSize: 14,
              height: 23,
              padding: 0.3,
            }}
          >
            &nbsp;&nbsp;{title}&nbsp;&nbsp;
          </Box>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Fewer columns">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setColumns(columns - 1 < 1 ? 1 : columns - 1);
              }}
            >
              <Remove />
            </IconButton>
          </Tooltip>
          <Tooltip title="More columns">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setColumns(columns + 1 > 6 ? 6 : columns + 1);
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
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
      <Box sx={{ mt: 7 }}></Box>
      <Masonry columns={columns} spacing={1}>
        <Paper>
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
              <Tooltip title="Reduce time period by 6 hours">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setHours(hours - 6);
                  }}
                >
                  <Remove />
                </IconButton>
              </Tooltip>
              <Tooltip title="Expand time period by 6 hours">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setHours(hours + 6);
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Paper>
        <Paper>
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
              <Tooltip title="Reduce time period by 1 week">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setWeeks(weeks - 1);
                  }}
                >
                  <Remove />
                </IconButton>
              </Tooltip>
              <Tooltip title="Expand time period by 1 week">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setWeeks(weeks + 1);
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </CardActions>{" "}
          </Card>
        </Paper>
        <Paper>
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
              <Tooltip title="Reduce time period by 1 day">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setDays(days - 1);
                  }}
                >
                  <Remove />
                </IconButton>
              </Tooltip>
              <Tooltip title="Expand time period by 1 day">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setDays(days + 1);
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Paper>
        <Paper>
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
              <Tooltip title="Reduce time period by 1 week">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setWeeks(weeks - 1);
                  }}
                >
                  <Remove />
                </IconButton>
              </Tooltip>
              <Tooltip title="Expand time period by 1 week">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setWeeks(weeks + 1);
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Paper>
        <Paper>
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
              <Tooltip title="Reduce time period by 1 day">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setDays(days - 1);
                  }}
                >
                  <Remove />
                </IconButton>
              </Tooltip>
              <Tooltip title="Expand time period by 1 day">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setDays(days + 1);
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Paper>
        <Paper>
          <Card sx={{ m: 3, backgroundColor: cardColor }}>
            <CardHeader
              sx={{
                color: "blue",
                fontSize: 18,
              }}
              title={`LSAF Resource Usage in the last ${days} days`}
              subheader={
                resources
                  ? resources?.days?.toFixed(2) +
                    " days (" +
                    resources?.hours?.toFixed(1) +
                    " hours) of data - "+
                    resources?.down_time_hours?.toFixed(1) +
                    " hours of down time."
                  : null
              }
            ></CardHeader>
            <CardContent>
              {resources ? (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Measure
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          Min.
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          Avg.
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                          Max.
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ color: "#0288d1" }}
                        >
                          CPU
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.min_cpu}
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.avg_cpu?.toFixed(1)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.max_cpu}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          Swap
                        </TableCell>
                        <TableCell align="right">
                          {resources?.min_swap}
                        </TableCell>
                        <TableCell align="right">
                          {resources?.avg_swap?.toFixed(1)}
                        </TableCell>
                        <TableCell align="right">
                          {resources?.max_swap}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ color: "#0288d1" }}
                        >
                          Memory
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.min_mem}
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.avg_mem?.toFixed(1)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.max_mem}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          Workspace
                        </TableCell>
                        <TableCell align="right">
                          {resources?.min_workspace}
                        </TableCell>
                        <TableCell align="right">
                          {resources?.avg_workspace?.toFixed(1)}
                        </TableCell>
                        <TableCell align="right">
                          {resources?.max_workspace}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ color: "#0288d1" }}
                        >
                          Transient
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.min_transient}
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.avg_transient?.toFixed(1)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: "#0288d1" }}>
                          {resources?.max_transient}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          Xythos
                        </TableCell>
                        <TableCell align="right">
                          {resources?.min_xythos}
                        </TableCell>
                        <TableCell align="right">
                          {resources?.avg_xythos?.toFixed(1)}
                        </TableCell>
                        <TableCell align="right">
                          {resources?.max_xythos}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </CardContent>
            <CardActions>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/resources_monitoring/index.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<Build />}
              >
                Basic
              </Button>
              <Button
                onClick={() => {
                  window
                    .open(
                      "https://xarprod.ondemand.sas.com/lsaf/filedownload/sdd%3A///general/biostat/tools/resources_monitoring02/index.html",
                      "_blank"
                    )
                    .focus();
                }}
                startIcon={<Brush />}
              >
                Extensive
              </Button>
              <Tooltip title="Reduce time period by 1 day">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setDays(days - 1);
                  }}
                >
                  <Remove />
                </IconButton>
              </Tooltip>
              <Tooltip title="Expand time period by 1 day">
                <IconButton
                  color="info"
                  // sx={{ mr: 2 }}
                  onClick={() => {
                    setDays(days + 1);
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Paper>
      </Masonry>
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
