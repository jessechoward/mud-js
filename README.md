# MUD-js
A text based MUD engine in Node.js based loosely on popular table top dice rules

## Features
- Browser based client only. No 3rd party clients giving people an unfair advantage.
- Works on any platform that supports [websockets ](https://caniuse.com/#feat=websockets), even phones and tablets.
- Browser based editor for creating/editing the world.

## Server Setup
*From this point on I assume you are working locally in a bash shell on mac/linux or on windows git-bash. There are ways to do this natively in windows powershell however I won't be covering them.*

First You will need to [install nodejs](https://nodejs.org/en/download/package-manager/) >= 8.x on your platform.

Then you will need to [install the yarn package manager](https://yarnpkg.com/en/docs/install).

The application uses [gulp] to handle automated "build" tasks such as linting, unit testing, etc. but is not required to run out of the box.

Clone this git repo.

In the project root, run `yarn` to install all of the dependencies including development (you should do this on first install). `yarn --production` if you know what you are doing and just want the production dependencies downloaded.

You will need to update `config/default.js` with the location of a public/private key pair used for signing JSON web tokens. A utility script to generate a pair is provided in `keys/gen_jeys.sh`. Just update the `keys` portion of the `<default|environment>.js` config file with the names of the generated configs.

Start the game with `yarn start` and browse to http://localhost:5000. You should be able to register a user and login.

## Game Configuration
MUD-js uses configuration files for most settings. `config/default.json` has all of the default configs to run the game. If you specify a NODE_ENV of `production` or some other name, the configuration library will look for a config file with that name in the `config` directory.

MUD-js supports a slew of environment variables to override/compliment default and envrionment based configuration files. The configuration files get picked up by git and aren't a good place for password storage. Check the `config/custom-environment-variables.js` file for reference. By design, the `.env` file is not tracked by git so may be useful to manage passwords.

## Contributing

## Licensing
"The code in this project is licensed under MIT license."
