/**
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

const { exec } = require('child_process')
const debug = require('debug')('docker-machine')
const { safeParse, quotifyArg } = require('./utils')

// A promise-ready version of child_process.exec
function cmd (line) {
  return new Promise((resolve, reject) => {
    debug(line)
    exec(line, (error, stdout, stderr) => {
      if (error) return reject(stderr)
      resolve(stdout)
    })
  })
}

const machine = {

    ls: function () {
        const template = ["Name", "State", "URL"].map((k) => `"${k}": "{{.${k}}}"`).join(', ')
        return cmd(`docker-machine ls --format '{ ${template} }'`)
            .then((stdout) =>
                stdout.split('\n')
                    .map(r => safeParse(r))
                    .filter( r => r != null )
            )
    },

    find: function(name) {
        this.ls()
            .then((r) => r.find((e) => e['Name'] == name))
    },

    exist: function(name) {
        return new Promise((resolve) => {
            this.inspect(name)
                .then((json) => resolve(json))
                .catch(() => resolve(false))
        })
    },

    create: function (machineName, options) {
        const flags = Object.keys(options)
            .map((k) => `--${k} ${quotifyArg(options[k])}`)
            .join(' ')

        return cmd(`docker-machine create ${flags} ${machineName}`)
    },

    rm: function (machineName) {
        return cmd('docker-machine rm -y ' + machineName)
    },

    active: function () {
        return cmd('docker-machine active')
    },

    inspect: function (machineName) {
        return cmd('docker-machine inspect ' + machineName)
            .then((stdout) => safeParse(stdout))
    },

    provision: function (machineName) {
        return cmd('docker-machine provision ' + machineName)
    },

    regenerateCerts: function (machineName) {
        return cmd('docker-machine regenerate-certs -f ' + machineName)
    },

    kill: function (machineName) {
        return cmd('docker-machine kill ' + machineName)
    },

    start: function (machineName) {
        return cmd('docker-machine start ' + machineName)
    },

    stop: function (machineName) {
        return cmd('docker-machine stop ' + machineName)
    },

    restart: function (machineName) {
        return cmd('docker-machine restart ' + machineName)
    },

    upgrade: function (machineName) {
        return cmd('docker-machine upgrade ' + machineName)
    },

    ssh: function (machineName, command) {
        return cmd('docker-machine ssh ' + machineName + ' ' + command)
    },

    scp: function (path1, path2) {
        return cmd(`docker-machine scp ${path1} ${path2}`)
    },

    url: function (machineName) {
        return cmd('docker-machine url ' + machineName)
    },

    ip: function (machineName) {
        return cmd('docker-machine ip ' + machineName)
            .then((stdout) => stdout.trim())
    },
    status: function(machineName) {
        return new Promise((resolve) => {
            cmd('docker-machine status ' + machineName)
                .then((stdout) => stdout.toLowerCase())
                .then((stdout) => stdout.trim())
                .then((status) => resolve(status))
                .catch(() => resolve('inactive'))
        })
    }
}

module.exports = machine
