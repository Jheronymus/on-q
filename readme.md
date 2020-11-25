# On-Q

MHub hold-and-release tool. Listens to messages on a queue, lists them and sends them on another node on your cue.

See it working at http://jheronymus.github.io/on-q. It listens to your localhost.

## Usage

For detailed, walk-through instructions, see below

- Adjust the settings in the settings dialog by pressing the gear icon.
- Point to the correct mhub server and nodes
- Configure your mhub server to route messages you want to cue to the input node for On-Q.
- Configure your mhub server to route messages from the output node for On-Q to the destinations you desire.

As an alternative for setting up the configuration from the user interface, you can also modify the config.js file *before* launching the application for the first time.

## Example mhub configuration (`server.conf.json`)

Example for use in [FIRST LEGO League National Finals](https://github.com/FirstLegoLeague/General-IT/wiki/Scenarios#national-finals)

	{
		"port": 13900,
		"nodes": ["default", "test", "onq-in", "onq-out", "overlay", "scoring"],
		"bindings": [
			{ "from": "scoring", "to": "onq-in", "pattern": "*" },
			{ "from": "onq-out", "to": "overlay", "pattern": "*" }
		]
	}

For more information see [the MHub documentation](https://github.com/poelstra/mhub)

## Example setup walk-through

- change `server.conf.json` in your mserver as per the above
- start mserver by typing `mserver`
- go to http://jheronymus.github.io/on-q the top bar should be blue, indicating it is connected
- if the top bar is grey, there is a connection error. Check the settings (gear icon). It should be like:
  - host: `ws://localhost:13900` (this should match the port in your mserver configuration)
  - input node: `onq-in` (this should match the nodes in your mserver configuration)
  - output node: `onq-out` (this should match the nodes in your mserver configuration)

### capturing messages

- send any message to the `onq-in` node. For example by typing in the command line: `mclient -n onq-in -t test -d '["hello","there"]'`
- note the message appear in the interface. Note that topics are grouped in tabs. In this case `test`.
- press `forward` to forward the message to the `onq-out` node. Note that it appears in the mserver log

### ad hoc publishing

- create a new message by pressing the (+) button
- enter a topic, like `test`
- enter some data, like

        - hello
        - world
      
- press ok

The message is added. Note that topics are grouped in tabs. You can now forward the message by pressing `forward`. It should be displayed in the mserver log

## Local installation

- install nodejs from <https://nodejs.org/>
- open a command window (from the start menu, type `cmd` and press enter)
- open the folder where you downloaded on-q (in the command window)
- type `npm install`
- type `npm start`
- you can now open the application by navigating to <http://localhost:1393>
