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

const lsTemplate = ['Name', 'State', 'Url'].map((k) => `"${k}": "{{.${k}}}"`).join(', ')

const machine = {

  ls: () => cmd(`docker-machine ls --format '${{lsTemplate}}'`),

  find: (name) => this.ls().then(r => r.find(e => e.Name === name)),

  exist: function (name) {
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

  rm: (machineName) => cmd('docker-machine rm -y ' + machineName),

  active: () => cmd('docker-machine active'),

  inspect: (machineName) => cmd(`docker-machine inspect ${machineName}`).then(safeParse),

  provision: (machineName) => cmd(`docker-machine provision ${machineName}`),

  regenerateCerts: (machineName) => cmd(`docker-machine regenerate-certs -f ${machineName}`),

  kill: (machineName) => cmd(`docker-machine kill ${machineName}`),

  start: (machineName) => cmd(`docker-machine start ${machineName}`),

  stop: (machineName) => cmd(`docker-machine stop ${machineName}`),

  restart: (machineName) => cmd(`docker-machine restart ${machineName}`),

  upgrade: (machineName) => cmd(`docker-machine upgrade ${machineName}`),

  ssh: (machineName, command) => cmd(`docker-machine ssh ${machineName} ${command}`),

  scp: (path1, path2) => cmd(`docker-machine scp ${path1} ${path2}`),

  url: (machineName) => cmd(`docker-machine url ${machineName}`),

  ip: (machineName) => cmd('docker-machine ip ' + machineName).then((stdout) => stdout.trim()),

  status: function (machineName) {
    return new Promise((resolve) => {
      cmd('docker-machine status ' + machineName)
        .then((stdout) => stdout.toLowerCase())
        .then((stdout) => stdout.trim())
        .then((status) => resolve(status))
        .catch(() => resolve('unreachable'))
    })
  }
}

module.exports = machine
