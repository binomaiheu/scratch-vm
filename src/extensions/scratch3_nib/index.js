const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const formatMessage = require('format-message');

var mqtt = require('mqtt');

/**
 * Icon svg to be displayed in the blocks category menu, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMzFtbSIKICAgaGVpZ2h0PSIxNW1tIgogICB2aWV3Qm94PSIwIDAgMzEgMTUiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMyAoMjQwNTU0NiwgMjAxOC0wMy0xMSkiPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyIj4KICAgIDxpbmtzY2FwZTpwZXJzcGVjdGl2ZQogICAgICAgc29kaXBvZGk6dHlwZT0iaW5rc2NhcGU6cGVyc3AzZCIKICAgICAgIGlua3NjYXBlOnZwX3g9Ii0xLjQ1NTQzOSA6IDQuMjUwNDc1MiA6IDEiCiAgICAgICBpbmtzY2FwZTp2cF95PSIwIDogMzQ5Ljg3NTE5IDogMCIKICAgICAgIGlua3NjYXBlOnZwX3o9IjU5LjQxMjc2IDogNC4yNTA0NzUyIDogMSIKICAgICAgIGlua3NjYXBlOnBlcnNwM2Qtb3JpZ2luPSIyOC45Nzg2NCA6IC0xMy4wNjgzOTMgOiAxIgogICAgICAgaWQ9InBlcnNwZWN0aXZlODE5IiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMC45MDUwOTY2OCIKICAgICBpbmtzY2FwZTpjeD0iLTQzLjgzNjczOSIKICAgICBpbmtzY2FwZTpjeT0iMjc3LjIxMTU0IgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMDE3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iLTgiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMTAwIgogICAgIGZpdC1tYXJnaW4tYm90dG9tPSIyNTAiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iTGF5ZXIgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtMjgyKSI+CiAgICA8dGV4dAogICAgICAgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIKICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zaXplOjEwLjU4MzMzMzAycHg7bGluZS1oZWlnaHQ6MS4yNTtmb250LWZhbWlseTpzYW5zLXNlcmlmO2xldHRlci1zcGFjaW5nOjBweDt3b3JkLXNwYWNpbmc6MHB4O2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4yNjQ1ODMzMiIKICAgICAgIHg9IjEuNjA4Nzg5MiIKICAgICAgIHk9IjI5NC4xMjA0NSIKICAgICAgIGlkPSJ0ZXh0ODE3Ij48dHNwYW4KICAgICAgICAgc29kaXBvZGk6cm9sZT0ibGluZSIKICAgICAgICAgaWQ9InRzcGFuODE1IgogICAgICAgICB4PSIxLjYwODc4OTIiCiAgICAgICAgIHk9IjI5NC4xMjA0NSIKICAgICAgICAgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1mYW1pbHk6VWJ1bnR1Oy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246VWJ1bnR1O3N0cm9rZS13aWR0aDowLjI2NDU4MzMyIj5uaWI8L3RzcGFuPjwvdGV4dD4KICAgIDxnCiAgICAgICBzb2RpcG9kaTp0eXBlPSJpbmtzY2FwZTpib3gzZCIKICAgICAgIGlkPSJnODIxIgogICAgICAgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMWYwMDtzdHJva2Utd2lkdGg6MC4zNzc5OTk5OTtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgaW5rc2NhcGU6cGVyc3BlY3RpdmVJRD0iI3BlcnNwZWN0aXZlODE5IgogICAgICAgaW5rc2NhcGU6Y29ybmVyMD0iMC41NzgzODIyNyA6IDAuMDgxMTg5Nzg5IDogMCA6IDEiCiAgICAgICBpbmtzY2FwZTpjb3JuZXI3PSIwLjIwNzgwNTU3IDogMC4wNDE3OTMwNTUgOiAwLjI1IDogMSI+CiAgICAgIDxwYXRoCiAgICAgICAgIHNvZGlwb2RpOnR5cGU9Imlua3NjYXBlOmJveDNkc2lkZSIKICAgICAgICAgaWQ9InBhdGg4MjMiCiAgICAgICAgIHN0eWxlPSJmaWxsOiMzNTM1NjQ7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMwMDFmMDA7c3Ryb2tlLXdpZHRoOjAuMzQ0NzUzNDQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGlua3NjYXBlOmJveDNkc2lkZXR5cGU9IjYiCiAgICAgICAgIGQ9Im0gMTcuODI2Mzc4LDI4NS43MjQ5OCB2IDguNzMyOTUgbCA1LjY4NjIyNiwtMC4yMzM2IHYgLTcuNTM4ODcgeiIKICAgICAgICAgcG9pbnRzPSIxNy44MjYzNzgsMjk0LjQ1NzkzIDIzLjUxMjYwNCwyOTQuMjI0MzMgMjMuNTEyNjA0LDI4Ni42ODU0NiAxNy44MjYzNzgsMjg1LjcyNDk4ICIgLz4KICAgICAgPHBhdGgKICAgICAgICAgc29kaXBvZGk6dHlwZT0iaW5rc2NhcGU6Ym94M2RzaWRlIgogICAgICAgICBpZD0icGF0aDgzMSIKICAgICAgICAgc3R5bGU9ImZpbGw6I2FmYWZkZTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzAwMWYwMDtzdHJva2Utd2lkdGg6MC4zNDQ3NTM0NDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgaW5rc2NhcGU6Ym94M2RzaWRldHlwZT0iMTMiCiAgICAgICAgIGQ9Im0gMTcuODI2Mzc4LDI5NC40NTc5MyA1LjkxNjAxMiwwLjUyNDE3IDYuMTE3MTM0LC0wLjM4Mjg3IC02LjM0NjkyLC0wLjM3NDkgeiIKICAgICAgICAgcG9pbnRzPSIyMy43NDIzOSwyOTQuOTgyMSAyOS44NTk1MjQsMjk0LjU5OTIzIDIzLjUxMjYwNCwyOTQuMjI0MzMgMTcuODI2Mzc4LDI5NC40NTc5MyAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIHNvZGlwb2RpOnR5cGU9Imlua3NjYXBlOmJveDNkc2lkZSIKICAgICAgICAgaWQ9InBhdGg4MzMiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlOWU5ZmY7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMwMDFmMDA7c3Ryb2tlLXdpZHRoOjAuMzQ0NzUzNDQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGlua3NjYXBlOmJveDNkc2lkZXR5cGU9IjExIgogICAgICAgICBkPSJtIDIzLjUxMjYwNCwyODYuNjg1NDYgNi4zNDY5MiwtMS41NDE0OSB2IDkuNDU1MjYgbCAtNi4zNDY5MiwtMC4zNzQ5IHoiCiAgICAgICAgIHBvaW50cz0iMjkuODU5NTI0LDI4NS4xNDM5NyAyOS44NTk1MjQsMjk0LjU5OTIzIDIzLjUxMjYwNCwyOTQuMjI0MzMgMjMuNTEyNjA0LDI4Ni42ODU0NiAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIHNvZGlwb2RpOnR5cGU9Imlua3NjYXBlOmJveDNkc2lkZSIKICAgICAgICAgaWQ9InBhdGg4MjUiCiAgICAgICAgIHN0eWxlPSJmaWxsOiM0ZDRkOWY7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMwMDFmMDA7c3Ryb2tlLXdpZHRoOjAuMzQ0NzUzNDQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGlua3NjYXBlOmJveDNkc2lkZXR5cGU9IjUiCiAgICAgICAgIGQ9Im0gMTcuODI2Mzc4LDI4NS43MjQ5OCA1LjkxNjAxMiwtMi4xNTUyNiA2LjExNzEzNCwxLjU3NDI1IC02LjM0NjkyLDEuNTQxNDkgeiIKICAgICAgICAgcG9pbnRzPSIyMy43NDIzOSwyODMuNTY5NzIgMjkuODU5NTI0LDI4NS4xNDM5NyAyMy41MTI2MDQsMjg2LjY4NTQ2IDE3LjgyNjM3OCwyODUuNzI0OTggIiAvPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTp0eXBlPSJpbmtzY2FwZTpib3gzZHNpZGUiCiAgICAgICAgIGlkPSJwYXRoODI5IgogICAgICAgICBzdHlsZT0iZmlsbDojZDdkN2ZmO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMDAxZjAwO3N0cm9rZS13aWR0aDowLjM0NDc1MzQ0O3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpbmtzY2FwZTpib3gzZHNpZGV0eXBlPSIxNCIKICAgICAgICAgZD0ibSAyMy43NDIzOSwyODMuNTY5NzIgdiAxMS40MTIzOCBsIDYuMTE3MTM0LC0wLjM4Mjg3IHYgLTkuNDU1MjYgeiIKICAgICAgICAgcG9pbnRzPSIyMy43NDIzOSwyOTQuOTgyMSAyOS44NTk1MjQsMjk0LjU5OTIzIDI5Ljg1OTUyNCwyODUuMTQzOTcgMjMuNzQyMzksMjgzLjU2OTcyICIgLz4KICAgICAgPHBhdGgKICAgICAgICAgc29kaXBvZGk6dHlwZT0iaW5rc2NhcGU6Ym94M2RzaWRlIgogICAgICAgICBpZD0icGF0aDgyNyIKICAgICAgICAgc3R5bGU9ImZpbGw6Izg2ODZiZjtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzAwMWYwMDtzdHJva2Utd2lkdGg6MC4zNDQ3NTM0NDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgaW5rc2NhcGU6Ym94M2RzaWRldHlwZT0iMyIKICAgICAgICAgZD0ibSAxNy44MjYzNzgsMjg1LjcyNDk4IDUuOTE2MDEyLC0yLjE1NTI2IHYgMTEuNDEyMzggbCAtNS45MTYwMTIsLTAuNTI0MTcgeiIKICAgICAgICAgcG9pbnRzPSIyMy43NDIzOSwyODMuNTY5NzIgMjMuNzQyMzksMjk0Ljk4MjEgMTcuODI2Mzc4LDI5NC40NTc5MyAxNy44MjYzNzgsMjg1LjcyNDk4ICIgLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo='

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiCiAgIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB3aWR0aD0iMTVtbSIKICAgaGVpZ2h0PSIxNW1tIgogICB2aWV3Qm94PSIwIDAgMTUgMTUiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzgiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuOTIuMyAoMjQwNTU0NiwgMjAxOC0wMy0xMSkiPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMyIj4KICAgIDxpbmtzY2FwZTpwZXJzcGVjdGl2ZQogICAgICAgc29kaXBvZGk6dHlwZT0iaW5rc2NhcGU6cGVyc3AzZCIKICAgICAgIGlua3NjYXBlOnZwX3g9Ii0xNy44MjU2OTggOiAzLjY2NTgyMzEgOiAxIgogICAgICAgaW5rc2NhcGU6dnBfeT0iMCA6IDM0OS44NzUxOSA6IDAiCiAgICAgICBpbmtzY2FwZTp2cF96PSI0My4wNDI1MDEgOiAzLjY2NTgyMzEgOiAxIgogICAgICAgaW5rc2NhcGU6cGVyc3AzZC1vcmlnaW49IjEyLjYwODM3OCA6IC0xMy42NTMwNDUgOiAxIgogICAgICAgaWQ9InBlcnNwZWN0aXZlODE5IiAvPgogIDwvZGVmcz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9ImJhc2UiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IgogICAgIGJvcmRlcm9wYWNpdHk9IjEuMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6em9vbT0iMC45MDUwOTY2OCIKICAgICBpbmtzY2FwZTpjeD0iLTQzLjgzNjczOSIKICAgICBpbmtzY2FwZTpjeT0iMjc3LjIxMTU0IgogICAgIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMDE3IgogICAgIGlua3NjYXBlOndpbmRvdy14PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iLTgiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIKICAgICBmaXQtbWFyZ2luLXRvcD0iMTAwIgogICAgIGZpdC1tYXJnaW4tYm90dG9tPSIyNTAiIC8+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhNSI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGcKICAgICBpbmtzY2FwZTpsYWJlbD0iTGF5ZXIgMSIKICAgICBpbmtzY2FwZTpncm91cG1vZGU9ImxheWVyIgogICAgIGlkPSJsYXllcjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtMjgyKSI+CiAgICA8ZwogICAgICAgc29kaXBvZGk6dHlwZT0iaW5rc2NhcGU6Ym94M2QiCiAgICAgICBpZD0iZzgyMSIKICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDFmMDA7c3Ryb2tlLXdpZHRoOjAuMzc3OTk5OTk7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgIGlua3NjYXBlOnBlcnNwZWN0aXZlSUQ9IiNwZXJzcGVjdGl2ZTgxOSIKICAgICAgIGlua3NjYXBlOmNvcm5lcjA9IjAuNTc4MzgyMjcgOiAwLjA4MTE4OTc4OSA6IDAgOiAxIgogICAgICAgaW5rc2NhcGU6Y29ybmVyNz0iMC4yMDc4MDU1NyA6IDAuMDQxNzkzMDU1IDogMC4yNSA6IDEiPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTp0eXBlPSJpbmtzY2FwZTpib3gzZHNpZGUiCiAgICAgICAgIGlkPSJwYXRoODIzIgogICAgICAgICBzdHlsZT0iZmlsbDojMzUzNTY0O2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMDAxZjAwO3N0cm9rZS13aWR0aDowLjM0NDc1MzQ0O3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpbmtzY2FwZTpib3gzZHNpZGV0eXBlPSI2IgogICAgICAgICBkPSJtIDEuNDU2MTE3NywyODYuMzA5NjMgdiA4LjczMjk1IGwgNS42ODYyMjY1LC0wLjIzMzU5IHYgLTcuNTM4ODggeiIKICAgICAgICAgcG9pbnRzPSIxLjQ1NjExNzcsMjk1LjA0MjU4IDcuMTQyMzQ0MiwyOTQuODA4OTkgNy4xNDIzNDQyLDI4Ny4yNzAxMSAxLjQ1NjExNzcsMjg2LjMwOTYzICIgLz4KICAgICAgPHBhdGgKICAgICAgICAgc29kaXBvZGk6dHlwZT0iaW5rc2NhcGU6Ym94M2RzaWRlIgogICAgICAgICBpZD0icGF0aDgzMSIKICAgICAgICAgc3R5bGU9ImZpbGw6I2FmYWZkZTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzAwMWYwMDtzdHJva2Utd2lkdGg6MC4zNDQ3NTM0NDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgaW5rc2NhcGU6Ym94M2RzaWRldHlwZT0iMTMiCiAgICAgICAgIGQ9Im0gMS40NTYxMTc3LDI5NS4wNDI1OCA1LjkxNjAxMTQsMC41MjQxNyA2LjExNzEzNDksLTAuMzgyODYgLTYuMzQ2OTE5OCwtMC4zNzQ5IHoiCiAgICAgICAgIHBvaW50cz0iNy4zNzIxMjkxLDI5NS41NjY3NSAxMy40ODkyNjQsMjk1LjE4Mzg5IDcuMTQyMzQ0MiwyOTQuODA4OTkgMS40NTYxMTc3LDI5NS4wNDI1OCAiIC8+CiAgICAgIDxwYXRoCiAgICAgICAgIHNvZGlwb2RpOnR5cGU9Imlua3NjYXBlOmJveDNkc2lkZSIKICAgICAgICAgaWQ9InBhdGg4MzMiCiAgICAgICAgIHN0eWxlPSJmaWxsOiNlOWU5ZmY7ZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlOiMwMDFmMDA7c3Ryb2tlLXdpZHRoOjAuMzQ0NzUzNDQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGlua3NjYXBlOmJveDNkc2lkZXR5cGU9IjExIgogICAgICAgICBkPSJtIDcuMTQyMzQ0MiwyODcuMjcwMTEgNi4zNDY5MTk4LC0xLjU0MTQ5IHYgOS40NTUyNyBsIC02LjM0NjkxOTgsLTAuMzc0OSB6IgogICAgICAgICBwb2ludHM9IjEzLjQ4OTI2NCwyODUuNzI4NjIgMTMuNDg5MjY0LDI5NS4xODM4OSA3LjE0MjM0NDIsMjk0LjgwODk5IDcuMTQyMzQ0MiwyODcuMjcwMTEgIiAvPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTp0eXBlPSJpbmtzY2FwZTpib3gzZHNpZGUiCiAgICAgICAgIGlkPSJwYXRoODI1IgogICAgICAgICBzdHlsZT0iZmlsbDojNGQ0ZDlmO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMDAxZjAwO3N0cm9rZS13aWR0aDowLjM0NDc1MzQ0O3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpbmtzY2FwZTpib3gzZHNpZGV0eXBlPSI1IgogICAgICAgICBkPSJtIDEuNDU2MTE3NywyODYuMzA5NjMgNS45MTYwMTE0LC0yLjE1NTI2IDYuMTE3MTM0OSwxLjU3NDI1IC02LjM0NjkxOTgsMS41NDE0OSB6IgogICAgICAgICBwb2ludHM9IjcuMzcyMTI5MSwyODQuMTU0MzcgMTMuNDg5MjY0LDI4NS43Mjg2MiA3LjE0MjM0NDIsMjg3LjI3MDExIDEuNDU2MTE3NywyODYuMzA5NjMgIiAvPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTp0eXBlPSJpbmtzY2FwZTpib3gzZHNpZGUiCiAgICAgICAgIGlkPSJwYXRoODI5IgogICAgICAgICBzdHlsZT0iZmlsbDojZDdkN2ZmO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMDAxZjAwO3N0cm9rZS13aWR0aDowLjM0NDc1MzQ0O3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpbmtzY2FwZTpib3gzZHNpZGV0eXBlPSIxNCIKICAgICAgICAgZD0ibSA3LjM3MjEyOTEsMjg0LjE1NDM3IHYgMTEuNDEyMzggbCA2LjExNzEzNDksLTAuMzgyODYgdiAtOS40NTUyNyB6IgogICAgICAgICBwb2ludHM9IjcuMzcyMTI5MSwyOTUuNTY2NzUgMTMuNDg5MjY0LDI5NS4xODM4OSAxMy40ODkyNjQsMjg1LjcyODYyIDcuMzcyMTI5MSwyODQuMTU0MzcgIiAvPgogICAgICA8cGF0aAogICAgICAgICBzb2RpcG9kaTp0eXBlPSJpbmtzY2FwZTpib3gzZHNpZGUiCiAgICAgICAgIGlkPSJwYXRoODI3IgogICAgICAgICBzdHlsZT0iZmlsbDojODY4NmJmO2ZpbGwtcnVsZTpldmVub2RkO3N0cm9rZTojMDAxZjAwO3N0cm9rZS13aWR0aDowLjM0NDc1MzQ0O3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpbmtzY2FwZTpib3gzZHNpZGV0eXBlPSIzIgogICAgICAgICBkPSJtIDEuNDU2MTE3NywyODYuMzA5NjMgNS45MTYwMTE0LC0yLjE1NTI2IHYgMTEuNDEyMzggbCAtNS45MTYwMTE0LC0wLjUyNDE3IHoiCiAgICAgICAgIHBvaW50cz0iNy4zNzIxMjkxLDI4NC4xNTQzNyA3LjM3MjEyOTEsMjk1LjU2Njc1IDEuNDU2MTE3NywyOTUuMDQyNTggMS40NTYxMTc3LDI4Ni4zMDk2MyAiIC8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K';

var recv = {};
var recv_msg = {};

/**
 * Class for the nib extension for Scratch 3
 * @constructor
 */
