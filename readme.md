# On-Q

MHub hold-and-release tool. Listens to messages on a queue, lists them and sends them on another node on your cue.

See it working at http://firstlegoleague.github.io/on-q. It listens to your localhost.

## Usage

- Adjust the settings in the settings dialog by pressing the gear icon.
- Point to the correct mhub server and nodes
- Configure your mhub server to route messages you want to cue to the input node for On-Q.
- Configure your mhub server to route messages from the output node for On-Q to the destinations you desire.

## Example mhub configuration

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