YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "FileCopier",
        "Velocity",
        "Velocity                                                                                                   // 12\n/                                                                                                                  // 13\nVelocity = {};                                                                                                       // 14\n                                                                                                                    // 15\n(function () {                                                                                                       // 16\n 'use strict';                                                                                                      // 17\n                                                                                                                    // 18\n//////////////////////////////////////////////////////////////////////                                               // 19\n// Init                                                                                                              // 20\n//                                                                                                                   // 21\n                                                                                                                    // 22\n if (process.env.NODE_ENV !== 'development' || process.env.VELOCITY === '0' || process.env.IS_MIRROR) {             // 23\n   DEBUG && console.log('Not adding velocity code');                                                                // 24\n   return;                                                                                                          // 25\n }                                                                                                                  // 26\n                                                                                                                    // 27\n var isMeteor92OrNewer = function () {                                                                              // 28\n   if (Meteor.release) {                                                                                            // 29\n     var versionRegExp = /(?:METEOR@)?(\\d+)\\.(\\d+)\\.(\\d+)(?:\\.(\\d+))/;                                              // 30\n     var version = versionRegExp.exec(Meteor.release);                                                              // 31\n     if (version) {                                                                                                 // 32\n       var majorVersion = Number(version[1]);                                                                       // 33\n       var minorVersion = Number(version[2]);                                                                       // 34\n       var patchVersion = Number(version[3]);                                                                       // 35\n       if (majorVersion > 0 ||                                                                                      // 36\n         (majorVersion == 0 && minorVersion > 9) ||                                                                 // 37\n         (majorVersion == 0 && minorVersion == 9 && patchVersion >= 2)                                              // 38\n         ) {                                                                                                        // 39\n         return true;                                                                                               // 40\n       }                                                                                                            // 41\n     }                                                                                                              // 42\n   }                                                                                                                // 43\n                                                                                                                    // 44\n   return false;                                                                                                    // 45\n };                                                                                                                 // 46\n                                                                                                                    // 47\n var getAssetPath = function (packageName, fileName) {                                                              // 48\n   var serverAssetsPath = path.join(                                                                                // 49\n     process.env.PWD, '.meteor', 'local', 'build', 'programs', 'server', 'assets'                                   // 50\n   );                                                                                                               // 51\n   if (isMeteor92OrNewer()) {                                                                                       // 52\n     packageName = packageName.replace(':', '_')                                                                    // 53\n   }                                                                                                                // 54\n                                                                                                                    // 55\n   return path.join(serverAssetsPath, 'packages', packageName, fileName);                                           // 56\n };                                                                                                                 // 57\n                                                                                                                    // 58\n var _ = Npm.require('lodash'),                                                                                     // 59\n     fs = Npm.require('fs'),                                                                                        // 60\n     fse = Npm.require('fs-extra'),                                                                                 // 61\n     readFile = Meteor._wrapAsync(fs.readFile),                                                                     // 62\n     writeFile = Meteor._wrapAsync(fs.writeFile),                                                                   // 63\n     copyFile = Meteor._wrapAsync(fse.copy),                                                                        // 64\n     path = Npm.require('path'),                                                                                    // 65\n     url = Npm.require('url'),                                                                                      // 66\n     Rsync = Npm.require('rsync'),                                                                                  // 67\n     Future = Npm.require('fibers/future'),                                                                         // 68\n     freeport = Npm.require('freeport'),                                                                            // 69\n     child_process = Npm.require('child_process'),                                                                  // 70\n     spawn = child_process.spawn,                                                                                   // 71\n     chokidar = Npm.require('chokidar'),                                                                            // 72\n     glob = Npm.require('glob'),                                                                                    // 73\n     _config = {},                                                                                                  // 74\n     _preProcessors = [],                                                                                           // 75\n     _postProcessors = [],                                                                                          // 76\n     _watcher,                                                                                                      // 77\n     FIXTURE_REG_EXP = new RegExp(\"-fixture.(js|coffee)$\"),                                                         // 78\n     DEFAULT_FIXTURE_PATH = getAssetPath('velocity:core', 'default-fixture.js');                                    // 79\n                                                                                                                    // 80\n Meteor.startup(function initializeVelocity () {                                                                    // 81\n   DEBUG && console.log('[velocity] PWD', process.env.PWD);                                                         // 82\n   DEBUG && console.log('velocity config =', JSON.stringify(_config, null, 2));                                     // 83\n                                                                                                                    // 84\n   // kick-off everything                                                                                           // 85\n   _reset(_config);                                                                                                 // 86\n });                                                                                                                // 87\n                                                                                                                    // 88\n//////////////////////////////////////////////////////////////////////                                               // 89\n// Public Methods                                                                                                    // 90\n//                                                                                                                   // 91\n                                                                                                                    // 92\n _.extend(Velocity, {                                                                                               // 93\n                                                                                                                    // 94\n   getMirrorPath: function () {                                                                                     // 95\n     return path.join(process.env.PWD, '.meteor', 'local', '.mirror');                                              // 96\n   },                                                                                                               // 97\n                                                                                                                    // 98\n   getTestsPath: function () {                                                                                      // 99\n     return path.join(process.env.PWD, 'tests');                                                                    // 100\n   },                                                                                                               // 101\n                                                                                                                    // 102\n   addPreProcessor: function (preProcessor) {                                                                       // 103\n     _preProcessors.push(preProcessor);                                                                             // 104\n   },                                                                                                               // 105\n                                                                                                                    // 106\n   addPostProcessor: function (reporter) {                                                                          // 107\n     _postProcessors.push(reporter);                                                                                // 108\n   },                                                                                                               // 109\n                                                                                                                    // 110\n   getReportGithubIssueMessage: function() {                                                                        // 111\n     return \"Please report the issue here: https://github.com/xolvio/velocity/issues\";                              // 112\n   }                                                                                                                // 113\n });                                                                                                                // 114\n                                                                                                                    // 115\n if (Meteor.isServer) {                                                                                             // 116\n   _.extend(Velocity, {                                                                                             // 117\n                                                                                                                    // 118\n     /**                                                                                                            // 119\nRegisters a testing framework plugin.                                                                       // 120\n                                                                                                            // 121",
        "_syncMirror                                                                                             // 812"
    ],
    "modules": [
        "Velocity",
        "Velocity                                                                                                  __ 9\n_                                                                                                                  __ 10\n_**                                                                                                                  __ 11"
    ],
    "allModules": [
        {
            "displayName": "Velocity",
            "name": "Velocity"
        },
        {
            "displayName": "Velocity                                                                                                  // 9\n/                                                                                                                  // 10\n/**                                                                                                                  // 11",
            "name": "Velocity                                                                                                  __ 9\n_                                                                                                                  __ 10\n_**                                                                                                                  __ 11"
        }
    ]
} };
});