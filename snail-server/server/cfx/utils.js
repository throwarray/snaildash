function GetPlayers () {
	const indice_count = global.GetNumPlayerIndices() || 0
	const players = new Array(indice_count)

	for (let i = 0; i < indice_count; i++) {
		players[i] = global.GetPlayerFromIndex(i)
	}

	return players
}

function GetPlayerIdentifiers (id) {
	const identifier_count = global.GetNumPlayerIdentifiers(id) || 0
	const identifiers = new Array(identifier_count)

	for (let k = 0; k < identifier_count; k++) {
		identifiers[k] =  global.GetPlayerIdentifier(id, k)
	}

	return identifiers
}

function Player (id) {
	return {
		id,
		identifiers: GetPlayerIdentifiers(id),
		guid: global.GetPlayerGuid(id),
		ping: global.GetPlayerPing(id),
		endpoint: global.GetPlayerEndpoint(id),
		name: global.GetPlayerName(id)
	}
}

function GetPlayerLicense (src) {
	let i = 0, ident
	const len = global.GetNumPlayerIdentifiers(src)

	for (; i < len; i++) {
		ident = global.GetPlayerIdentifier(src, i)
		if (ident && ident.startsWith('license')) return ident
	}
}

function GetPlayerSteamId (src) {
	let i = 0, ident
	const len = global.GetNumPlayerIdentifiers(src)

	for (; i < len; i++) {
		ident = global.GetPlayerIdentifier(src, i)
		if (ident && ident.startsWith('steam')) return ident
	}
}

function GetPlayerInstances () {
	const players = GetPlayers()
	const count = players.length || 0

	for (let i = 0; i < count; i++) {
		const id = players[i]

		players[i] = Player(id)
	}

	return players
}

const PlayerRemotes = Object.create(null)

module.exports = {
	Player,
	GetPlayerIdentifiers,
	GetPlayers,
	GetPlayerInstances,
	GetPlayerLicense,
	GetPlayerSteamId,
	PlayerRemotes,
	NOOP: function () {}
}