class Scratch3NibBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    

        this.runtime.on('PROJECT_STOP_ALL', this.disconnectFromBroker);
	    
        this._client = null;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     * template: see : https://github.com/LLK/scratch-vm/wiki/Scratch-3.0-Extensions-Specification
     */
    getInfo () {
        return {
            id: 'nib',
            name: 'nib extensions', 
            blockIconURI: blockIconURI,
            menuIconURI: menuIconURI,
            blocks: [
                {
                    opcode: 'connectToBroker',
                    text: formatMessage({
                        id: 'nib.connectToBroker',
                        default: 'connect to [URL] port [PORT]',
                        description: 'connect to broker'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultServer',
                                default: '127.0.0.1',
                                description: 'default URL to connect to'
                            })
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultPort',
                                default: '8083',
                                description: 'default port to connect to'
                            })
                        }
                    }
                },
                {
                    opcode: 'connectToSecureBroker',
                    text: formatMessage({
                        id: 'nib.connectToSecureBroker',
                        default: 'connect to secure [URL] port [PORT]',
                        description: 'connect to secure broker over ssl'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultServer',
                                default: '127.0.0.1',
                                description: 'default URL to connect to'
                            })
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultPort',
                                default: '8083',
                                description: 'default port to connect to'
                            })
                        }
                    }
                },
                {
                    opcode: 'disconnectFromBroker',
                    text: formatMessage({
                        id: 'nib.disconnectFromBroker',
                        default: 'disconnect',
                        description: 'disconnect from broker'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'publish',
                    text: formatMessage({
                        id: 'nib.publish',
                        default: 'publish on [CHANNEL] : [MESSAGE]',
                        description: 'publishes the message to the channel'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultChannel',
                                default: 'scratch3-mqtt',
                                description: 'default channel to publish'
                            })
                        },
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultMessage',
                                default: 'hello world',
                                description: 'default message to publish'
                            })
                        }
                    }
                },
                {
                    opcode: 'subscribe',
                    text: formatMessage({
                        id: 'nib.subscribe',
                        default: 'subscribe to [CHANNEL]',
                        description: 'subscribes to the channel'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultSubscribeChannel',
                                default: 'scratch3-mqtt',
                                description: 'default channel to subscribe'
                            })
                        }
                    }
                },
                {
                    opcode: 'unsubscribe',
                    text: formatMessage({
                        id: 'nib.unsubscribe',
                        default: 'unsubscribe from [CHANNEL]',
                        description: 'unsubscribes from the channel'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultUnsubscribeChannel',
                                default: 'scratch3-mqtt',
                                description: 'default channel to unsubscribe'
                            })
                        }
                    }
                },		 		        
                {
		            opcode: 'isConnected',
                    text: formatMessage({
                        id: 'nib.isConnected',
                        default: 'is connected',
                        description: 'checks whether we are connected'
                    }),
                    blockType: BlockType.BOOLEAN
                },
                {
		            opcode: 'received',
                    text: formatMessage({
                        id: 'nib.received',
                        default: 'received on [CHANNEL]',
                        description: 'starts when we received a messge on the channel'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultReceivedChannel',
                                default: 'scratch3-mqtt',
                                description: 'default channel to receive'
                            })
                        }
                    }
                },
                {
                    opcode: 'message',
                    text: formatMessage({
                        id: 'nib.message',
                        default: 'last message on [CHANNEL]',
                        description: 'gets the last message on the channel'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'nib.defaultReceivedChannelMessage',
                                default: 'scratch3-mqtt',
                                description: 'default channel to receive'
                            })
                        }
                    }
                }

            ],
            menus: {
            }
        }
    }

    isConnected(){
        if ( ! this._client ) return false;
        return this._client.connected;
    }

    connectToBroker( args ) {
        
        if ( this._client ) {
          if ( this._client.connected == true ) {
                this._client.end();
            } 
        }

        // setup the connection
        console.log( "Connecting to MQTT broker " + args.URL + ":" + args.PORT );
        this._client = mqtt.connect( "ws://" + args.URL + ":" + args.PORT );
 
        this._client.on('connect',function(){
            console.log( "connected !" );
        });
        
        this._client.on('message', function(topic,message){
            console.log("received message on " + topic);
            console.log(message.toString());

            recv[topic] = true;
            recv_msg[topic] = message.toString();
        });

    }

    connectToSecureBroker( args ) {
        
        if ( this._client ) {
          if ( this._client.connected == true ) {
                this._client.end();
            } 
        }

        // setup the connection
        console.log( "Connecting to Secure MQTT broker " + args.URL + ":" + args.PORT );
        this._client = mqtt.connect( "wss://" + args.URL + ":" + args.PORT );
 
        this._client.on('connect',function(){
            console.log( "connected !" );
        });
        
        this._client.on('message', function(topic,message){
            console.log("received message on " + topic);
            console.log(message.toString());

            recv[topic] = true;
            recv_msg[topic] = message.toString();
        });

    }

    received( args ) {
        if ( recv[args.CHANNEL] == true ) {
            recv[args.CHANNEL] = false;
            return true
        }
        return false;
    }

    message(args) {
        return recv_msg[args.CHANNEL];
    }

    disconnectFromBroker(args) {
        console.log("Disconnecting from MQTT broker... ");
        if ( this._client != null ) {  this._client.end(); }
    }

    subscribe( args ) {
        if ( this._client != null ) {
            if ( this._client.connected == true ) {
                this._client.subscribe( args.CHANNEL );
                console.log( "subscribed to " + args.CHANNEL );
            }  else {
                console.warn("cannot subscribe, not connected...");
            } 
        }
    }

    unsubscribe( args ) {
        if ( this._client != null ) {
            if ( this._client.connected == true ) {
                this._client.unsubscribe( args.CHANNEL );
                console.log( "unsubscribed to " + args.CHANNEL );
            }  else {
                console.warn("cannot unsubscribe, not connected...");
            } 
        }
    }

    publish( args ) {
        if ( this._client.connected == true ) {
            console.log( "publish channel: " + args.CHANNEL + ", message: " + args.MESSAGE );
            this._client.publish( args.CHANNEL, args.MESSAGE );
        } else {
            console.warn( "publish: unable to proceed, not connected" );
        }
    }

}

module.exports = Scratch3NibBlocks;
