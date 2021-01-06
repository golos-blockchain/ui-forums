## Tool to fix post/comment count statistics in forum categories

For Windows and UNIX (Linux or macOS).

Requires [Node.js 10 or newer](https://github.com/nodesource/distributions/blob/master/README.md).

Following fields should be filled in `config.js` to use this tool:
- GOLOS_NODE
- FORUM._id
- FORUM.creator

Usage for Windows: double-click the `fix.bat` file.  
Or, if some problems, start the PowerShell in current folder and run:
```
./fix.bat
```

Usage for UNIX:
```
./fix.sh
```
