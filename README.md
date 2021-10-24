# daily-novena README

<p align="center">
  <a href="https://github.com/joeyhage/daily-novena/actions?query=workflow%3Aci">
    <img alt="Build Status" src="https://github.com/joeyhage/daily-novena/workflows/ci/badge.svg?branch=main"></a>
  <a href="https://github.com/joeyhage/daily-novena/actions?query=workflow%3A%22daily+health+check%22">
    <img alt="Daily Health Check" src="https://github.com/joeyhage/daily-novena/workflows/daily%20health%20check/badge.svg?branch=main"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=joeyhage.daily-novena">
    <img alt="Build Status" src="https://img.shields.io/visual-studio-marketplace/v/joeyhage.daily-novena?cacheSeconds=3600&logo=visualstudiocode"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=joeyhage.daily-novena">
    <img alt="VS Code Marketplace Last Updated" src="https://img.shields.io/visual-studio-marketplace/last-updated/joeyhage.daily-novena?cacheSeconds=3600&logo=visualstudiocode"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=joeyhage.daily-novena">
    <img alt="VS Code Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/joeyhage.daily-novena?cacheSeconds=3600&logo=visualstudiocode"></a>
</p>

Pray Novenas from [PrayMoreNovenas.com](https://www.praymorenovenas.com). Not affiliated in any way with PrayMoreNovenas.com.

## Features

### Using Command Palette (CMD/CTRL + Shift + P)

- `Novena: Pray`: Display prayer for current Novena and day. This also increments the current day by one. For example, if you are praying day one of the St. Therese of Lisieux Novena, it will change it to day two of the St. Therese of Lisieux Novena.
- `Novena: Choose`: Choose a Novena to pray. Choosing "Community Novena" will automatically choose the current Novena and day the PrayMoreNovenas community is praying.
- `Novena: Change day`: Change day of the current Novena to pray.

<!--\!\[feature X\]\(images/feature-x.png\)-->

### Extension Settings

These settings are specific to VS Code and need to be set in the VS Code settings file. See the [documentation](https://code.visualstudio.com/docs/getstarted/settings) for how to do that.

### dailyNovena.remindOnStartup (default: `true`)

Each time VS Code starts, check to see if you have prayed yet for the day. If not, ask you if you would like to continue the current Novena.

#### dailyNovena.logLevel (default: `error`)

Set the Debug Level for logging messages.

## Issues

[Report a bug](https://github.com/joeyhage/daily-novena/issues/new?assignees=&labels=&template=bug_report.md)
